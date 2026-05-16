import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // turbopack: {
    //   root: '../../',
    // },
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/v1 requests to the backend
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://ml-backend-5yif.onrender.com/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
