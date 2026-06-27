"use client";

import Link from "next/link";
import { Edit2, Trash2, Plus, Sparkles, Loader2, Heart } from "lucide-react";
import { useGetMyBlogs } from "../hooks/use-get-my-blogs";
import { useDeleteBlog } from "../hooks/use-delete-blog";
import { useUpdateBlog } from "../hooks/use-update-blog";
import { isAxiosError } from "@/lib/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorRetryBlock } from "@/components/ui/ErrorRetryBlock";

export const BlogManagement = () => {
  const { data, isLoading, error, refetch } = useGetMyBlogs();
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog();

  const handleQuickPublish = async (id: string) => {
    updateBlog(
      { id, data: { published: true } as any },
      {
        onSuccess: () => {
          toast.success("Story published successfully!");
          refetch();
        },
        onError: (err) => {
          toast.error(
            isAxiosError(err)
              ? err.response?.data?.message || err.message
              : "Failed to publish blog",
          );
        },
      },
    );
  };

  const handleDelete = async (id: string, title: string) => {
    toast("Delete this post?", {
      description: `"${title}" will be permanently removed.`,
      action: {
        label: "Delete",
        onClick: () => {
          deleteBlog(id, {
            onSuccess: () => {
              toast.success("Blog deleted successfully!");
              refetch();
            },
            onError: (err) => {
              toast.error(
                isAxiosError(err)
                  ? err.response?.data?.message || err.message
                  : "Failed to delete blog",
              );
            },
          });
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="border-theme-action h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="text-foreground/70 font-medium">Loading your blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorRetryBlock
        error={error}
        message="Went something wrong"
        onRetry={refetch}
      />
    );
  }

  const blogs = data?.data?.items || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      {/* Header / Stats */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-foreground text-3xl font-black tracking-tight">
            Manage <span className="text-theme-action">Blogs</span>
          </h2>
          <p className="text-foreground/70 mt-1 font-medium">
            You have {blogs.length} posts in your library
          </p>
        </div>
        <Link
          href="/blog/create"
          className="bg-theme-action flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all"
        >
          <Plus size={18} />
          Create New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-2 border-dashed py-20">
          <div className="bg-theme-element-sec text-foreground/50 border-theme-accent/10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
            <Plus size={32} />
          </div>
          <h3 className="text-foreground text-xl font-bold">No blogs yet</h3>
          <p className="text-foreground/70 mt-2 max-w-xs text-center">
            Start your journey by writing your first amazing story.
          </p>
          <Link
            href="/blog/create"
            className="text-theme-action mt-6 font-bold hover:underline"
          >
            Create blog now
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog: any) => {
            const blogId = blog.id || blog._id;
            return (
              <div
                key={blogId}
                className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/50 flex flex-col items-center gap-6 rounded-3xl border p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:flex-row dark:hover:shadow-none"
              >
                {/* Image Thumbnail */}
                <div className="bg-theme-element-sec border-theme-accent/10 h-24 w-full shrink-0 overflow-hidden rounded-2xl border md:w-32">
                  {blog.coverImage?.url ? (
                    <img
                      src={blog.coverImage.url}
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-foreground/30 flex h-full w-full items-center justify-center">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 text-center md:text-left">
                  <div className="mb-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    {/* Status Badge based on new 'status' field */}
                    {(() => {
                      const s =
                        blog.status ||
                        (blog.published ? "published" : "pending");
                      if (s === "published")
                        return (
                          <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-green-600 uppercase">
                            ✓ Live
                          </span>
                        );
                      if (s === "rejected")
                        return (
                          <span className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-600 uppercase">
                            ✗ Rejected
                          </span>
                        );
                      return (
                        <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                          ⏳ Pending Review
                        </span>
                      );
                    })()}
                    <span className="text-foreground/50 bg-theme-element-sec border-theme-accent/10 rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                      {blog.category}
                    </span>
                  </div>
                  <h4 className="text-foreground mt-1 truncate text-lg font-bold">
                    {blog.title}
                  </h4>
                  <p className="text-foreground/60 mt-0.5 line-clamp-1 text-sm">
                    Last updated {new Date(blog.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-1.5 flex items-center justify-center gap-3 md:justify-start">
                    <div className="text-foreground/50 flex items-center gap-1 text-[10px] font-black tracking-widest uppercase">
                      <Heart size={10} className="fill-red-500 text-red-500" />
                      {blog.likesCount || 0} Likes
                    </div>
                  </div>
                </div>

                {/* Actions: hide Publish button if post is pending (awaiting admin approval) */}
                <div className="bg-theme-element-sec border-theme-accent/10 flex items-center gap-2 rounded-2xl border p-1 md:ml-auto">
                  {!blog.published && blog.status !== "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickPublish(blogId)}
                      disabled={isUpdating}
                      className="text-theme-action hover:bg-theme-action hover:text-white"
                      title="Publish Now"
                    >
                      {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                      <span className="ml-2 hidden text-[10px] font-black tracking-wider uppercase sm:inline">
                        Publish
                      </span>
                    </Button>
                  )}
                  <Link
                    href={`/blog/edit/${blogId}`}
                    className="text-foreground/70 hover:text-theme-action hover:bg-theme-element cursor-pointer rounded-xl p-3 shadow-sm transition-all group-hover:shadow"
                    title="Edit post"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(blogId, blog.title)}
                    disabled={isDeleting}
                    className="text-foreground/70 hover:bg-theme-element hover:text-red-500"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ImageIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
