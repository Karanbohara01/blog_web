import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Series from '@/models/Series';
import Story from '@/models/Story';

// GET - List series (by author or all public)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authorId = searchParams.get('authorId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        await dbConnect();

        const session = await auth();
        let query: any = { isPublic: true };

        if (authorId) {
            query.author = authorId;
        }

        const series = await Series.find(query)
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name username avatar isVerified')
            .lean();

        const total = await Series.countDocuments(query);

        return NextResponse.json({
            series,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error: any) {
        console.error('Get series error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch series' },
            { status: 500 }
        );
    }
}

// POST - Create a new series
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { title, description, tags, coverImage } = await request.json();

        if (!title || title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Series title is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const series = await Series.create({
            author: session.user.id,
            title: title.trim(),
            description: description?.trim() || '',
            tags: tags || [],
            coverImage,
            storiesCount: 0,
            isPublic: true,
        });

        return NextResponse.json({
            series,
            message: 'Series created successfully',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create series error:', error);
        return NextResponse.json(
            { error: 'Failed to create series' },
            { status: 500 }
        );
    }
}
