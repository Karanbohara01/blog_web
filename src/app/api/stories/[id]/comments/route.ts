import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import Comment from '@/models/Comment';
import Notification from '@/models/Notification';
import { emitNewNotification } from '@/lib/socketEmitter';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get comments for a story
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const parentId = searchParams.get('parentId');

        await dbConnect();

        const query: any = { story: id };

        if (parentId) {
            query.parentComment = parentId;
        } else {
            query.parentComment = null; // Top-level comments only
        }

        const comments = await Comment.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name username avatar isVerified')
            .lean();

        const total = await Comment.countDocuments(query);

        const session = await auth();

        // Add isLiked and get reply count for each comment
        const commentsWithMeta = await Promise.all(
            comments.map(async (comment: any) => {
                const repliesCount = await Comment.countDocuments({ parentComment: comment._id });
                return {
                    ...comment,
                    repliesCount,
                    isLiked: session?.user?.id
                        ? comment.likes.some((id: any) => id.toString() === session.user.id)
                        : false,
                };
            })
        );

        return NextResponse.json({
            comments: commentsWithMeta,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST - Add a comment
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
        const { content, parentCommentId } = await request.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        if (content.length > 2000) {
            return NextResponse.json(
                { error: 'Comment is too long (max 2000 characters)' },
                { status: 400 }
            );
        }

        await dbConnect();

        const story = await Story.findById(id);
        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        // If replying to a comment, verify parent exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return NextResponse.json(
                    { error: 'Parent comment not found' },
                    { status: 404 }
                );
            }
            // Update parent's reply count
            parentComment.repliesCount = (parentComment.repliesCount || 0) + 1;
            await parentComment.save();
        }

        const comment = await Comment.create({
            story: id,
            author: session.user.id,
            content: content.trim(),
            parentComment: parentCommentId || null,
        });

        // Update story's comment count
        story.commentsCount = (story.commentsCount || 0) + 1;
        await story.save();

        // Create notification (if not commenting on own story)
        if (story.author.toString() !== session.user.id) {
            const notification = await Notification.create({
                recipient: story.author,
                sender: session.user.id,
                type: 'comment',
                story: story._id,
                comment: comment._id,
            });
            // Emit real-time notification
            emitNewNotification(story.author.toString(), notification);
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name username avatar isVerified');

        return NextResponse.json({
            comment: populatedComment,
            message: 'Comment added successfully',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Add comment error:', error);
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        );
    }
}
