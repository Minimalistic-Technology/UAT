import { MetadataRoute } from 'next';
import { blogService } from '@/features/blog/services/blog-service';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://minimalistic-learning.onrender.com';

  // Fetch all blogs for the sitemap
  let blogUrls: any[] = [];
  try {
    const res = await blogService.getBlogs({ limit: 100 });
    if (res.success && res.data) {
      blogUrls = res.data.items.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...blogUrls,
  ];
}
