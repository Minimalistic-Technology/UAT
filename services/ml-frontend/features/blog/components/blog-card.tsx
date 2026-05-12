import React from "react";
import Link from "next/link";
import { Tag, Clock, Heart, MessageCircle } from "lucide-react";
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
    likesCount,
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
      className="group flex flex-col bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200 hover:-translate-y-2"
    >
      {/* Cover Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[2rem]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <Tag className="w-8 h-8 text-gray-200" />
          </div>
        )}

        {/* Category Overlay */}
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border border-white/20">
            {category || tags[0] || "Insights"}
          </span>
        </div>

        {/* Interactions Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5">
            <Heart size={12} className="text-white fill-white" />
            <span className="text-white text-[10px] font-black">{likesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-8 pb-8 flex flex-col">
        {/* Author info */}
        <div className="flex items-center gap-2 mb-4">
           <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-[#1877F2] border border-blue-100">
             {authorName.charAt(0)}
           </div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{authorName}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 leading-[1.2] group-hover:text-[#1877F2] transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-xs line-clamp-2 mb-8 leading-relaxed font-medium">
          {excerpt || "Discover the depths of this story and explore new perspectives."}
        </p>

        {/* Footer Metadata */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-300" />
            <span>{readingTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
