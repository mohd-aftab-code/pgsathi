import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pgsathi.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', // Prevent indexing of private dashboard routes
        '/api/',       // Prevent indexing of API routes
        '/*?*',        // Prevent indexing of complex filter parameter URLs
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
