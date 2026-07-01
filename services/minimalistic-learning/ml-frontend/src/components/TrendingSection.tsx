"use client";

import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Eye,
  Heart,
  Clock,
  ArrowRight,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { useGetTrendingBlogs } from "@/features/blog/hooks/use-get-trending-blogs";
import { Tilt } from "@/components/ui/tilt";
import { Reveal } from "@/components/ui/reveal";

interface TrendPost {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: { url?: string };
  coverImageUrl?: string;
  authorId?: { firstName?: string; lastName?: string };
  viewCount: number;
  likesCount: number;
  readTime?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
}

interface TrendingSectionProps {
  trendingBadge?: string;
  trendingTitle?: string;
}

const RANK_STYLES = [
  "bg-yellow-500 text-white shadow-yellow-500/30",
  "bg-gray-400 text-white shadow-gray-400/30",
  "bg-amber-600 text-white shadow-amber-600/30",
];

export default function TrendingSection({
  trendingBadge,
  trendingTitle,
}: TrendingSectionProps = {}) {
  const {
    data: postsData = [],
    isLoading: loading,
    isError,
  } = useGetTrendingBlogs();
  const posts = postsData as unknown as TrendPost[];

  if (isError) {
    return (
      <section className="bg-background border-theme-accent/10 relative w-full border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full text-center">
          <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 px-6 py-12 text-red-500">
            <AlertTriangle size={48} className="mb-4 text-red-500/40" />
            <h3 className="text-xl font-bold">Unable to load trending posts</h3>
            <p className="mt-2 text-sm text-red-500/80">
              We encountered an issue while fetching the latest articles. Please
              check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (loading)
    return (
      <section className="bg-background w-full px-[5%] py-12">
        <div className="mx-auto flex max-w-[1200px] justify-center">
          <div className="relative h-12 w-12">
            <div className="border-theme-accent/20 absolute inset-0 rounded-full border-4" />
            <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        </div>
      </section>
    );

  if (!posts.length) {
    return (
      <section className="bg-background border-theme-accent/10 relative w-full border-t px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full text-center">
          <div className="border-theme-accent/20 bg-theme-element-sec mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12">
            <TrendingUp size={48} className="text-foreground/20 mb-4" />
            <h3 className="text-foreground text-xl font-bold">
              No Trending Posts Yet
            </h3>
            <p className="text-foreground/60 mt-2 text-sm">
              Check back later for the most popular articles and insights.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background border-theme-accent/10 relative w-full border-t px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full">
        {/* Section Header */}
        <Reveal>
          <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
                  <Flame size={16} className="text-orange-500" />
                </div>
                <p className="text-xs font-black tracking-widest text-orange-500 uppercase">
                  {trendingBadge || "Trending Now"}
                </p>
              </div>
              <h2 className="text-foreground relative text-4xl leading-tight font-black tracking-tighter sm:text-5xl">
                {trendingTitle || "Most Viewed Blogs"}
              </h2>
            </div>
            <Link
              href="/blog"
              className="group bg-foreground text-background shadow-foreground/10 flex shrink-0 items-center gap-3 rounded-full px-8 py-3.5 text-sm font-bold shadow-md transition-all"
            >
              See All Articles
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1.5"
              />
            </Link>
          </div>
        </Reveal>

        {/* Symmetrical Horizontal Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {posts.map((post, i) => (
            <Reveal key={post.id || post._id} delay={i * 80}>
              <Tilt
                className="h-full"
                rotationFactor={5}
                scale={1}
                perspective={800}
                translateZ={5}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group bg-theme-element border-theme-accent/20 hover:border-theme-action/40 flex h-full flex-col overflow-hidden rounded-4xl border shadow-sm transition-all duration-500 will-change-transform hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-none"
                >
                  <div className="bg-theme-element-sec border-theme-accent/10 relative aspect-video w-full overflow-hidden border-b">
                    {post.coverImage?.url || post.coverImageUrl ? (
                      <Image
                        src={post.coverImage?.url || post.coverImageUrl || ""}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="group- object-cover transition-transform duration-700"
                      />
                    ) : (
                      <div className="bg-theme-element-sec flex h-full w-full items-center justify-center">
                        <TrendingUp size={40} className="text-foreground/20" />
                      </div>
                    )}

                    {/* Rank Badge */}
                    {/* <div
                      className={`absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black shadow-md ${RANK_STYLES[i] || "bg-theme-element-sec text-foreground border-theme-accent/30 border shadow-sm"}`}
                    >
                      #{i + 1}
                    </div> */}

                    {/* View Count floating */}
                    <div className="bg-background/90 text-foreground border-theme-accent/20 absolute right-4 bottom-4 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black backdrop-blur-md">
                      <Eye size={12} className="text-theme-action" />
                      {Number(post.viewCount || 0).toLocaleString()} views
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <span className="text-theme-action mb-3 inline-block text-[10px] font-black tracking-widest uppercase">
                      {post.category || post.tags?.[0] || "Featured"}
                    </span>
                    <h3 className="text-foreground group-hover:text-theme-action mb-3 line-clamp-2 text-xl leading-tight font-black transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-foreground/60 mb-6 line-clamp-2 text-sm leading-relaxed font-medium">
                      {post.description ||
                        "Read more about this trending topic..."}
                    </p>
                    <div className="text-foreground/50 mt-auto flex items-center gap-4 text-[10px] font-black tracking-widest uppercase">
                      <span className="flex items-center gap-1.5">
                        <Heart
                          size={14}
                          className="fill-red-500/20 text-red-500"
                        />{" "}
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-theme-action" />{" "}
                        {post.readTime || 1} min read
                      </span>
                    </div>
                  </div>
                </Link>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
