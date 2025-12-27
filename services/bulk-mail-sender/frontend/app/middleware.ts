import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/register', '/verify'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes
  const protectedRoutes = ['/dashboard', '/customers', '/send', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with token
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/customers/:path*',
    '/send/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/verify',
  ],
};