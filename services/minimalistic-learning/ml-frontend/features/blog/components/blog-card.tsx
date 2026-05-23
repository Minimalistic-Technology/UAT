"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Clock, Heart, ArrowUpRight } from "lucide-react";
import { BlogResponse } from "../types/blog-type";

interface BlogCardProps {
  blog: BlogResponse["data"];
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const {
    title, excerpt, content, coverImage, coverImageUrl,
    tags, authorId, createdAt, category, likesCount,
  } = blog;

  const imageUrl = coverImage?.url || coverImageUrl;
  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`.trim()
    : "Author";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const readingTime = Math.max(Math.ceil((content?.split(/\s+/).length || 0) / 200), 1);

  /* ── 3D Tilt ────────────────────────────────────────────────────── */
  const card = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = card.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
  };

  const handleLeave = () => {
    if (card.current)
      card.current.style.transform = "perspective(700px) rotateY(0) rotateX(0) translateZ(0)";
  };

  const displayCategory = category || tags?.[0] || "Insights";

  return (
    <Link
      ref={card}
      href={`/blog/${blog.slug}`}
      prefetch
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group flex flex-col bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200/80 dark:hover:shadow-gray-900/50 transition-all duration-300 ease-out will-change-transform"
      style={{ transition: "box-shadow 0.3s ease, transform 0.2s ease" }}
    >
      {/* ── Cover Image ─────────────────────────────────────────────── */}
      <div className="relative aspect-[16/10] overflow-hidden m-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <Tag className="w-8 h-8 text-blue-200" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border border-white/40 dark:border-gray-700/50">
            {displayCategory}
          </span>
        </div>

        {/* Likes badge */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-white/10">
            <Heart size={11} className="text-rose-400 fill-rose-400" />
            <span className="text-white text-[10px] font-black">{likesCount || 0}</span>
          </div>
        </div>

        {/* Arrow icon — appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
          <div className="w-8 h-8 rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm shadow-md flex items-center justify-center">
            <ArrowUpRight size={15} className="text-gray-800 dark:text-gray-200" />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 pb-6 pt-2 flex flex-col">
        {/* Author */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[11px] font-black text-[#1877F2] shrink-0">
            {authorInitial}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
            {authorName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2.5 line-clamp-2 leading-snug group-hover:text-[#1877F2] transition-colors duration-200">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-[13px] line-clamp-2 leading-relaxed mb-5 flex-1">
          {excerpt || "Discover the depths of this story and explore new perspectives on learning."}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {formattedDate}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <Clock size={11} className="text-gray-300" />
            {readingTime} min read
          </div>
        </div>
      </div>
    </Link>
  );
};
