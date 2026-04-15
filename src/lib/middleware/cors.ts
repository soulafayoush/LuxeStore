/**
 * CORS middleware for API routes
 * In production, configure allowed origins from environment variables
 */

const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_APP_URL
  ? [process.env.NEXT_PUBLIC_APP_URL]
  : ['http://localhost:3000', 'https://preview-*.space.chatglm.site'];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Request-ID'];
const MAX_AGE = 86400; // 24 hours

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
    if (allowed.includes('*')) return true;
    return allowed === origin;
  });

  return {
    ...(isAllowed && origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': String(MAX_AGE),
  };
}

export function corsMiddleware(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    const response = await handler(req);
    const headers = corsHeaders(req);

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
