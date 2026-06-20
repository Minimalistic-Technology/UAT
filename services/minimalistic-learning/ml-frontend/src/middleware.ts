import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
 // Ignore static files and api routes to prevent loops
 if (
 req.nextUrl.pathname.startsWith('/_next') ||
 req.nextUrl.pathname.startsWith('/api') ||
 req.nextUrl.pathname.includes('.')
 ) {
 return NextResponse.next();
 }

 try {
 let rawURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
 // Force IPv4 loopback for Node.js fetch if localhost is used
 rawURL = rawURL.replace('localhost', '127.0.0.1');

 const backendUrl = rawURL.endsWith('/api/v1') ? rawURL : `${rawURL}/api/v1`;

 // Fetch maintenance status.
 const statusRes = await fetch(`${backendUrl}/public/status`, {
 cache: 'no-store',
 });

 if (statusRes.ok) {
 const result = await statusRes.json() as any;
 const isMaintenanceMode = result?.data?.maintenanceMode === true;
 const isTryingToAccessComingSoon = req.nextUrl.pathname === '/coming-soon';

 // Scenario 1: Maintenance is ON, and user is NOT on the coming soon page -> Send them to Coming Soon
 if (isMaintenanceMode && !isTryingToAccessComingSoon) {
 return NextResponse.redirect(new URL('/coming-soon', req.url));
 }

 // Scenario 2: Maintenance is OFF, but user manually typed /coming-soon -> Kick them back to Home (/)
 if (!isMaintenanceMode && isTryingToAccessComingSoon) {
 return NextResponse.redirect(new URL('/', req.url));
 }
 }
 } catch (err: any) {
 console.error("[Middleware] Fetch Error:", err.message);
 // If backend is down or unreachable, just continue so we don't break frontend SSR
 }

 return NextResponse.next();
}

export const config = {
 matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
