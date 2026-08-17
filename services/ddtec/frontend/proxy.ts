import { NextRequest, NextResponse } from "next/server";

const COMING_SOON_PATH = "/coming-soon";

export function proxy(request: NextRequest) {
  const isComingSoon = true;
  if (!isComingSoon) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === COMING_SOON_PATH) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = COMING_SOON_PATH;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match every route except Next.js internals and static assets,
     * so the coming-soon lockdown covers pages, admin, warehouse, api, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
