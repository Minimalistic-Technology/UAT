/** @type {import('next').NextConfig} */
const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
const cmsHostname = new URL(cmsUrl).hostname;

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: cmsHostname },
      { protocol: 'https', hostname: cmsHostname },
    ],
  },
};

module.exports = nextConfig;
