"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/features/blog/services/blog-service";
import { BlogDetail } from "@/features/blog/components/blog-detail";
import { AlertCircle, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import ViewTracker from "@/features/blog/components/ViewTracker";

export default function ClientBlogFetcher({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<any>(null);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const [blogRes, latestRes] = await Promise.all([
          blogService.getBlogBySlug(slug).catch((e) => {
            console.error("Client fetch error:", e);
            return { success: false, message: e?.message || "Failed to fetch" };
          }),
          blogService.getBlogs({ page: 1, limit: 3 }).catch(() => {
            return { success: false, data: { items: [] } };
          }),
        ]);

        if (!isMounted) return;

        if (blogRes && (blogRes as any).success && (blogRes as any).data) {
          setBlog((blogRes as any).data);
        } else {
          setError((blogRes as any)?.message || "Blog not found.");
        }

        if (
          latestRes &&
          (latestRes as any).success &&
          (latestRes as any).data
        ) {
          setLatestBlogs((latestRes as any).data.items);
        }
      } catch (err: any) {
        if (isMounted)
          setError(err?.message || "We couldn't fetch the blog details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
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
      <ViewTracker slug={slug} />
      <BlogDetail blog={blog} latestBlogs={latestBlogs} />
    </main>
  );
}
