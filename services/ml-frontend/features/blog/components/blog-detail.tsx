import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, ThumbsUp, ThumbsDown, Tag, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';
import { useUpvoteBlog } from '../hooks/use-upvote-blog';
import { useComments } from '../hooks/use-comments';
import { useCreateComment } from '../hooks/use-create-comment';

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

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ''}`
    : 'John Doe';
  const authorRole = author?.role || 'Technical Content Creator';

  const [commentText, setCommentText] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(blog.hasUpvoted || false);
  const [upvotesCount, setUpvotesCount] = useState(blog.upvotesCount || 0);

  useEffect(() => {
    setHasUpvoted(blog.hasUpvoted || false);
    setUpvotesCount(blog.upvotesCount || 0);
  }, [blog.hasUpvoted, blog.upvotesCount]);

  const { mutate: upvote } = useUpvoteBlog();
  const { data: commentsData, isLoading: isLoadingComments } = useComments(blog._id);
  const { mutate: createComment, isPending: isPosting } = useCreateComment();

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
    const previousHasUpvoted = hasUpvoted;
    const previousCount = upvotesCount;

    setHasUpvoted(!previousHasUpvoted);
    setUpvotesCount(prev => previousHasUpvoted ? Math.max(0, prev - 1) : prev + 1);

    upvote(blog._id, {
      onSuccess: (res: any) => {
        if (res?.data) {
          setHasUpvoted(res.data.hasUpvoted);
          setUpvotesCount(res.data.upvotes);
        }
      },
      onError: () => {
        setHasUpvoted(previousHasUpvoted);
        setUpvotesCount(previousCount);
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

            {/* Tags (Moved below image) */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-16">
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
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Join the discussion</h4>
                </div>

                <div className="space-y-12">
                  {/* Comment Input */}
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm focus:outline-none focus:border-[#1877F2] transition-colors resize-none placeholder:text-gray-400"
                        placeholder="What are your thoughts on this story?"
                        rows={3}
                      />
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handlePostComment}
                          disabled={isPosting || !commentText.trim()}
                          className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {isPosting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-10 pl-6 sm:pl-12">
                    {isLoadingComments ? (
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium italic">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-[#1877F2] rounded-full animate-spin" />
                        Loading thoughts...
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((cmt: any, i: number) => (
                        <div key={cmt._id || i} className="flex gap-6 relative">
                          {/* Connecting line */}
                          <div className="absolute top-0 -left-6 sm:-left-12 bottom-0 w-[1px] bg-gray-100" />

                          <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center font-bold text-[#1877F2] text-sm border border-gray-50">
                            {cmt.authorId?.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-900 text-sm">
                                {cmt.authorId?.firstName} {cmt.authorId?.lastName}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">• {new Date(cmt.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{cmt.content}</p>
                            <div className="flex gap-4 mt-4">
                              <button className="text-[10px] font-bold text-gray-400 hover:text-[#1877F2] transition-colors uppercase tracking-widest">Like ({cmt.likesCount})</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="relative min-w-0">
            <div className="sticky top-32 space-y-12 flex flex-col w-full">

              {/* Category Section */}
              <div className="space-y-4 w-full">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100 rounded-md">
                    {category || 'News'}
                  </span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-100 rounded-md">
                    Insights
                  </span>
                </div>
              </div>

              {/* Author Section */}
              <div className="space-y-4 w-full">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Written by</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100 shadow-sm shrink-0">
                    {author?.avatar ? (
                      <img src={author.avatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-bold text-sm leading-tight mb-0.5">{authorName}</p>
                    <p className="text-gray-400 text-[11px] font-medium leading-tight">{authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 w-full">
                <h4 className="text-sm font-black text-gray-900 mb-4">Share this story</h4>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={scrollToComments}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`h-10 px-3 min-w-[40px] rounded-full border flex items-center justify-center gap-1.5 transition-colors ${hasUpvoted ? 'bg-blue-50 border-[#1877F2] text-[#1877F2]' : 'bg-white border-gray-100 text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2]'}`}
                  >
                    <ThumbsUp size={18} fill={hasUpvoted ? 'currentColor' : 'none'} />
                    {upvotesCount > 0 && <span className="text-xs font-bold">{upvotesCount}</span>}
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* Latest Insights Section */}
        {latestBlogs.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
            {/* <div className="flex items-center gap-3 mb-12">
              <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Blog and articles</h4>
            </div> */}

            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-12">
              Recommended for you
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
