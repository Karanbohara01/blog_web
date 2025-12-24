import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ReadingProgress from '@/models/ReadingProgress';

// GET - Get user's reading progress for a story or all in-progress stories
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
        const storyId = searchParams.get('storyId');
        const limit = parseInt(searchParams.get('limit') || '20');

        await dbConnect();

        if (storyId) {
            // Get progress for specific story
            const progress = await ReadingProgress.findOne({
                user: session.user.id,
                story: storyId,
            });

            return NextResponse.json({
                progress: progress?.progress || 0,
                scrollPosition: progress?.scrollPosition || 0,
                completed: progress?.completed || false,
                lastReadAt: progress?.lastReadAt,
            });
        } else {
            // Get all in-progress stories (for "Continue Reading")
            const progressList = await ReadingProgress.find({
                user: session.user.id,
                completed: false,
                progress: { $gt: 0, $lt: 100 },
            })
                .sort({ lastReadAt: -1 })
                .limit(limit)
                .populate({
                    path: 'story',
                    populate: {
                        path: 'author',
                        select: 'name username avatar isVerified',
                    },
                })
                .lean();

            // Filter out deleted stories
            const validProgress = progressList.filter((p: any) => p.story);

            return NextResponse.json({
                stories: validProgress.map((p: any) => ({
                    ...p.story,
                    progress: p.progress,
                    scrollPosition: p.scrollPosition,
                    lastReadAt: p.lastReadAt,
                })),
            });
        }
    } catch (error: any) {
        console.error('Get progress error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}

// POST - Update reading progress
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { storyId, progress, scrollPosition } = await request.json();

        if (!storyId) {
            return NextResponse.json(
                { error: 'Story ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const progressValue = Math.min(100, Math.max(0, progress || 0));
        const completed = progressValue >= 95; // Mark as complete at 95%

        const updated = await ReadingProgress.findOneAndUpdate(
            { user: session.user.id, story: storyId },
            {
                $set: {
                    progress: progressValue,
                    scrollPosition: scrollPosition || 0,
                    lastReadAt: new Date(),
                    completed,
                },
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            progress: updated.progress,
            completed: updated.completed,
        });
    } catch (error: any) {
        console.error('Update progress error:', error);
        return NextResponse.json(
            { error: 'Failed to update progress' },
            { status: 500 }
        );
    }
}
