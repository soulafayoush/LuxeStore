import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Public route patterns that do not require authentication.
 */
const PUBLIC_PATHS = [
  '/',           // Homepage
  '/api/auth',   // NextAuth routes (signin, signout, callback, etc.)
  '/api/products',
  '/api/orders',
  '/api/search',
  '/api/checkout',
];

/**
 * Checks whether the given request pathname is a public route.
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protect /admin page routes — redirect to home if not authenticated/admin
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'luxe-store-demo-secret-key-change-in-production',
    });

    if (!token || token.role !== 'ADMIN') {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect /api/admin/* routes — return 401 if not admin
  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'luxe-store-demo-secret-key-change-in-production',
    });

    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // All other routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
