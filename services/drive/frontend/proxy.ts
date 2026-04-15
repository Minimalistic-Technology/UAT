import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { authService } from "@/features/auth/services/auth.service";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register", "/auth/verify-otp"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);
  console.log("pathname", pathname);

  let isValid = false;

  if (accessToken) {
    console.log("Inside accessToken if block")
    try {
      // This checks if the token is tampered with and if it has expired
      await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET!),
      );
      isValid = true;
    } catch (error) {
      // Token is tampered, expired, or malformed
      isValid = false;
    }
  }

  if (!isValid && refreshToken && !isPublicRoute) {
    console.log("Inside refreshToken if block")
    try {
      const res = await authService.refreshAccessToken(refreshToken);

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        res;
      isValid = true;

      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
      });
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
      });

      return response;
    } catch (error) {
      console.error("Silent refresh failed", error);
    }
  }

  if (!isValid && !isPublicRoute) {
    console.log("Inside !isValid && !isPublicRoute if block")
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
