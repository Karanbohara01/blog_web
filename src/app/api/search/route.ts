import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Story from '@/models/Story';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Search users and stories
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || 'all'; // 'all', 'users', 'stories'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query || query.length < 2) {
            return NextResponse.json({
                users: [],
                stories: [],
                message: 'Search query must be at least 2 characters',
            });
        }

        await dbConnect();

        const session = await auth();
        const skip = (page - 1) * limit;

        const results: { users?: any[]; stories?: any[] } = {};

        // Search users
        if (type === 'all' || type === 'users') {
            const usersQuery = {
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } },
                ],
            };

            const users = await User.find(usersQuery)
                .select('_id username name avatar bio followersCount isVerified')
                .skip(type === 'users' ? skip : 0)
                .limit(type === 'users' ? limit : 5)
                .lean();

            // Add isFollowing status if authenticated
            if (session?.user?.id) {
                const currentUser = await User.findById(session.user.id).select('following').lean();
                const following = (currentUser as any)?.following?.map((id: any) => id.toString()) || [];

                results.users = users.map((user: any) => ({
                    ...user,
                    isFollowing: following.includes(user._id.toString()),
                }));
            } else {
                results.users = users;
            }
        }

        // Search stories
        if (type === 'all' || type === 'stories') {
            const storiesQuery = {
                $or: [
                    { content: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } },
                ],
                isPublic: true,
            };

            const stories = await Story.find(storiesQuery)
                .select('_id author content images likesCount commentsCount sharesCount createdAt tags')
                .populate('author', 'name username avatar isVerified')
                .sort({ createdAt: -1 })
                .skip(type === 'stories' ? skip : 0)
                .limit(type === 'stories' ? limit : 5)
                .lean();

            // Add isLiked status if authenticated
            if (session?.user?.id) {
                const fullStories = await Story.find({
                    _id: { $in: stories.map((s: any) => s._id) }
                }).select('likes').lean();

                const likesMap = new Map(
                    fullStories.map((s: any) => [
                        s._id.toString(),
                        s.likes?.some((l: any) => l.toString() === session.user?.id)
                    ])
                );

                results.stories = stories.map((story: any) => ({
                    ...story,
                    isLiked: likesMap.get(story._id.toString()) || false,
                }));
            } else {
                results.stories = stories;
            }
        }

        return NextResponse.json(results);
    } catch (error: unknown) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search' },
            { status: 500 }
        );
    }
}
