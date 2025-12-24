import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import User from '@/models/User';

// GET - List stories (feed)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const userId = searchParams.get('userId');
        const following = searchParams.get('following') === 'true';

        await dbConnect();

        const session = await auth();
        let query: any = { isPublic: true };

        // Filter by specific user
        if (userId) {
            // Check if userId is a valid ObjectId
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

            if (isValidObjectId) {
                query.author = userId;
            } else {
                // If not a valid ObjectId, assume it's a username and find the user
                const user = await User.findOne({ username: userId }).select('_id');
                if (user) {
                    query.author = user._id;
                } else {
                    // User not found, return empty results
                    return NextResponse.json({
                        stories: [],
                        pagination: {
                            page,
                            limit,
                            total: 0,
                            totalPages: 0,
                            hasMore: false,
                        },
                    });
                }
            }
        }

        // Filter to only show stories from followed users
        if (following && session?.user?.id) {
            const currentUser = await User.findById(session.user.id);
            if (currentUser) {
                query.author = { $in: currentUser.following };
            }
        }

        const stories = await Story.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name username avatar isVerified')
            .lean();

        const total = await Story.countDocuments(query);

        // Add isLiked field if user is logged in
        const storiesWithLikeStatus = stories.map((story: any) => ({
            ...story,
            isLiked: session?.user?.id
                ? story.likes.some((id: any) => id.toString() === session.user.id)
                : false,
        }));

        return NextResponse.json({
            stories: storiesWithLikeStatus,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get stories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stories' },
            { status: 500 }
        );
    }
}

// POST - Create a new story
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { title, content, images, tags, isPublic } = await request.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Story title is required' },
                { status: 400 }
            );
        }

        if (title.length > 150) {
            return NextResponse.json(
                { error: 'Story title is too long (max 150 characters)' },
                { status: 400 }
            );
        }

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Story content is required' },
                { status: 400 }
            );
        }

        if (content.length > 10000) {
            return NextResponse.json(
                { error: 'Story content is too long (max 10000 characters)' },
                { status: 400 }
            );
        }

        await dbConnect();

        const story = await Story.create({
            author: session.user.id,
            title: title.trim(),
            content: content.trim(),
            images: images || [],
            tags: tags || [],
            isPublic: isPublic !== false,
        });

        // Update user's story count
        await User.findByIdAndUpdate(session.user.id, {
            $inc: { storiesCount: 1 },
        });

        const populatedStory = await Story.findById(story._id)
            .populate('author', 'name username avatar isVerified');

        return NextResponse.json({
            story: populatedStory,
            message: 'Story created successfully',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create story error:', error);
        return NextResponse.json(
            { error: 'Failed to create story' },
            { status: 500 }
        );
    }
}
