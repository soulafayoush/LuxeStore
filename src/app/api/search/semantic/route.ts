import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/search/semantic
// AI-powered semantic search that converts natural language to structured DB queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Step 1: Extract semantic meaning from the natural language query
    const filters = await extractFiltersFromQuery(query);

    // Step 2: Build and execute the database query based on extracted filters
    const products = await searchProducts(filters);

    // Step 3: Generate AI-powered explanation of the search results
    const explanation = generateExplanation(query, filters, products.length);

    return NextResponse.json({
      success: true,
      query: query.trim(),
      filters,
      explanation,
      results: products,
      totalResults: products.length,
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'An error occurred during semantic search' },
      { status: 500 }
    );
  }
}

// =============================================================================
// Type Definitions
// =============================================================================

interface SearchFilters {
  colors: string[];
  categories: string[];
  priceRange: { min: number; max: number } | null;
  keywords: string[];
  sentiment: 'budget' | 'premium' | 'neutral';
}

// =============================================================================
// Step 1: Extract filters from natural language using AI (or fallback rules)
// =============================================================================

async function extractFiltersFromQuery(query: string): Promise<SearchFilters> {
  const normalizedQuery = query.toLowerCase().trim();

  // Try AI-powered extraction if z-ai-web-dev-sdk is available
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a product search filter extractor for an e-commerce store. 
Given a user search query in natural language, extract structured filters for database search.

Available colors: red, blue, green, black, white, pink, purple, orange, yellow, brown, gray, navy, turquoise, beige, gold, silver
Available categories: electronics, clothing, shoes, accessories, home, beauty, sports, books, toys, food

Return ONLY valid JSON (no markdown, no explanation):
{
  "colors": ["extracted color names in lowercase"],
  "categories": ["extracted category slugs in lowercase"],
  "priceRange": {"min": number, "max": number} or null,
  "keywords": ["important search keywords"],
  "sentiment": "budget" or "premium" or "neutral"
}

Examples:
"I want a dress the color of the sea" -> {"colors": ["blue", "turquoise"], "categories": ["clothing"], "priceRange": null, "keywords": ["dress"], "sentiment": "neutral"}
"cheap wireless headphones under 500" -> {"colors": [], "categories": ["electronics"], "priceRange": {"min": 0, "max": 500}, "keywords": ["wireless", "headphones"], "sentiment": "budget"}
"luxury gold watch" -> {"colors": ["gold"], "categories": ["accessories"], "priceRange": null, "keywords": ["watch"], "sentiment": "premium"}`,
        },
        { role: 'user', content: query },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      // Parse JSON from response, handle potential markdown wrapping
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr) as SearchFilters;
      return {
        colors: Array.isArray(parsed.colors) ? parsed.colors.map((c) => c.toLowerCase()) : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories.map((c) => c.toLowerCase()) : [],
        priceRange: parsed.priceRange || null,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [query.trim()],
        sentiment: ['budget', 'premium', 'neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'neutral',
      };
    }
  } catch (aiError) {
    console.warn('AI extraction failed, using rule-based fallback:', aiError);
  }

  // Rule-based fallback extraction
  return extractFiltersByRules(normalizedQuery);
}

// Rule-based filter extraction fallback
function extractFiltersByRules(query: string): SearchFilters {
  const colors: string[] = [];
  const categories: string[] = [];
  const keywords: string[] = [];
  let priceRange: { min: number; max: number } | null = null;
  let sentiment: 'budget' | 'premium' | 'neutral' = 'neutral';

  // Color extraction
  const colorMap: Record<string, string[]> = {
    'sea': ['blue', 'turquoise'],
    'ocean': ['blue', 'turquoise'],
    'sky': ['blue'],
    'turquoise': ['turquoise'],
    'blue': ['blue'],
    'navy': ['navy'],
    'red': ['red'],
    'pink': ['pink'],
    'green': ['green'],
    'black': ['black'],
    'white': ['white'],
    'gold': ['gold'],
    'silver': ['silver'],
    'purple': ['purple'],
    'brown': ['brown'],
    'gray': ['gray'],
    'grey': ['gray'],
    'orange': ['orange'],
    'yellow': ['yellow'],
    'beige': ['beige'],
  };

  for (const [keyword, colorNames] of Object.entries(colorMap)) {
    if (query.includes(keyword)) {
      colors.push(...colorNames);
    }
  }

  // Category extraction
  const categoryMap: Record<string, string> = {
    'dress': 'clothing',
    'shirt': 'clothing',
    'pants': 'clothing',
    'jacket': 'clothing',
    'shoes': 'shoes',
    'sneakers': 'shoes',
    'headphones': 'electronics',
    'phone': 'electronics',
    'laptop': 'electronics',
    'watch': 'accessories',
    'bag': 'accessories',
    'wallet': 'accessories',
    'skincare': 'beauty',
    'makeup': 'beauty',
    'sports': 'sports',
    'exercise': 'sports',
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (query.includes(keyword)) {
      categories.push(category);
    }
  }

  // Price extraction
  const priceMatch = query.match(/(?:under|below|less than|cheaper than|up to)\s*\$?\s*(\d+)/);
  if (priceMatch) {
    priceRange = { min: 0, max: parseInt(priceMatch[1], 10) };
  } else {
    const rangeMatch = query.match(/between\s*\$?\s*(\d+)\s*(?:and|to|-)\s*\$?\s*(\d+)/);
    if (rangeMatch) {
      priceRange = { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };
    }
  }

  // Sentiment extraction
  if (query.includes('cheap') || query.includes('budget') || query.includes('affordable') || query.includes('discount')) {
    sentiment = 'budget';
    if (!priceRange) priceRange = { min: 0, max: 500 };
  } else if (query.includes('luxury') || query.includes('premium') || query.includes('expensive') || query.includes('designer')) {
    sentiment = 'premium';
    if (!priceRange) priceRange = { min: 500, max: 10000 };
  }

  // Extract meaningful keywords (remove common stop words)
  const stopWords = new Set(['i', 'want', 'a', 'an', 'the', 'like', 'with', 'for', 'my', 'me', 'looking', 'need', 'some', 'that', 'this', 'is', 'are', 'of', 'and', 'or', 'in', 'to', 'it']);
  const words = query.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
  keywords.push(...words);

  return { colors, categories, keywords, priceRange, sentiment };
}

// =============================================================================
// Step 2: Search products using extracted filters
// =============================================================================

async function searchProducts(filters: SearchFilters) {
  const where: Record<string, unknown> = { isActive: true };

  // Build the Prisma where clause based on filters
  const orConditions: Record<string, unknown>[] = [];

  // Keyword search across product name and description
  if (filters.keywords.length > 0) {
    for (const keyword of filters.keywords) {
      orConditions.push({
        OR: [
          { name: { contains: keyword } },
          { nameEn: { contains: keyword } },
          { description: { contains: keyword } },
          { descriptionEn: { contains: keyword } },
          { sku: { contains: keyword } },
        ],
      });
    }
  }

  // Color filter - find products that have matching colors
  if (filters.colors.length > 0) {
    orConditions.push({
      colors: {
        some: {
          color: {
            OR: filters.colors.map((color) => ({
              OR: [
                { name: { contains: color } },
                { nameEn: { contains: color } },
                { hexCode: { contains: color } },
              ],
            })),
          },
        },
      },
    });
  }

  // Category filter
  if (filters.categories.length > 0) {
    orConditions.push({
      category: {
        OR: filters.categories.map((cat) => ({
          OR: [
            { name: { contains: cat } },
            { nameEn: { contains: cat } },
            { slug: { contains: cat } },
          ],
        })),
      },
    });
  }

  // Price range filter
  if (filters.priceRange) {
    const priceFilter: Record<string, unknown> = {};
    if (filters.priceRange.min > 0) {
      priceFilter.gte = filters.priceRange.min;
    }
    if (filters.priceRange.max > 0) {
      priceFilter.lte = filters.priceRange.max;
    }
    where.price = priceFilter;
  }

  // Apply sentiment-based price adjustments
  if (filters.sentiment === 'budget' && !filters.priceRange) {
    where.price = { ...((where.price as Record<string, unknown>) || {}), lte: 500 };
  } else if (filters.sentiment === 'premium' && !filters.priceRange) {
    where.price = { ...((where.price as Record<string, unknown>) || {}), gte: 500 };
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  // Execute the search query
  const products = await db.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      colors: { include: { color: { select: { id: true, name: true, hexCode: true } } } },
      sizes: { include: { size: { select: { id: true, name: true, value: true } } } },
    },
    orderBy: filters.sentiment === 'budget'
      ? { price: 'asc' }
      : filters.sentiment === 'premium'
        ? { price: 'desc' }
        : { createdAt: 'desc' },
    take: 20,
  });

  return products.map((product) => ({
    id: product.id,
    name: product.nameEn || product.name,
    description: product.descriptionEn || product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    sku: product.sku,
    stock: product.stock,
    images: JSON.parse(product.images || '[]'),
    category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
    colors: product.colors.map((pc) => ({ name: pc.color.name, hex: pc.color.hexCode })),
    sizes: product.sizes.map((ps) => ({ name: ps.size.name, value: ps.size.value })),
    isAvailable: product.stock > 0,
  }));
}

// =============================================================================
// Step 3: Generate AI explanation of results
// =============================================================================

function generateExplanation(query: string, filters: SearchFilters, resultCount: number): string {
  const parts: string[] = [];

  parts.push(`Found ${resultCount} product${resultCount !== 1 ? 's' : ''} matching "${query}".`);

  if (filters.colors.length > 0) {
    parts.push(`Filtered by colors: ${filters.colors.join(', ')}.`);
  }

  if (filters.categories.length > 0) {
    parts.push(`Searching in categories: ${filters.categories.join(', ')}.`);
  }

  if (filters.priceRange) {
    parts.push(`Price range: ${filters.priceRange.min} - ${filters.priceRange.max} SAR.`);
  }

  if (filters.sentiment !== 'neutral') {
    parts.push(`Preference: ${filters.sentiment === 'budget' ? 'affordable options' : 'premium selection'}.`);
  }

  return parts.join(' ');
}
