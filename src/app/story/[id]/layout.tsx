import type { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

// Generate dynamic metadata for social sharing (Telegram, Facebook, Twitter)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    try {
        await dbConnect();
        const story = await Story.findById(id)
            .populate('author', 'name username')
            .lean();

        if (!story) {
            return {
                title: 'Story Not Found - Stories',
                description: 'This story could not be found.',
            };
        }

        const storyData = story as any;
        const title = storyData.title || 'Untitled Story';
        const author = storyData.author?.name || 'Anonymous';

        // Create a teaser from the content (first 150 chars) as a hook
        const contentTeaser = storyData.content
            ? storyData.content.substring(0, 150).trim() + (storyData.content.length > 150 ? '... Read more' : '')
            : 'Read this amazing story on Stories platform';

        // Get the first image or use a default OG image (books/reading theme)
        const image = storyData.images?.[0] || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop';
        const url = `https://blog-web-five-rose.vercel.app/story/${id}`;

        return {
            title: `${title} by ${author} - Stories`,
            description: contentTeaser,
            openGraph: {
                title: `📖 ${title}`,
                description: `${contentTeaser}\n\n👤 By ${author}`,
                type: 'article',
                url: url,
                images: [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: title,
                    },
                ],
                siteName: 'Stories - Share Your World',
                authors: [author],
            },
            twitter: {
                card: 'summary_large_image',
                title: `📖 ${title}`,
                description: contentTeaser,
                images: [image],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        // Return default OG tags even on error
        return {
            title: 'Story - Stories',
            description: 'Read amazing stories on Stories platform',
            openGraph: {
                title: '📖 Story',
                description: 'Read amazing stories on Stories platform',
                type: 'article',
                images: [
                    {
                        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop',
                        width: 1200,
                        height: 630,
                        alt: 'Stories Platform',
                    },
                ],
                siteName: 'Stories - Share Your World',
            },
            twitter: {
                card: 'summary_large_image',
                title: '📖 Story',
                description: 'Read amazing stories on Stories platform',
                images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop'],
            },
        };
    }
}

export default function StoryLayout({ children }: LayoutProps) {
    return <>{children}</>;
}
