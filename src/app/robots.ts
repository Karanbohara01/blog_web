import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://blog-web-five-rose.vercel.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/settings/', '/create'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
