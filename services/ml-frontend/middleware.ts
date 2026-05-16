import { NextRequest, NextResponse } from 'next/server';

/**
 * PRODUCTION-READY MIDDLEWARE
 * Handles route protection and authentication redirects.
 */

const PROTECTED_ROUTES = [
  '/dashboard', 
  '/my-blogs', 
  '/blog/create', 
  '/blog/edit', 
  '/dashboard/settings'
];

const AUTH_ROUTES = ['/login', '/register', '/verify-otp'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for access_token cookie
  // Note: Since we use Next.js Rewrites, the cookie is set on the frontend domain
  const accessToken = request.cookies.get('access_token')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Redirect to login if accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect to dashboard if accessing auth routes while already logged in
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/my-blogs/:path*', 
    '/blog/create/:path*', 
    '/blog/edit/:path*',
    '/login',
    '/register',
    '/verify-otp'
  ],
};
