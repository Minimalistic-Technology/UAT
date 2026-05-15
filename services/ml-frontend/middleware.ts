import { NextRequest, NextResponse } from 'next/server';

// Routes that require login
const PROTECTED_ROUTES = ['/dashboard', '/my-blogs', '/blog/create', '/blog/edit', '/dashboard/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path starts with any protected route
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for access_token cookie (set by the backend on login)
  const accessToken = request.cookies.get('access_token');

  if (!accessToken) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // So we can redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/my-blogs/:path*', '/blog/create/:path*', '/blog/edit/:path*'],
};
