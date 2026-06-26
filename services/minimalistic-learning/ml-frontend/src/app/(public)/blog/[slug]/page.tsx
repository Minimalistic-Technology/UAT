import { blogService } from "@/features/blog/services/blog-service";
import { BlogDetail } from "@/features/blog/components/blog-detail";
import ViewTracker from "@/features/blog/components/ViewTracker";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

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
  return [{ slug: "fallback-slug" }]; // At least one generic to satisfy export if API fails
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
        description:
          blog.excerpt ||
          (blog.content?.substring(0, 160) ?? "").replace(/<[^>]*>/g, ""),
        openGraph: {
          title: blog.title,
          description: blog.excerpt,
          images: [blog.coverImage?.url || blog.coverImageUrl || ""],
          type: "article",
          publishedTime: blog.createdAt,
          authors: [(blog.authorId as any)?.firstName || "Author"],
        },
        twitter: {
          card: "summary_large_image",
          title: blog.title,
          description: blog.excerpt,
          images: [blog.coverImage?.url || blog.coverImageUrl || ""],
        },
      };
    }
  } catch (error: any) {
    // Silently ignore 404s for unpublished/invalid blogs to prevent terminal clutter
    if (error?.response?.status !== 404) {
      console.error("Metadata generation runtime error:", error?.message);
    }
  }

  return {
    title: "Story | Minimalistic Learning",
    description: "Read interesting stories on Minimalistic Learning",
  };
}

const BlogDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  let blog: any = null;
  let latestBlogs: any[] = [];
  let error: string | null = null;

  try {
    const blogRes = await blogService.getBlogBySlug(slug).catch((e) => {
      // Don't clutter terminal with 404s when admin tries to preview a pending post
      if (e?.response?.status !== 404) {
        console.error("Blog fetch runtime error:", e?.message);
      }
      return { success: false, message: e?.message || "Failed to fetch" };
    });

    const latestRes = await blogService
      .getBlogs({ page: 1, limit: 3 })
      .catch((e) => {
        console.error("Latest blogs fetch error:", e?.message);
        return { success: false, data: { items: [] } };
      });

    if (blogRes && (blogRes as any).success && (blogRes as any).data) {
      blog = (blogRes as any).data;
    } else {
      error = (blogRes as any)?.message || "Blog not found.";
    }

    if (latestRes && (latestRes as any).success && (latestRes as any).data) {
      latestBlogs = (latestRes as any).data.items;
    }
  } catch (err: any) {
    console.error("Error fetching blog data on server:", err);
    error = err?.message || "We couldn't fetch the blog details.";
  }

  if (error || !blog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] border border-red-100 bg-red-50 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h1 className="mb-6 text-center text-4xl font-black tracking-tighter text-gray-900 uppercase italic sm:text-6xl">
          Story Not Found
        </h1>
        <p className="mb-12 max-w-sm text-center leading-relaxed text-gray-500">
          {error ||
            "The blog post you're looking for might have been removed or the URL is incorrect."}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-xs font-black tracking-widest text-white uppercase transition-all"
          >
            <Home size={16} />
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Silently tracks 1 unique view per user/IP — Instagram style */}
      <ViewTracker slug={slug} />
      <BlogDetail blog={blog} latestBlogs={latestBlogs} />
    </main>
  );
};

export default BlogDetailPage;
