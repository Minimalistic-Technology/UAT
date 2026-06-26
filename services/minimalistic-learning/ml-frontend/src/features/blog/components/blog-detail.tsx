"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  User,
  ArrowLeft,
  Clock,
  Share2,
  MessageCircle,
  Heart,
  Tag,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { BlogResponse } from "../types/blog-type";
import { BlogCard } from "./blog-card";
import { useLikeBlog } from "../hooks/use-like-blog";
import { useComments } from "../hooks/use-comments";
import { useCreateComment } from "../hooks/use-create-comment";
import { toast } from "sonner";
import { useLikeComment } from "../hooks/use-like-comment";

interface BlogDetailProps {
  blog: BlogResponse["data"];
  latestBlogs?: BlogResponse["data"][];
}

export const BlogDetail: React.FC<BlogDetailProps> = ({
  blog,
  latestBlogs = [],
}) => {
  const {
    title,
    content,
    coverImage,
    coverImageUrl,
    tags,
    authorId,
    createdAt,
    category,
  } = blog;

  const imageUrl = coverImage?.url || coverImageUrl;

  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`
    : "John Doe";
  const authorRole = author?.role || "Technical Content Creator";

  const [commentText, setCommentText] = useState("");
  const [hasLiked, setHasLiked] = useState(blog.hasLiked || false);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);

  useEffect(() => {
    setHasLiked(blog.hasLiked || false);
    setLikesCount(blog.likesCount || 0);
  }, [blog.hasLiked, blog.likesCount]);

  const blogId = blog.id || blog._id;

  const { mutate: likeBlog } = useLikeBlog();
  const { data: commentsData, isLoading: isLoadingComments } =
    useComments(blogId);
  const { mutate: createComment, isPending: isPosting } = useCreateComment();
  const { mutate: likeComment } = useLikeComment(blogId);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: url,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    const previousHasLiked = hasLiked;
    const previousCount = likesCount;

    setHasLiked(!previousHasLiked);
    setLikesCount((prev) =>
      previousHasLiked ? Math.max(0, prev - 1) : prev + 1,
    );

    likeBlog(blogId, {
      onSuccess: (res: any) => {
        if (res?.data) {
          setHasLiked(res.data.hasLiked);
          setLikesCount(res.data.likes);
        }
      },
      onError: (err: any) => {
        setHasLiked(previousHasLiked);
        setLikesCount(previousCount);
        toast.error(err?.response?.data?.message || "Action failed.");
      },
    });
  };

  const scrollToComments = () => {
    const element = document.getElementById("comments-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    createComment(
      { postId: blogId, content: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment posted!");
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Failed to post comment.",
          );
        },
      },
    );
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId, {
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Action failed.");
      },
    });
  };

  const comments = commentsData?.data || [];

  return (
    <article className="bg-background min-h-screen py-24 transition-colors duration-500 md:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Main Content Grid */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          {/* Article Pillar (Left) */}
          <div className="w-full min-w-0">
            {/* Header Section */}
            <div className="mb-10">
              <div className="text-foreground/50 mb-6 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <Link
                  href="/"
                  className="hover:text-theme-action transition-colors"
                >
                  Home
                </Link>
                <ChevronRight size={14} className="text-foreground/30" />
                <span className="text-theme-action">{category || "Blog"}</span>
              </div>

              <h1 className="text-foreground mb-6 text-3xl leading-[1.1] font-black tracking-tight sm:text-4xl lg:text-5xl lg:text-[3.5rem]">
                {title}
              </h1>
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="border-theme-accent/10 relative mb-12 aspect-[16/9] max-h-[600px] w-full overflow-hidden rounded-[2rem] border shadow-sm transition-transform duration-500 hover:scale-[1.01] md:aspect-[21/9]">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Interactions Bar */}
            <div className="border-theme-accent/10 mb-12 flex flex-wrap items-center justify-between gap-6 border-y py-5">
              <div className="flex items-center gap-8">
                <button
                  onClick={handleLike}
                  className="group flex items-center gap-2.5 transition-all"
                >
                  <Heart
                    size={22}
                    fill={hasLiked ? "#ef4444" : "none"}
                    className={
                      hasLiked
                        ? "scale-110 text-red-500"
                        : "text-foreground/50 group- transition-transform group-hover:text-red-500"
                    }
                  />
                  <span
                    className={`text-sm font-black ${hasLiked ? "text-foreground" : "text-foreground/50"}`}
                  >
                    {likesCount.toLocaleString()}
                  </span>
                </button>

                <button
                  onClick={scrollToComments}
                  className="group flex items-center gap-2.5 transition-all"
                >
                  <MessageCircle
                    size={22}
                    className="text-foreground/50 group-hover:text-theme-action group- transition-transform"
                  />
                  <span className="text-foreground/50 text-sm font-black">
                    {comments.length}
                  </span>
                </button>
              </div>

              <button
                onClick={handleShare}
                className="group hover:bg-theme-element-sec hover:border-theme-accent/20 flex items-center gap-2 rounded-full border border-transparent p-2 transition-all"
              >
                <Share2
                  size={20}
                  className="text-foreground/50 group-hover:text-foreground transition-colors"
                />
                <span className="text-foreground/50 hidden text-xs font-black tracking-widest uppercase sm:block">
                  Share
                </span>
              </button>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mb-14 flex flex-wrap gap-2.5">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-theme-element-sec text-foreground/70 border-theme-accent/10 hover:border-theme-action/30 hover:text-theme-action cursor-pointer rounded-xl border px-4 py-2 text-xs font-black tracking-widest uppercase transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Body Content */}
            <div className="bg-theme-element md:border-theme-accent/10 max-w-none border-transparent md:rounded-[3rem] md:border md:p-12 md:shadow-[0_8px_40px_rgba(0,0,0,0.02)] dark:md:shadow-none">
              <div
                className="ql-editor prose prose-lg md:prose-xl text-foreground/80 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:mb-8 prose-p:font-medium prose-a:text-theme-action prose-a:no-underline hover:prose-a:underline hover:prose-a:underline-offset-4 prose-strong:text-foreground prose-strong:font-black prose-img:rounded-3xl prose-img:shadow-sm prose-img:max-w-full prose-img:border prose-img:border-theme-accent/10 prose-blockquote:border-l-4 prose-blockquote:border-theme-action prose-blockquote:bg-theme-action/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-foreground/90 prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:bg-theme-element-sec prose-pre:border prose-pre:border-theme-accent/20 prose-pre:shadow-sm prose-code:text-theme-action prose-code:bg-theme-action/10 prose-code:rounded-lg prose-code:px-2 prose-code:py-0.5 prose-code:font-bold max-w-none overflow-hidden font-medium break-words"
                dangerouslySetInnerHTML={{ __html: content || "" }}
              />
            </div>

            {/* Comment Section (Redesigned) */}
            <div
              id="comments-section"
              className="border-theme-accent/10 mt-20 border-t pt-16"
            >
              <div className="mb-10 flex items-center gap-3">
                <div className="bg-theme-action h-8 w-1.5 rounded-full" />
                <h4 className="text-foreground text-2xl font-black tracking-tight">
                  Discussion ({comments.length})
                </h4>
              </div>

              <div className="space-y-12">
                {/* Comment Input */}
                <div className="flex gap-4">
                  <div className="bg-theme-element text-foreground/50 border-theme-accent/20 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border sm:flex">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="bg-theme-element border-theme-accent/20 text-foreground focus:ring-theme-action/20 focus:border-theme-action placeholder:text-foreground/30 w-full resize-none rounded-2xl border p-5 text-base font-medium shadow-sm transition-all focus:ring-2 focus:outline-none"
                      placeholder="What are your thoughts?"
                      rows={3}
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handlePostComment}
                        disabled={isPosting || !commentText.trim()}
                        className="bg-foreground text-background rounded-xl px-8 py-3 text-sm font-black shadow-md transition-all disabled:opacity-50"
                      >
                        {isPosting ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="mt-8 space-y-6">
                  {isLoadingComments ? (
                    <div className="text-foreground/50 flex items-center gap-3 text-xs font-black tracking-widest uppercase">
                      <Loader2
                        className="text-theme-action animate-spin"
                        size={16}
                      />
                      Loading thoughts...
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((cmt: any, i: number) => (
                      <div
                        key={cmt.id || cmt._id || i}
                        className="bg-theme-element border-theme-accent/10 flex gap-4 rounded-[2rem] border p-6 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="bg-theme-action/10 text-theme-action border-theme-action/20 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-base font-black">
                          {cmt.authorId?.firstName?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-foreground text-base font-black">
                              {cmt.authorId?.firstName} {cmt.authorId?.lastName}
                            </span>
                            <span className="bg-theme-accent/20 hidden h-1 w-1 rounded-full sm:block" />
                            <span className="text-foreground/40 text-xs font-bold tracking-widest uppercase">
                              {new Date(cmt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-foreground/80 mb-3 text-base leading-relaxed font-medium">
                            {cmt.content}
                          </p>
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleLikeComment(cmt._id)}
                              className="group bg-theme-element-sec hover:border-theme-accent/20 flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 transition-colors"
                            >
                              <Heart
                                size={14}
                                fill={cmt.hasLiked ? "#ef4444" : "none"}
                                className={
                                  cmt.hasLiked
                                    ? "text-red-500"
                                    : "text-foreground/40 group-hover:text-red-500"
                                }
                              />
                              <span
                                className={`text-xs font-black ${cmt.hasLiked ? "text-foreground" : "text-foreground/50"}`}
                              >
                                {cmt.likesCount || 0}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/40 border-theme-accent/10 border-l-2 pt-4 pl-4 text-sm font-black tracking-widest uppercase italic">
                      No comments yet. Start the conversation!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="relative min-w-0">
            <div className="sticky top-32 flex w-full flex-col space-y-8">
              {/* Author Card Profile */}
              <div className="bg-theme-element border-theme-accent/20 rounded-[2rem] border p-8 shadow-sm transition-shadow hover:shadow-lg">
                <div className="mb-6 flex items-center gap-2">
                  <div className="bg-theme-action/10 text-theme-action flex h-6 w-6 items-center justify-center rounded-md">
                    <User size={14} />
                  </div>
                  <h4 className="text-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
                    About The Author
                  </h4>
                </div>
                <div className="flex items-center gap-5">
                  <div className="bg-theme-action flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md">
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-foreground mb-1 text-lg font-black">
                      {authorName}
                    </h3>
                    <p className="text-foreground/60 text-xs font-bold tracking-widest uppercase">
                      {authorRole}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats & Actions Card */}
              <div className="bg-theme-element border-theme-accent/20 rounded-[2rem] border p-8 shadow-sm transition-shadow hover:shadow-lg">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-500">
                    <Heart size={14} />
                  </div>
                  <h4 className="text-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
                    Post Activity
                  </h4>
                </div>

                <div className="space-y-5">
                  <div className="border-theme-accent/10 flex items-center justify-between border-b pb-5">
                    <span className="text-foreground/50 text-xs font-black tracking-widest uppercase">
                      Total Likes
                    </span>
                    <span className="text-foreground text-xl font-black">
                      {likesCount}
                    </span>
                  </div>
                  <div className="border-theme-accent/10 flex items-center justify-between border-b pb-5">
                    <span className="text-foreground/50 text-xs font-black tracking-widest uppercase">
                      Comments
                    </span>
                    <span className="text-foreground text-xl font-black">
                      {comments.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLike}
                  className={`mt-8 flex w-full justify-center rounded-xl py-4 text-sm font-black shadow-md transition-all focus:outline-none ${
                    hasLiked
                      ? "bg-red-500 text-white shadow-red-500/20"
                      : "bg-theme-element-sec text-foreground border-theme-accent/20 hover:border-foreground/30 hover:shadow-foreground/5 border"
                  }`}
                >
                  {hasLiked ? "♥ Liked Story" : "Like Story"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Recommended Blogs */}
        {latestBlogs.length > 0 && (
          <div className="border-theme-accent/10 mt-32 border-t pt-20">
            <div className="mb-10 flex items-center gap-3">
              <div className="bg-theme-action h-8 w-1.5 rounded-full" />
              <h2 className="text-foreground text-3xl font-black tracking-tight">
                More to read
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.map((item) => (
                <BlogCard key={item.id || item._id} blog={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
