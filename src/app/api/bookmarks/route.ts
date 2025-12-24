import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import Story from '@/models/Story';

// GET - Get user's bookmarks
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

        await dbConnect();

        const bookmarks = await Bookmark.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'story',
                populate: {
                    path: 'author',
                    select: 'name username avatar isVerified',
                },
            })
            .lean();

        const total = await Bookmark.countDocuments({ user: session.user.id });

        // Filter out any bookmarks where story was deleted
        const validBookmarks = bookmarks.filter((b: any) => b.story);

        // Add isLiked and isBookmarked flags
        const storiesWithFlags = validBookmarks.map((bookmark: any) => ({
            ...bookmark.story,
            isBookmarked: true,
            isLiked: bookmark.story.likes?.some((l: any) => l.toString() === session.user?.id) || false,
            bookmarkedAt: bookmark.createdAt,
        }));

        return NextResponse.json({
            stories: storiesWithFlags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get bookmarks error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookmarks' },
            { status: 500 }
        );
    }
}

// POST - Toggle bookmark
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { storyId } = await request.json();

        if (!storyId) {
            return NextResponse.json(
                { error: 'Story ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        // Check if already bookmarked
        const existingBookmark = await Bookmark.findOne({
            user: session.user.id,
            story: storyId,
        });

        if (existingBookmark) {
            // Remove bookmark
            await Bookmark.deleteOne({ _id: existingBookmark._id });
            return NextResponse.json({
                bookmarked: false,
                message: 'Bookmark removed',
            });
        } else {
            // Add bookmark
            await Bookmark.create({
                user: session.user.id,
                story: storyId,
            });
            return NextResponse.json({
                bookmarked: true,
                message: 'Story bookmarked',
            });
        }
    } catch (error: any) {
        console.error('Toggle bookmark error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle bookmark' },
            { status: 500 }
        );
    }
}

// DELETE - Remove specific bookmark
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const storyId = searchParams.get('storyId');

        if (!storyId) {
            return NextResponse.json(
                { error: 'Story ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        await Bookmark.deleteOne({
            user: session.user.id,
            story: storyId,
        });

        return NextResponse.json({
            success: true,
            message: 'Bookmark removed',
        });
    } catch (error: any) {
        console.error('Delete bookmark error:', error);
        return NextResponse.json(
            { error: 'Failed to remove bookmark' },
            { status: 500 }
        );
    }
}
