import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Conversation, Message } from '@/models/Message';
import User from '@/models/User';

// GET - Get user's conversations
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const conversations = await Conversation.find({
            participants: session.user.id,
        })
            .sort({ lastMessageAt: -1 })
            .populate('participants', 'name username avatar isVerified')
            .populate('lastMessage')
            .lean();

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv: any) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    readBy: { $ne: session.user.id },
                    sender: { $ne: session.user.id },
                });

                // Get the other participant
                const otherParticipant = conv.participants.find(
                    (p: any) => p._id.toString() !== session.user.id
                );

                return {
                    ...conv,
                    unreadCount,
                    otherParticipant,
                };
            })
        );

        return NextResponse.json({
            conversations: conversationsWithUnread,
        });
    } catch (error: unknown) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST - Create or get conversation, and optionally send a message
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { recipientId, content, attachments } = await request.json();

        if (!recipientId) {
            return NextResponse.json(
                { error: 'Recipient is required' },
                { status: 400 }
            );
        }

        if (recipientId === session.user.id) {
            return NextResponse.json(
                { error: 'You cannot message yourself' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return NextResponse.json(
                { error: 'Recipient not found' },
                { status: 404 }
            );
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [session.user.id, recipientId] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [session.user.id, recipientId],
            });
            await conversation.save();
        }

        // If content or attachments provided, send a message
        if (content || (attachments && attachments.length > 0)) {
            const message = new Message({
                conversation: conversation._id,
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

            return NextResponse.json({
                conversation,
                message: populatedMessage,
            }, { status: 201 });
        }

        return NextResponse.json({
            conversation,
        });
    } catch (error: unknown) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
