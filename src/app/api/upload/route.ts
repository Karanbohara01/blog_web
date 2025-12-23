import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        if (files.length > 10) {
            return NextResponse.json(
                { error: 'Maximum 10 files allowed' },
                { status: 400 }
            );
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'Only image files are allowed' },
                    { status: 400 }
                );
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json(
                    { error: 'File size must be less than 10MB' },
                    { status: 400 }
                );
            }

            // Convert file to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

            // Upload to Cloudinary
            const result = await uploadImage(base64, 'story-platform/stories');
            uploadedUrls.push(result.url);
        }

        return NextResponse.json({
            urls: uploadedUrls,
            message: `Successfully uploaded ${uploadedUrls.length} file(s)`,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}
