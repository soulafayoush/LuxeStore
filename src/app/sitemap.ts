import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

/**
 * Dynamic sitemap generation for SEO.
 * Includes static pages and dynamic product/category pages from the database.
 * Automatically updates as products/categories are added or modified.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://luxe-store.com'

  // ── Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/best-sellers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/sale`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  try {
    // ── Dynamic category pages ──
    const categories = await db.category.findMany({
      where: { parentId: null },
      select: {
        slug: true,
        updatedAt: true,
        children: {
          select: {
            slug: true,
            updatedAt: true,
          },
        },
      },
    })

    const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) => {
      const pages: MetadataRoute.Sitemap = [
        {
          url: `${baseUrl}/collections/${category.slug}`,
          lastModified: category.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]

      // Add sub-category pages
      for (const child of category.children) {
        pages.push({
          url: `${baseUrl}/collections/${category.slug}/${child.slug}`,
          lastModified: child.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }

      return pages
    })

    // ── Dynamic product pages ──
    const products = await db.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
        category: {
          select: { slug: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...categoryPages, ...productPages]
  } catch {
    // If the database is unavailable, return static pages only
    return staticPages
  }
}
