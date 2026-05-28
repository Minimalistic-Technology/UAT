import { blogService } from '@/features/blog/services/blog-service';
import { BlogDetail } from '@/features/blog/components/blog-detail';
import ViewTracker from '@/features/blog/components/ViewTracker';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

// Removed revalidate as it is incompatible with output: export

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const res = await blogService.getBlogs({ limit: 1000 });
    if (res.success && res.data) {
      return res.data.items.map((blog: any) => ({
        slug: blog.slug,
      }));
    }
  } catch (error) {
    console.error("Failed to generate static params:", error);
  }
  return [{ slug: 'fallback-slug' }]; // At least one generic to satisfy export if API fails
}

// Dynamic Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await blogService.getBlogBySlug(slug);
    if (res.success && res.data) {
      const blog = res.data;
      return {
        title: `${blog.title} | Minimalistic Learning`,
        description: blog.excerpt || blog.content.substring(0, 160).replace(/<[^>]*>/g, ''),
        openGraph: {
          title: blog.title,
          description: blog.excerpt,
          images: [blog.coverImage?.url || blog.coverImageUrl || ""],
          type: 'article',
          publishedTime: blog.createdAt,
          authors: [(blog.authorId as any)?.firstName || 'Author'],
        },
        twitter: {
          card: 'summary_large_image',
          title: blog.title,
          description: blog.excerpt,
          images: [blog.coverImage?.url || blog.coverImageUrl || ""],
        }
      };
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }

  return {
    title: 'Story | Minimalistic Learning',
    description: 'Read interesting stories on Minimalistic Learning',
  };
}

const BlogDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  let blog: any = null;
  let latestBlogs: any[] = [];
  let error: string | null = null;

  try {
    // Fetch data on the server for speed and SEO (Resilient fetches)
    const blogRes = await blogService.getBlogBySlug(slug).catch(e => {
      console.error("Blog fetch error:", e?.message);
      return { success: false, message: e?.message || "Failed to fetch" };
    });

    const latestRes = await blogService.getBlogs({ page: 1, limit: 3 }).catch(e => {
      console.error("Latest blogs fetch error:", e?.message);
      return { success: false, data: { items: [] } };
    });

    if (blogRes && (blogRes as any).success && (blogRes as any).data) {
      blog = (blogRes as any).data;
    } else {
      error = (blogRes as any)?.message || 'Blog not found.';
    }

    if (latestRes && (latestRes as any).success && (latestRes as any).data) {
      latestBlogs = (latestRes as any).data.items;
    }
  } catch (err: any) {
    console.error('Error fetching blog data on server:', err);
    error = err?.message || 'We couldn\'t fetch the blog details.';
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-[2.5rem] bg-red-50 flex items-center justify-center text-red-500 mb-8 border border-red-100">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-6 italic uppercase tracking-tighter text-center">
          Story Not Found
        </h1>
        <p className="text-gray-500 text-center max-w-sm mb-12 leading-relaxed">
          {error || "The blog post you're looking for might have been removed or the URL is incorrect."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center gap-2"
          >
            <Home size={16} />
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Silently tracks 1 unique view per user/IP — Instagram style */}
      <ViewTracker slug={slug} />
      <BlogDetail blog={blog} latestBlogs={latestBlogs} />
    </main>
  );
};

export default BlogDetailPage;
