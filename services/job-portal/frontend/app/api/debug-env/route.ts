import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrlValue: process.env.NEXTAUTH_URL, // safe to show, it's not a secret
    hasInternalApiUrl: !!process.env.INTERNAL_API_URL,
    internalApiUrlValue: process.env.INTERNAL_API_URL,
    hasPublicApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
    publicApiUrlValue: process.env.NEXT_PUBLIC_API_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}