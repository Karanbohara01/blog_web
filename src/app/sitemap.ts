import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog-web-five-rose.vercel.app';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/browse`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Dynamic story pages
    let storyPages: MetadataRoute.Sitemap = [];

    try {
        await dbConnect();

        const stories = await Story.find({ isPublic: true })
            .select('_id updatedAt')
            .sort({ createdAt: -1 })
            .limit(1000) // Limit to prevent huge sitemaps
            .lean();

        storyPages = stories.map((story: any) => ({
            url: `${baseUrl}/story/${story._id}`,
            lastModified: new Date(story.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return [...staticPages, ...storyPages];
}
