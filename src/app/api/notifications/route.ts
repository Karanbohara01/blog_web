import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET - Get user's notifications
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        await dbConnect();

        const query: any = { recipient: session.user.id };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name username avatar')
            .populate('story', 'content images')
            .lean();

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipient: session.user.id,
            isRead: false,
        });

        return NextResponse.json({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// PUT - Mark notifications as read
export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { notificationIds, markAllRead } = await request.json();

        await dbConnect();

        if (markAllRead) {
            await Notification.updateMany(
                { recipient: session.user.id, isRead: false },
                { isRead: true }
            );
        } else if (notificationIds && notificationIds.length > 0) {
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipient: session.user.id,
                },
                { isRead: true }
            );
        }

        return NextResponse.json({
            message: 'Notifications marked as read',
        });
    } catch (error: any) {
        console.error('Mark notifications read error:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}
