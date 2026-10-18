import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pgsathi.in';

  return {
    rules: [
      // Standard search engine crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/', // Prevent indexing of private dashboard routes
          '/api/',       // Prevent indexing of API routes
          '/*?*',        // Prevent indexing of complex filter parameter URLs
        ],
      },
      // Major AI Crawlers (OpenAI, Anthropic Claude, Perplexity, Google Gemini, Apple, Meta)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'Meta-ExternalAgent',
          'cohere-ai',
          'Bytespider',
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/about',
          '/faq',
          '/for-owners',
          '/pg-management-software',
          '/compare',
          '/compare/pgsathi-vs-nobroker',
          '/compare/pgsathi-vs-rentok',
          '/trust-and-safety',
          '/how-it-works',
          '/blog',
        ],
        disallow: [
          '/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
