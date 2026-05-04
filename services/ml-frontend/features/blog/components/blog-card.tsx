import React from "react";
import Link from "next/link";
import { Calendar, User, ArrowRight, Tag, Clock } from "lucide-react";
import { BlogResponse } from "../types/blog-type";

interface BlogCardProps {
  blog: BlogResponse["data"];
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const {
    title,
    excerpt,
    content,
    coverImage,
    coverImageUrl,
    tags,
    authorId,
    createdAt,
    category,
  } = blog;
  const imageUrl = coverImage?.url || coverImageUrl;

  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Handle author info safely
  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`
    : "John Doe";

  // Estimate reading time
  const wordCount = content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200) || 5;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      prefetch
      className="group flex flex-col bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1"
    >
      {/* Cover Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden m-3 rounded-[1rem]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <Tag className="w-8 h-8 text-gray-200" />
          </div>
        )}

        {/* Category Overlay */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-[#1877F2] text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg">
            {category || tags[0] || "Insights"}
          </span>
        </div>

        {/* Author Overlay (New) */}
        {/* <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] text-white font-bold uppercase">
            {authorName.charAt(0)}
          </div>
          <span className="text-white text-[10px] font-bold truncate max-w-[88px]">{authorName}</span>
        </div> */}
      </div>

      {/* Content Section */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        {/* Title */}
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#1877F2] transition-colors cursor-pointer">
            {title}
          </h3>
        </div>

        {/* Excerpt */}
        <p className="text-gray-400 text-xs line-clamp-2 mb-6 leading-relaxed">
          {excerpt ||
            "Learn how to tackle challenges with expert guidance and insights."}
        </p>

        {/* Footer Metadata (Compact) */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>{readingTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
