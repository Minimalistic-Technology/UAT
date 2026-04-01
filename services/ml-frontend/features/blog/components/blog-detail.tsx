import React from 'react';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, ThumbsUp, ThumbsDown, Tag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BlogResponse } from '../types/blog-type';
import { BlogCard } from './blog-card';

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

  return (
    <article className="bg-white min-h-screen pt-24 pb-32">
      <div className="w-full px-[5%] max-w-[1920px] mx-auto">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-24 lg:gap-64">

          {/* Article Pillar (Left) */}
          <div className="w-full">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Link href="/" className="hover:text-[#1877F2] transition-colors">Home</Link>
                <ChevronRight size={12} />
                <span className="text-[#1877F2]">{category || 'Blog'}</span>
              </div>

              <h1 className="text-2xl sm:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
                {title}
              </h1>
            </div>

            {/* Featured Image */}
            <div className="w-full aspect-[16/8] rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-gray-50 border border-gray-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 font-bold italic uppercase tracking-widest text-sm">No cover image</span>
                </div>
              )}
            </div>

            {/* Article Body */}
            <div className="max-w-5xl">
              <div
                className="prose prose-lg max-w-none break-words
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
                  prose-p:text-gray-600 prose-p:leading-snug prose-p:text-[1rem] prose-p:mt-0 prose-p:mb-2
                  prose-headings:mt-6 prose-headings:mb-2
                  prose-img:rounded-3xl prose-img:shadow-xl
                  prose-blockquote:border-l-4 prose-blockquote:border-[#1877F2] prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic
                  prose-strong:text-gray-900 prose-strong:font-black
                  prose-a:text-[#1877F2] prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Tags */}
              <div className="mt-20 pt-10 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-100 hover:border-[#1877F2] hover:text-[#1877F2] transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment Section (Mockup) */}
              <div className="mt-24 pt-20 border-t border-gray-100">
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
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm focus:outline-none focus:border-[#1877F2] transition-colors resize-none placeholder:text-gray-400"
                        placeholder="What are your thoughts on this story?"
                        rows={3}
                      />
                      <div className="flex justify-end mt-4">
                        <button className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold hover:scale-105 transition-all shadow-xl shadow-gray-200">
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mock Comments */}
                  <div className="space-y-10 pl-6 sm:pl-12">
                    {[
                      { name: "Sarah Jenkins", role: "UX Designer", text: "Truly insightful read! The section on minimalistic design systems perfectly summarizes the current industry shift. Looking forward to more content like this." },
                      { name: "Marcus Thorne", role: "Full Stack Developer", text: "Great points about scalability. We encountered similar hurdles in our last project, and your advice on component isolation is spot on." }
                    ].map((cmt, i) => (
                      <div key={i} className="flex gap-6 relative">
                        {/* Connecting line */}
                        <div className="absolute top-0 -left-6 sm:-left-12 bottom-0 w-[1px] bg-gray-100" />

                        <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center font-bold text-[#1877F2] text-sm border border-gray-50">
                          {cmt.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 text-sm">{cmt.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">• {cmt.role}</span>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{cmt.text}</p>
                          <div className="flex gap-4 mt-4">
                            <button className="text-[10px] font-bold text-gray-400 hover:text-[#1877F2] transition-colors uppercase tracking-widest">Reply</button>
                            <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Like</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <aside className="relative">
            <div className="sticky top-32 space-y-12">

              {/* Category Section */}
              <div className="space-y-4">
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
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">Written by</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100 shadow-sm">
                    {author?.avatar ? (
                      <img src={author.avatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {authorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm leading-tight mb-0.5">{authorName}</p>
                    <p className="text-gray-400 text-[11px] font-medium leading-tight">{authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                <h4 className="text-sm font-black text-gray-900 mb-4">Share this story</h4>
                <div className="flex gap-3">
                  {[Share2, MessageCircle, ThumbsUp].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>
        </div>

        {/* Latest Insights Section */}
        {latestBlogs.length > 0 && (
          <div className="mt-32 pt-20 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-2 h-2 rounded-full bg-[#1877F2]" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Blog and articles</h4>
            </div>

            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-12">
              Latest insights and trends
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
