import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  turbopack: {
    root: path.join(__dirname, "."),
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  },
};

export default nextConfig;
