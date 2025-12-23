import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Conversation, Message } from '@/models/Message';

// GET - Get total unread message count across all conversations
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 });
        }

        await dbConnect();

        // Get all conversations where user is a participant
        const conversations = await Conversation.find({
            participants: session.user.id,
        }).select('_id');

        const conversationIds = conversations.map(c => c._id);

        // Count all unread messages in those conversations
        const count = await Message.countDocuments({
            conversation: { $in: conversationIds },
            sender: { $ne: session.user.id },
            readBy: { $ne: session.user.id },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Get message count error:', error);
        return NextResponse.json({ count: 0 });
    }
}
