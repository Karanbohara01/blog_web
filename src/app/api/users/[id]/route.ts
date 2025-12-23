import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get user profile
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        await dbConnect();

        // Try to find by username first, then by ID
        let user = await User.findOne({ username: id })
            .select('-password -googleId')
            .lean();

        if (!user) {
            user = await User.findById(id)
                .select('-password -googleId')
                .lean();
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const session = await auth();
        const isFollowing = session?.user?.id
            ? (user as any).followers?.some((followerId: any) => followerId.toString() === session.user.id)
            : false;

        const isOwnProfile = session?.user?.id === (user as any)._id.toString();

        return NextResponse.json({
            user: {
                ...user,
                isFollowing,
                isOwnProfile,
            },
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
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

        if (session.user.id !== id) {
            return NextResponse.json(
                { error: 'Not authorized to edit this profile' },
                { status: 403 }
            );
        }

        const { name, bio, avatar, coverImage, isPrivate } = await request.json();

        await dbConnect();

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (name) user.name = name.trim();
        if (bio !== undefined) user.bio = bio.trim();
        if (avatar) user.avatar = avatar;
        if (coverImage) user.coverImage = coverImage;
        if (isPrivate !== undefined) user.isPrivate = isPrivate;

        await user.save();

        return NextResponse.json({
            user: {
                _id: user._id,
                username: user.username,
                name: user.name,
                bio: user.bio,
                avatar: user.avatar,
                coverImage: user.coverImage,
                isPrivate: user.isPrivate,
            },
            message: 'Profile updated successfully',
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
