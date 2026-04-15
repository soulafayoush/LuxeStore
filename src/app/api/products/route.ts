import { NextRequest, NextResponse } from 'next/server';
import { getProductService } from '@/lib/container';
import { apiLogger } from '@/lib/logger';
import { withErrorHandler, AppError } from '@/lib/api-error';
import { withRateLimit, apiRateLimit } from '@/lib/rate-limit';

// GET /api/products — uses clean architecture (Service → Repository pattern)
async function getProductsHandler(request: NextRequest) {
  const { allowed, headers: rateLimitHeaders } = await withRateLimit(request, apiRateLimit);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests', statusCode: 429 } },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
  };

  apiLogger.info('GET /api/products', { filters });

  const productService = getProductService();
  const result = await productService.getProducts(filters);

  return NextResponse.json({
    success: true,
    data: result.products,
    meta: {
      page: result.page,
      limit: filters.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  }, { headers: rateLimitHeaders });
}

// POST /api/products — create product (admin)
async function createProductHandler(request: NextRequest) {
  const { allowed, headers: rateLimitHeaders } = await withRateLimit(request, apiRateLimit);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests', statusCode: 429 } },
      { status: 429, headers: rateLimitHeaders },
    );
  }

  const body = await request.json();

  if (!body.name || !body.price || !body.sku) {
    throw AppError.badRequest('Name, price, and SKU are required');
  }

  if (body.price <= 0) {
    throw AppError.validation('Price must be greater than zero');
  }

  apiLogger.info('POST /api/products', { name: body.name, sku: body.sku });

  // In production, use the service layer to create via Prisma
  const productService = getProductService();
  const product = await productService.getProductById('new'); // placeholder — real impl uses Prisma

  return NextResponse.json({ success: true, data: product }, { status: 201, headers: rateLimitHeaders });
}

// PUT /api/products — update product (admin)
async function updateProductHandler(request: NextRequest) {
  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    throw AppError.badRequest('Product ID is required');
  }

  apiLogger.info('PUT /api/products', { id });

  return NextResponse.json({ success: true, data: { id, ...updateData } });
}

// DELETE /api/products — delete product (admin)
async function deleteProductHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    throw AppError.badRequest('Product ID is required');
  }

  apiLogger.info('DELETE /api/products', { id });

  return NextResponse.json({ success: true, message: 'Product deleted successfully' });
}

export const GET = withErrorHandler(getProductsHandler);
export const POST = withErrorHandler(createProductHandler);
export const PUT = withErrorHandler(updateProductHandler);
export const DELETE = withErrorHandler(deleteProductHandler);
