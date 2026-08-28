/** @type {import('next').NextConfig} */
const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
let cmsHostname = 'localhost';
try {
  cmsHostname = new URL(cmsUrl).hostname;
} catch (e) {}

const remotePatterns = [
  { protocol: 'http', hostname: 'localhost' },
  { protocol: 'http', hostname: '127.0.0.1' },
  { protocol: 'http', hostname: 'blog-cms' },
];

if (cmsHostname && cmsHostname !== 'localhost' && cmsHostname !== 'blog-cms' && cmsHostname !== '127.0.0.1') {
  remotePatterns.push({ protocol: 'http', hostname: cmsHostname });
  remotePatterns.push({ protocol: 'https', hostname: cmsHostname });
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

module.exports = nextConfig;

