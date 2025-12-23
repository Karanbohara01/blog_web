import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET - Get unread notification count
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 });
        }

        await dbConnect();

        const count = await Notification.countDocuments({
            recipient: session.user.id,
            isRead: false,
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Get notification count error:', error);
        return NextResponse.json({ count: 0 });
    }
}
