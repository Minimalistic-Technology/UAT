import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, Heart, Tag, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';
import { useLikeBlog } from '../hooks/use-like-blog';
import { useComments } from '../hooks/use-comments';
import { useCreateComment } from '../hooks/use-create-comment';
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

  const { mutate: likeBlog } = useLikeBlog();
  const { data: commentsData, isLoading: isLoadingComments } = useComments(blog._id);
  const { mutate: createComment, isPending: isPosting } = useCreateComment();
  const { mutate: likeComment } = useLikeComment(blog._id);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleLike = () => {
    const previousHasLiked = hasLiked;
    const previousCount = likesCount;

    setHasLiked(!previousHasLiked);
    setLikesCount(prev => previousHasLiked ? Math.max(0, prev - 1) : prev + 1);

    likeBlog(blog._id, {
      onSuccess: (res: any) => {
        if (res?.data) {
          setHasLiked(res.data.hasLiked);
          setLikesCount(res.data.likes);
        }
      },
      onError: () => {
        setHasLiked(previousHasLiked);
        setLikesCount(previousCount);
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
    createComment({ postId: blog._id, content: commentText }, {
      onSuccess: () => {
        setCommentText("");
      }
    });
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
  };

  const comments = commentsData?.data || [];

  return (
    <article className="bg-white min-h-screen pt-32 pb-32">
      <div className="w-full px-[5%] max-w-[1920px] mx-auto">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-24 lg:gap-20 min-w-0">

          {/* Article Pillar (Left) */}
          <div className="w-full min-w-0">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Link href="/" className="hover:text-[#1877F2] transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-[#1877F2]">{category || 'Blog'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
                {title}
              </h1>
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="w-[85%] aspect-[16/9] max-h-[400px] rounded-[2rem] overflow-hidden mb-8 shadow-2xl shadow-gray-50 border border-gray-100">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            {/* Interactions Bar (Instagram Style) */}
            <div className="flex items-center gap-6 mb-8 py-4 border-b border-gray-50">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 group transition-all"
              >
                <Heart 
                  size={24} 
                  fill={hasLiked ? "#FF3040" : "none"} 
                  className={hasLiked ? "text-[#FF3040] scale-110" : "text-gray-900 group-hover:text-[#FF3040] group-hover:scale-110"} 
                />
                <span className={`text-sm font-black ${hasLiked ? "text-gray-900" : "text-gray-400"}`}>
                  {likesCount.toLocaleString()}
                </span>
              </button>

              <button
                onClick={scrollToComments}
                className="flex items-center gap-2 group transition-all"
              >
                <MessageCircle size={24} className="text-gray-900 group-hover:text-[#1877F2] group-hover:scale-110" />
                <span className="text-sm font-black text-gray-400">{comments.length}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 group transition-all"
              >
                <Share2 size={24} className="text-gray-900 group-hover:text-green-500 group-hover:scale-110" />
              </button>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12">
                {tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-100 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Article Body */}
            <div className="max-w-none">
              <div
                className="ql-editor prose prose-lg max-w-none break-words overflow-hidden
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
                  prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[1.05rem] prose-p:mt-0 prose-p:mb-10
                  prose-headings:mt-16 prose-headings:mb-6
                  prose-img:block prose-img:rounded-3xl prose-img:shadow-xl prose-img:max-w-full prose-img:h-auto prose-img:ml-0 prose-img:mr-auto [&_img]:!ml-0 [&_img]:!mr-auto [&_p:has(img)]:!text-left
                  prose-blockquote:border-l-4 prose-blockquote:border-[#1877F2] prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                  prose-strong:text-gray-900 prose-strong:font-black
                  prose-a:text-[#1877F2] prose-a:no-underline hover:prose-a:underline
                  prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:rounded-2xl
                  prose-code:break-all prose-code:whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content }}
              />


              {/* Comment Section */}
              <div id="comments-section" className="mt-24 pt-20 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Discussion ({comments.length})</h4>
                </div>

                <div className="space-y-12">
                  {/* Comment Input */}
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 overflow-hidden">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 text-black rounded-2xl p-6 text-sm focus:outline-none focus:border-[#1877F2] transition-colors resize-none placeholder:text-gray-400 font-bold"
                        placeholder="Add a comment..."
                        rows={3}
                      />
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handlePostComment}
                          disabled={isPosting || !commentText.trim()}
                          className="px-8 py-3 bg-black text-white rounded-full text-xs font-black hover:scale-105 transition-all shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {isPosting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-10 pl-2 sm:pl-4">
                    {isLoadingComments ? (
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium italic">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
                        Loading thoughts...
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((cmt: any, i: number) => (
                        <div key={cmt._id || i} className="flex gap-6 relative group">
                          <div className="w-12 h-12 rounded-full bg-blue-50 shrink-0 flex items-center justify-center font-black text-[#1877F2] text-sm border border-blue-100">
                            {cmt.authorId?.firstName?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-black text-gray-900 text-sm">
                                {cmt.authorId?.firstName} {cmt.authorId?.lastName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">• {new Date(cmt.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">{cmt.content}</p>
                            <div className="flex gap-6 mt-3">
                              <button 
                                onClick={() => handleLikeComment(cmt._id)}
                                className="flex items-center gap-1.5 group/like"
                              >
                                <Heart 
                                  size={14} 
                                  fill={cmt.hasLiked ? "#FF3040" : "none"} 
                                  className={cmt.hasLiked ? "text-[#FF3040]" : "text-gray-400 group-hover/like:text-[#FF3040]"} 
                                />
                                <span className={`text-[10px] font-black tracking-widest uppercase ${cmt.hasLiked ? "text-gray-900" : "text-gray-400"}`}>
                                  {cmt.likesCount || 0}
                                </span>
                              </button>
                              <button className="text-[10px] font-black text-gray-400 hover:text-gray-900 tracking-widest uppercase">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic font-medium">No comments yet. Start the conversation!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="relative min-w-0">
            <div className="sticky top-32 space-y-12 flex flex-col w-full">

              {/* Author Section */}
              <div className="space-y-4 w-full">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Author</h4>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1877F2] font-black text-lg shrink-0">
                    {authorName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-black text-sm leading-tight mb-0.5">{authorName}</p>
                    <p className="text-gray-400 text-[11px] font-bold leading-tight uppercase tracking-wider">{authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="p-8 bg-gray-900 rounded-[2rem] text-white w-full shadow-2xl shadow-gray-200">
                <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-gray-400">Activity</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Likes</span>
                    <span className="text-lg font-black">{likesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comments</span>
                    <span className="text-lg font-black">{comments.length}</span>
                  </div>
                </div>
                <button
                  onClick={handleLike}
                  className={`w-full mt-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${hasLiked ? "bg-[#FF3040] text-white" : "bg-white text-black hover:bg-[#FF3040] hover:text-white"}`}
                >
                  {hasLiked ? "Liked Story" : "Like Story"}
                </button>
              </div>

            </div>
          </aside>
        </div>

        {/* Recommended Blogs */}
        {latestBlogs.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-12">
              Recommended stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {latestBlogs.map((item) => (
                <BlogCard key={item._id} blog={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
