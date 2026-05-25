import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://minimalistic-learning.onrender.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/my-blogs/'], // prevent indexing admin/user-specific areas
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
