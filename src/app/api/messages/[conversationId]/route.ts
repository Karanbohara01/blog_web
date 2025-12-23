import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Conversation, Message } from '@/models/Message';
import { emitNewMessage } from '@/lib/socketEmitter';

interface RouteParams {
    params: Promise<{ conversationId: string }>;
}

// GET - Get messages in a conversation
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { conversationId } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        await dbConnect();

        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: session.user.id,
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name username avatar')
            .lean();

        const total = await Message.countDocuments({ conversation: conversationId });

        // Mark messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                readBy: { $ne: session.user.id },
                sender: { $ne: session.user.id },
            },
            {
                $addToSet: { readBy: session.user.id },
            }
        );

        return NextResponse.json({
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: unknown) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// POST - Send a message
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { conversationId } = await params;
        const { content, attachments } = await request.json();

        if (!content && (!attachments || attachments.length === 0)) {
            return NextResponse.json(
                { error: 'Message content or attachments required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Verify user is part of conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: session.user.id,
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        const message = new Message({
            conversation: conversationId,
            sender: session.user.id,
            content: content?.trim() || '',
            attachments: attachments || [],
            readBy: [session.user.id],
        });
        await message.save();

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name username avatar');

        // Emit real-time notification to the recipient
        const recipientId = conversation.participants.find(
            (p: { toString: () => string }) => p.toString() !== session.user.id
        );
        if (recipientId) {
            emitNewMessage(recipientId.toString(), {
                conversationId,
                message: populatedMessage
            });
        }

        return NextResponse.json({
            message: populatedMessage,
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
