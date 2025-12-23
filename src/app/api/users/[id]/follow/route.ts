import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { emitNewNotification } from '@/lib/socketEmitter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Toggle follow
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const currentUserId = session.user.id;

        if (currentUserId === id) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            );
        }

        await dbConnect();

        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId),
            User.findById(id),
        ]);

        if (!currentUser || !targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const isFollowing = currentUser.following.some(
            (followingId: any) => followingId.toString() === id
        );

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(
                (followingId: any) => followingId.toString() !== id
            );
            targetUser.followers = targetUser.followers.filter(
                (followerId: any) => followerId.toString() !== currentUserId
            );
        } else {
            // Follow
            currentUser.following.push(id as any);
            targetUser.followers.push(currentUserId as any);

            // Create notification
            const notification = await Notification.create({
                recipient: id,
                sender: currentUserId,
                type: 'follow',
            });
            // Emit real-time notification
            emitNewNotification(id, notification);
        }

        // Update counts
        currentUser.followingCount = currentUser.following.length;
        targetUser.followersCount = targetUser.followers.length;

        await Promise.all([currentUser.save(), targetUser.save()]);

        return NextResponse.json({
            isFollowing: !isFollowing,
            followersCount: targetUser.followersCount,
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
        });
    } catch (error: any) {
        console.error('Follow error:', error);
        return NextResponse.json(
            { error: 'Failed to follow/unfollow' },
            { status: 500 }
        );
    }
}

// GET - Get followers or following list
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'followers';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        await dbConnect();

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userIds = type === 'followers' ? user.followers : user.following;
        const total = userIds.length;
        const paginatedIds = userIds.slice((page - 1) * limit, page * limit);

        const users = await User.find({ _id: { $in: paginatedIds } })
            .select('name username avatar bio isVerified')
            .lean();

        const session = await auth();

        // Add isFollowing status for each user
        let currentUserFollowing: string[] = [];
        if (session?.user?.id) {
            const currentUser = await User.findById(session.user.id);
            currentUserFollowing = currentUser?.following.map((id: any) => id.toString()) || [];
        }

        const usersWithFollowStatus = users.map((u: any) => ({
            ...u,
            isFollowing: currentUserFollowing.includes(u._id.toString()),
        }));

        return NextResponse.json({
            users: usersWithFollowStatus,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get follow list error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
