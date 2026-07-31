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
    title,
    excerpt,
    content,
    coverImage,
    coverImageUrl,
    tags,
    authorId,
    category,
    likesCount,
    readTime,
  } = blog;

  const imageUrl = coverImage?.url || coverImageUrl;
  const author = authorId as any;
  const authorName = author?.firstName
    ? `${author.firstName} ${author.lastName || ""}`.trim()
    : "Author";
  const authorInitial = authorName.charAt(0).toUpperCase();

  const readingTime =
    readTime ||
    Math.max(Math.ceil((content?.split(/\s+/).length || 0) / 200), 1);

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
      card.current.style.transform =
        "perspective(700px) rotateY(0) rotateX(0) translateZ(0)";
  };

  const displayCategory = category || tags?.[0] || "Insights";

  return (
    <Link
      ref={card}
      href={`/blog/${blog.slug}`}
      prefetch
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ease-out will-change-transform hover:shadow-2xl hover:shadow-gray-200/80 dark:border-gray-800/60 dark:bg-gray-950 dark:hover:shadow-gray-900/50"
      style={{ transition: "box-shadow 0.3s ease, transform 0.2s ease" }}
    >
      {/* ── Cover Image ─────────────────────────────────────────────── */}
      <div className="relative m-3 aspect-[16/10] overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="group- object-cover transition-transform duration-700"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Tag className="h-8 w-8 text-blue-200" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-gray-900/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full border border-white/40 bg-white/95 px-3 py-1.5 text-[10px] font-black tracking-widest text-gray-800 uppercase shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/90 dark:text-gray-200">
            {displayCategory}
          </span>
        </div>

        {/* Likes badge */}
        <div className="absolute right-3 bottom-3 flex translate-y-1 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
            <Heart size={11} className="fill-rose-400 text-rose-400" />
            <span className="text-[10px] font-black text-white">
              {likesCount || 0}
            </span>
          </div>
        </div>

        {/* Arrow icon — appears on hover */}
        <div className="absolute top-3 right-3 -translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm dark:bg-gray-900/90">
            <ArrowUpRight
              size={15}
              className="text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-6 pt-2 pb-6">
        {/* Author */}
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#1877F2]/20 bg-[#1877F2]/10 text-[11px] font-black text-[#1877F2]">
            {authorInitial}
          </div>
          <span className="truncate text-[10px] font-black tracking-widest text-gray-400 uppercase">
            {authorName}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2.5 line-clamp-2 text-lg leading-snug font-black text-gray-900 transition-colors duration-200 group-hover:text-[#1877F2] dark:text-gray-100">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="mb-5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-gray-400">
          {excerpt ||
            "Discover the depths of this story and explore new perspectives on learning."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-100 pt-4 dark:border-gray-800/60">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            <Clock size={11} className="text-gray-300" />
            {readingTime} min read
          </div>
        </div>
      </div>
    </Link>
  );
};
