"use client";

import React from "react";
import Link from "next/link";
import { Edit2, Trash2, ExternalLink, Plus, Search, Filter, MoreVertical, Eye } from "lucide-react";
import { useGetMyBlogs } from "../hooks/use-get-my-blogs";
import { useDeleteBlog } from "../hooks/use-delete-blog";
import { isAxiosError } from "@/lib/api";

export const BlogManagement = () => {
  const { data, isLoading, error, refetch } = useGetMyBlogs();
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteBlog(id, {
        onSuccess: () => {
          alert("Blog deleted successfully!");
          refetch();
        },
        onError: (err) => {
          alert(isAxiosError(err) ? err.response?.data?.message || err.message : "Failed to delete blog");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading your blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 rounded-3xl text-center">
        <p className="text-red-600 dark:text-red-400 font-bold mb-2">Error loading blogs</p>
        <p className="text-red-500/70 text-sm">{isAxiosError(error) ? error.message : "Something went wrong"}</p>
        <button onClick={() => refetch()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">Retry</button>
      </div>
    );
  }

  const blogs = data?.data?.items || [];

  return (
    <div className="space-y-8">
      {/* Header / Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Manage <span className="text-[#1877F2] dark:text-[#1877F2]">Blogs</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            You have {blogs.length} posts in your library
          </p>
        </div>
        <Link
          href="/blog/create"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1877F2] dark:bg-[#1877F2] text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#1877F2] dark:shadow-none"
        >
          <Plus size={18} />
          Create New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No blogs yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs text-center">
            Start your journey by writing your first amazing story.
          </p>
          <Link href="/blog/create" className="mt-6 text-[#1877F2] dark:text-[#1877F2] font-bold hover:underline">
            Create blog now
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog: any) => (
            <div
              key={blog._id}
              className="group flex flex-col md:flex-row items-center gap-6 p-4 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-gray-800/60 rounded-3xl hover:border-[#1877F2]/30 dark:hover:border-[#1877F2]/20 transition-all duration-300"
            >
              {/* Image Thumbnail */}
              <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                {blog.coverImage?.url ? (
                  <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${blog.published ? 'bg-white dark:bg-[#1877F2]/30 text-[#1877F2]' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'}`}>
                    {blog.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                    {blog.category}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {blog.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  Last updated {new Date(blog.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <Link
                  href={`/blog/edit/${blog._id}`}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:text-[#1877F2] dark:hover:text-[#1877F2] hover:bg-white dark:hover:bg-black rounded-xl transition-all shadow-sm group-hover:shadow hover:scale-105"
                  title="Edit post"
                >
                  <Edit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(blog._id, blog.title)}
                  disabled={isDeleting}
                  className="p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-black rounded-xl transition-all shadow-sm group-hover:shadow hover:scale-105"
                  title="Delete post"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ImageIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
