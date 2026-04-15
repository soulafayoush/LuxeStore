import { MetadataRoute } from 'next'

/**
 * Dynamic robots.txt generation.
 * References the sitemap and sets crawl rules for search engines.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luxe-store.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/checkout/',
          '/account/',
          '/admin/',
          '/cart/', // Cart is low value for search engines
        ],
      },
      // Block AI crawlers from scraping product data
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
