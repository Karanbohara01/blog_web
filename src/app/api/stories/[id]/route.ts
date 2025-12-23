import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import User from '@/models/User';
import Comment from '@/models/Comment';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single story
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        await dbConnect();

        const story = await Story.findById(id)
            .populate('author', 'name username avatar isVerified bio followersCount');

        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        const session = await auth();
        const isLiked = session?.user?.id
            ? story.likes.some((userId: any) => userId.toString() === session.user.id)
            : false;

        return NextResponse.json({
            story: {
                ...story.toObject(),
                isLiked,
            },
        });
    } catch (error: any) {
        console.error('Get story error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch story' },
            { status: 500 }
        );
    }
}

// PUT - Update story
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { content, images, tags, isPublic } = await request.json();

        await dbConnect();

        const story = await Story.findById(id);

        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        if (story.author.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to edit this story' },
                { status: 403 }
            );
        }

        story.content = content?.trim() || story.content;
        story.images = images || story.images;
        story.tags = tags || story.tags;
        story.isPublic = isPublic !== undefined ? isPublic : story.isPublic;

        await story.save();

        const updatedStory = await Story.findById(id)
            .populate('author', 'name username avatar isVerified');

        return NextResponse.json({
            story: updatedStory,
            message: 'Story updated successfully',
        });
    } catch (error: any) {
        console.error('Update story error:', error);
        return NextResponse.json(
            { error: 'Failed to update story' },
            { status: 500 }
        );
    }
}

// DELETE - Delete story
export async function DELETE(request: Request, { params }: RouteParams) {
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

        if (story.author.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to delete this story' },
                { status: 403 }
            );
        }

        // Delete all comments on this story
        await Comment.deleteMany({ story: id });

        // Delete the story
        await Story.findByIdAndDelete(id);

        // Update user's story count
        await User.findByIdAndUpdate(session.user.id, {
            $inc: { storiesCount: -1 },
        });

        return NextResponse.json({
            message: 'Story deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete story error:', error);
        return NextResponse.json(
            { error: 'Failed to delete story' },
            { status: 500 }
        );
    }
}
