import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import Notification from '@/models/Notification';
import { emitNewNotification } from '@/lib/socketEmitter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Toggle like on story
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
        await dbConnect();

        const story = await Story.findById(id);

        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        const userId = session.user.id;
        const isLiked = story.likes.some(
            (likeUserId: any) => likeUserId.toString() === userId
        );

        if (isLiked) {
            // Unlike
            story.likes = story.likes.filter(
                (likeUserId: any) => likeUserId.toString() !== userId
            );
        } else {
            // Like
            story.likes.push(userId as any);

            // Create notification (if not liking own story)
            if (story.author.toString() !== userId) {
                const notification = await Notification.create({
                    recipient: story.author,
                    sender: userId,
                    type: 'like',
                    story: story._id,
                });
                // Emit real-time notification
                emitNewNotification(story.author.toString(), notification);
            }
        }

        await story.save();

        return NextResponse.json({
            isLiked: !isLiked,
            likesCount: story.likesCount,
            message: isLiked ? 'Story unliked' : 'Story liked',
        });
    } catch (error: any) {
        console.error('Like story error:', error);
        return NextResponse.json(
            { error: 'Failed to like story' },
            { status: 500 }
        );
    }
}
