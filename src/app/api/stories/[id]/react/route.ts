import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Story, { ReactionType } from '@/models/Story';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const VALID_REACTIONS: ReactionType[] = ['love', 'laugh', 'sad', 'fire', 'clap'];

// POST - Toggle reaction on a story
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
        const { reactionType } = await request.json();

        if (!reactionType || !VALID_REACTIONS.includes(reactionType)) {
            return NextResponse.json(
                { error: 'Invalid reaction type' },
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

        const userId = session.user.id;

        // Initialize reactions if not exists
        if (!story.reactions) {
            story.reactions = {
                love: [],
                laugh: [],
                sad: [],
                fire: [],
                clap: [],
            };
        }

        // Check if user already reacted with this type
        const currentReactions = story.reactions[reactionType as ReactionType] || [];
        const hasReacted = currentReactions.some(
            (reactUserId: any) => reactUserId.toString() === userId
        );

        // Remove user's reaction from all reaction types first
        for (const type of VALID_REACTIONS) {
            if (story.reactions[type]) {
                story.reactions[type] = story.reactions[type].filter(
                    (reactUserId: any) => reactUserId.toString() !== userId
                );
            }
        }

        // If user hadn't reacted with this type, add the reaction
        if (!hasReacted) {
            story.reactions[reactionType as ReactionType].push(userId as any);
        }

        // Update total reactions count
        story.reactionsCount = VALID_REACTIONS.reduce((total, type) => {
            return total + (story.reactions[type]?.length || 0);
        }, 0);

        await story.save();

        // Get updated reaction counts
        const reactionCounts = {
            love: story.reactions.love?.length || 0,
            laugh: story.reactions.laugh?.length || 0,
            sad: story.reactions.sad?.length || 0,
            fire: story.reactions.fire?.length || 0,
            clap: story.reactions.clap?.length || 0,
        };

        // Get user's current reaction
        let userReaction: ReactionType | null = null;
        for (const type of VALID_REACTIONS) {
            if (story.reactions[type]?.some((reactUserId: any) => reactUserId.toString() === userId)) {
                userReaction = type;
                break;
            }
        }

        return NextResponse.json({
            reactionCounts,
            totalReactions: story.reactionsCount,
            userReaction,
            message: hasReacted ? 'Reaction removed' : 'Reaction added',
        });
    } catch (error: any) {
        console.error('Reaction error:', error);
        return NextResponse.json(
            { error: 'Failed to process reaction' },
            { status: 500 }
        );
    }
}

// GET - Get reactions for a story
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        await dbConnect();

        const story = await Story.findById(id).select('reactions reactionsCount');

        if (!story) {
            return NextResponse.json(
                { error: 'Story not found' },
                { status: 404 }
            );
        }

        const session = await auth();
        const userId = session?.user?.id;

        // Get reaction counts
        const reactionCounts = {
            love: story.reactions?.love?.length || 0,
            laugh: story.reactions?.laugh?.length || 0,
            sad: story.reactions?.sad?.length || 0,
            fire: story.reactions?.fire?.length || 0,
            clap: story.reactions?.clap?.length || 0,
        };

        // Get user's current reaction
        let userReaction: ReactionType | null = null;
        if (userId && story.reactions) {
            for (const type of VALID_REACTIONS) {
                if (story.reactions[type]?.some((reactUserId: any) => reactUserId.toString() === userId)) {
                    userReaction = type;
                    break;
                }
            }
        }

        return NextResponse.json({
            reactionCounts,
            totalReactions: story.reactionsCount || 0,
            userReaction,
        });
    } catch (error: any) {
        console.error('Get reactions error:', error);
        return NextResponse.json(
            { error: 'Failed to get reactions' },
            { status: 500 }
        );
    }
}
