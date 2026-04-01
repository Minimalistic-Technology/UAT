"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blogService } from '@/features/blog/services/blog-service';
import { BlogResponse } from '@/features/blog/types/blog-type';
import { BlogDetail } from '@/features/blog/components/blog-detail';
import { Navbar } from '@/components/Navbar';
import { Loader2, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogResponse['data'] | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<BlogResponse['data'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the main blog and latest blogs in parallel
        const [blogRes, latestRes] = await Promise.all([
          blogService.getBlogBySlug(slug as string),
          blogService.getBlogs({ page: 1, limit: 3 })
        ]);

        if (blogRes.success && blogRes.data) {
          setBlog(blogRes.data);
        } else {
          setError(blogRes.message || 'Blog not found.');
        }

        if (latestRes.success && latestRes.data) {
          setLatestBlogs(latestRes.data.items);
        }
      } catch (err: any) {
        console.error('Error fetching blog data:', err);
        setError('We couldn\'t fetch the blog details or an error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
           Opening Story
        </p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-[2.5rem] bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mb-8 border border-red-100 dark:border-red-900/30">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 italic uppercase tracking-tighter text-center">
          Story Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-12 leading-relaxed">
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
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Try Refreshing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <main>
        <BlogDetail blog={blog} latestBlogs={latestBlogs} />
      </main>

      {/* Simplified Footer for Detail Page */}
      <footer className="py-20 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <div className="inline-flex items-center gap-4 text-emerald-600 mb-8">
              <div className="w-10 h-1 rounded-full bg-current opacity-20" />
              <Home size={20} />
              <div className="w-10 h-1 rounded-full bg-current opacity-20" />
           </div>
           <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-2">
             Minimalistic Learning Platform
           </p>
           <p className="text-gray-400 dark:text-gray-600 text-[10px] uppercase font-bold tracking-widest">
             &copy; {new Date().getFullYear()} - All Rights Reserved
           </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogDetailPage;
