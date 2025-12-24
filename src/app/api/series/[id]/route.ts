import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Series from '@/models/Series';
import Story from '@/models/Story';

interface RouteParams {
    params: { id: string };
}

// GET - Get series with chapters
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = params;

        await dbConnect();

        const series = await Series.findById(id)
            .populate('author', 'name username avatar isVerified bio followersCount')
            .lean();

        if (!series) {
            return NextResponse.json(
                { error: 'Series not found' },
                { status: 404 }
            );
        }

        // Get all chapters in order
        const chapters = await Story.find({ series: id })
            .sort({ chapterNumber: 1 })
            .populate('author', 'name username avatar isVerified')
            .select('_id title chapterNumber chapterTitle likesCount commentsCount createdAt')
            .lean();

        return NextResponse.json({
            series,
            chapters,
        });
    } catch (error: any) {
        console.error('Get series error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch series' },
            { status: 500 }
        );
    }
}

// PUT - Update series
export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const series = await Series.findById(id);

        if (!series) {
            return NextResponse.json(
                { error: 'Series not found' },
                { status: 404 }
            );
        }

        if (series.author.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const { title, description, tags, coverImage, isComplete } = await request.json();

        const updated = await Series.findByIdAndUpdate(
            id,
            {
                $set: {
                    ...(title && { title: title.trim() }),
                    ...(description !== undefined && { description: description.trim() }),
                    ...(tags && { tags }),
                    ...(coverImage !== undefined && { coverImage }),
                    ...(isComplete !== undefined && { isComplete }),
                },
            },
            { new: true }
        );

        return NextResponse.json({
            series: updated,
            message: 'Series updated',
        });
    } catch (error: any) {
        console.error('Update series error:', error);
        return NextResponse.json(
            { error: 'Failed to update series' },
            { status: 500 }
        );
    }
}

// DELETE - Delete series
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = params;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const series = await Series.findById(id);

        if (!series) {
            return NextResponse.json(
                { error: 'Series not found' },
                { status: 404 }
            );
        }

        if (series.author.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Remove series reference from all chapters
        await Story.updateMany({ series: id }, { $unset: { series: 1, chapterNumber: 1, chapterTitle: 1 } });

        await Series.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Series deleted',
        });
    } catch (error: any) {
        console.error('Delete series error:', error);
        return NextResponse.json(
            { error: 'Failed to delete series' },
            { status: 500 }
        );
    }
}
