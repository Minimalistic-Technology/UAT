import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value: "Accept-Encoding, Available-Dictionary",
          },
          {
            key: "Link",
            value: '</api/compression-dictionary>; rel="compression-dictionary"',
          },
          {
            key: "Use-As-Dictionary",
            value: 'match="/api/*", id="ddtec-dict-v1"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
