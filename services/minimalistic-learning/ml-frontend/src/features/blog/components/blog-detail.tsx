"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, Heart, Tag, ChevronRight, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';
import { useLikeBlog } from '../hooks/use-like-blog';
import { useComments } from '../hooks/use-comments';
import { useCreateComment } from '../hooks/use-create-comment';
import { toast } from 'sonner';
import { useLikeComment } from '../hooks/use-like-comment';

interface BlogDetailProps {
  blog: BlogResponse['data'];
  latestBlogs?: BlogResponse['data'][];
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ blog, latestBlogs = [] }) => {
  const {
    title,
    content,
    coverImage,
    coverImageUrl,
    tags,
    authorId,
    createdAt,
    category
  } = blog;

  const imageUrl = coverImage?.url || coverImageUrl;

  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ''}`
    : 'John Doe';
  const authorRole = author?.role || 'Technical Content Creator';

  const [commentText, setCommentText] = useState("");
  const [hasLiked, setHasLiked] = useState(blog.hasLiked || false);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);

  useEffect(() => {
    setHasLiked(blog.hasLiked || false);
    setLikesCount(blog.likesCount || 0);
  }, [blog.hasLiked, blog.likesCount]);

  const blogId = blog.id || blog._id;

  const { mutate: likeBlog } = useLikeBlog();
  const { data: commentsData, isLoading: isLoadingComments } = useComments(blogId);
  const { mutate: createComment, isPending: isPosting } = useCreateComment();
  const { mutate: likeComment } = useLikeComment(blogId);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    const previousHasLiked = hasLiked;
    const previousCount = likesCount;

    setHasLiked(!previousHasLiked);
    setLikesCount(prev => previousHasLiked ? Math.max(0, prev - 1) : prev + 1);

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
      }
    });
  };

  const scrollToComments = () => {
    const element = document.getElementById('comments-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    createComment({ postId: blogId, content: commentText }, {
      onSuccess: () => {
        setCommentText("");
        toast.success("Comment posted!");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to post comment.");
      }
    });
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId, {
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Action failed.");
      }
    });
  };

  const comments = commentsData?.data || [];

  return (
    <article className="bg-background transition-colors duration-500 min-h-screen py-24 md:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 min-w-0 items-start">

          {/* Article Pillar (Left) */}
          <div className="w-full min-w-0">
            {/* Header Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 text-foreground/50 text-xs font-bold uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-theme-action transition-colors">Home</Link>
                <ChevronRight size={14} className="text-foreground/30" />
                <span className="text-theme-action">{category || 'Blog'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl lg:text-[3.5rem] font-black text-foreground tracking-tight leading-[1.1] mb-6">
                {title}
              </h1>
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[600px] rounded-[2rem] overflow-hidden mb-12 shadow-sm border border-theme-accent/10 transition-transform duration-500 hover:scale-[1.01]">
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
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12 py-5 border-y border-theme-accent/10">

              <div className="flex items-center gap-8">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2.5 group transition-all"
                >
                  <Heart
                    size={22}
                    fill={hasLiked ? "#ef4444" : "none"}
                    className={hasLiked ? "text-red-500 scale-110" : "text-foreground/50 group-hover:text-red-500 group-hover:scale-110 transition-transform"}
                  />
                  <span className={`text-sm font-black ${hasLiked ? "text-foreground" : "text-foreground/50"}`}>
                    {likesCount.toLocaleString()}
                  </span>
                </button>

                <button
                  onClick={scrollToComments}
                  className="flex items-center gap-2.5 group transition-all"
                >
                  <MessageCircle size={22} className="text-foreground/50 group-hover:text-theme-action group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-foreground/50">{comments.length}</span>
                </button>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 group transition-all p-2 rounded-full hover:bg-theme-element-sec border border-transparent hover:border-theme-accent/20"
              >
                <Share2 size={20} className="text-foreground/50 group-hover:text-foreground transition-colors" />
                <span className="text-xs font-black text-foreground/50 uppercase tracking-widest hidden sm:block">Share</span>
              </button>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-14">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-theme-element-sec text-foreground/70 rounded-xl text-xs font-black uppercase tracking-widest border border-theme-accent/10 hover:border-theme-action/30 hover:text-theme-action transition-all cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Body Content */}
            <div className="max-w-none bg-theme-element md:p-12 md:rounded-[3rem] border-transparent md:border-theme-accent/10 md:border md:shadow-[0_8px_40px_rgba(0,0,0,0.02)] dark:md:shadow-none">
              <div
                className="ql-editor prose prose-lg md:prose-xl max-w-none break-words overflow-hidden text-foreground/80
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
                  prose-p:leading-relaxed prose-p:mb-8 prose-p:font-medium
                  prose-a:text-theme-action prose-a:no-underline hover:prose-a:underline hover:prose-a:underline-offset-4
                  prose-strong:text-foreground prose-strong:font-black
                  prose-img:rounded-3xl prose-img:shadow-sm prose-img:max-w-full prose-img:border prose-img:border-theme-accent/10
                  prose-blockquote:border-l-4 prose-blockquote:border-theme-action prose-blockquote:bg-theme-action/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-foreground/90 font-medium
                  prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:bg-theme-element-sec prose-pre:border prose-pre:border-theme-accent/20 prose-pre:shadow-sm
                  prose-code:text-theme-action prose-code:bg-theme-action/10 prose-code:rounded-lg prose-code:px-2 prose-code:py-0.5 prose-code:font-bold"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* Comment Section (Redesigned) */}
            <div id="comments-section" className="mt-20 pt-16 border-t border-theme-accent/10">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-8 rounded-full bg-theme-action" />
                <h4 className="text-2xl font-black text-foreground tracking-tight">Discussion ({comments.length})</h4>
              </div>

              <div className="space-y-12">
                {/* Comment Input */}
                <div className="flex gap-4">
                  <div className="hidden sm:flex w-12 h-12 rounded-full bg-theme-element shrink-0 items-center justify-center text-foreground/50 border border-theme-accent/20">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-theme-element border border-theme-accent/20 text-foreground rounded-2xl p-5 text-base focus:outline-none focus:ring-2 focus:ring-theme-action/20 focus:border-theme-action transition-all resize-none shadow-sm placeholder:text-foreground/30 font-medium"
                      placeholder="What are your thoughts?"
                      rows={3}
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handlePostComment}
                        disabled={isPosting || !commentText.trim()}
                        className="px-8 py-3 bg-foreground text-background rounded-xl text-sm font-black hover:scale-105 transition-all shadow-md disabled:opacity-50 active:scale-95"
                      >
                        {isPosting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6 mt-8">
                  {isLoadingComments ? (
                    <div className="flex items-center gap-3 text-foreground/50 font-black uppercase tracking-widest text-xs">
                      <Loader2 className="animate-spin text-theme-action" size={16} />
                      Loading thoughts...
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((cmt: any, i: number) => (
                      <div key={cmt.id || cmt._id || i} className="flex gap-4 p-6 rounded-[2rem] bg-theme-element border border-theme-accent/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-theme-action/10 shrink-0 flex items-center justify-center font-black text-theme-action text-base border border-theme-action/20">
                          {cmt.authorId?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-black text-foreground text-base">
                              {cmt.authorId?.firstName} {cmt.authorId?.lastName}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-theme-accent/20 hidden sm:block" />
                            <span className="text-xs font-bold uppercase tracking-widest text-foreground/40">{new Date(cmt.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-foreground/80 text-base leading-relaxed font-medium mb-3">{cmt.content}</p>
                          <div className="flex gap-4">
                            <button
                              onClick={() => handleLikeComment(cmt._id)}
                              className="flex items-center gap-2 group transition-colors px-3 py-1.5 rounded-lg bg-theme-element-sec border border-transparent hover:border-theme-accent/20"
                            >
                              <Heart
                                size={14}
                                fill={cmt.hasLiked ? "#ef4444" : "none"}
                                className={cmt.hasLiked ? "text-red-500" : "text-foreground/40 group-hover:text-red-500"}
                              />
                              <span className={`text-xs font-black ${cmt.hasLiked ? "text-foreground" : "text-foreground/50"}`}>
                                {cmt.likesCount || 0}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/40 text-sm font-black uppercase tracking-widest italic pt-4 pl-4 border-l-2 border-theme-accent/10">No comments yet. Start the conversation!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="relative min-w-0">
            <div className="sticky top-32 space-y-8 flex flex-col w-full">

              {/* Author Card Profile */}
              <div className="p-8 bg-theme-element rounded-[2rem] border border-theme-accent/20 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-md bg-theme-action/10 text-theme-action flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">About The Author</h4>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-theme-action text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-foreground font-black text-lg mb-1">{authorName}</h3>
                    <p className="text-foreground/60 text-xs font-bold uppercase tracking-widest">{authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Stats & Actions Card */}
              <div className="p-8 bg-theme-element rounded-[2rem] border border-theme-accent/20 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Heart size={14} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Post Activity</h4>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-5 border-b border-theme-accent/10">
                    <span className="text-xs font-black uppercase tracking-widest text-foreground/50">Total Likes</span>
                    <span className="text-xl font-black text-foreground">{likesCount}</span>
                  </div>
                  <div className="flex items-center justify-between pb-5 border-b border-theme-accent/10">
                    <span className="text-xs font-black uppercase tracking-widest text-foreground/50">Comments</span>
                    <span className="text-xl font-black text-foreground">{comments.length}</span>
                  </div>
                </div>

                <button
                  onClick={handleLike}
                  className={`w-full mt-8 py-4 rounded-xl font-black text-sm transition-all focus:outline-none flex justify-center hover:scale-105 active:scale-95 shadow-md ${hasLiked
                    ? "bg-red-500 text-white shadow-red-500/20"
                    : "bg-theme-element-sec text-foreground border border-theme-accent/20 hover:border-foreground/30 hover:shadow-foreground/5"
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
          <div className="mt-32 pt-20 border-t border-theme-accent/10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-8 rounded-full bg-theme-action" />
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                More to read
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

