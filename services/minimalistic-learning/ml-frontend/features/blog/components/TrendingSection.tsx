"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Eye, Heart, Clock, ArrowRight, Flame } from "lucide-react";
import { api } from "@/lib/api";

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

/* ── Scroll Reveal ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(28px)", transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms` }}>
            {children}
        </div>
    );
}

/* ── 3D Tilt Card ──────────────────────────────────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLAnchorElement>(null);
    const move = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        ref.current.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(5px)`;
    };
    const leave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) translateZ(0)"; };
    return React.cloneElement(children as React.ReactElement<any>, { ref, onMouseMove: move, onMouseLeave: leave });
}

/* ── Rank badge colours ───────────────────────────────────────── */
const RANK_STYLES = [
    "bg-yellow-500 text-white shadow-yellow-500/30",
    "bg-gray-400 text-white shadow-gray-400/30",
    "bg-amber-600 text-white shadow-amber-600/30",
];

export default function TrendingSection() {
    const [posts, setPosts] = useState<TrendPost[]>([]);
    const [homeContent, setHomeContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/posts/trending?limit=6")
            .then(res => setPosts(res.data?.data?.items || []))
            .catch(() => { })
            .finally(() => setLoading(false));

        api.get('/public/content/home')
            .then(res => { if (res.data?.data?.hero) setHomeContent(res.data.data.hero); })
            .catch(() => { });
    }, []);

    if (loading) return (
        <section className="w-full px-[5%] py-24 bg-background">
            <div className="max-w-[1200px] mx-auto flex justify-center">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-theme-accent/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" />
                </div>
            </div>
        </section>
    );

    if (!posts.length) return null;

    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-background border-t border-theme-accent/10 relative">
            <div className="max-w-7xl mx-auto relative z-10">

                {/* Section Header */}
                <Reveal>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                    <Flame size={16} className="text-orange-500" />
                                </div>
                                <p className="text-xs font-black text-orange-500 uppercase tracking-widest">{homeContent?.trendingBadge || 'Trending Now'}</p>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter leading-tight relative">
                                {homeContent?.trendingTitle || 'Most Viewed Blogs'}
                            </h2>
                        </div>
                        <Link href="/blog" className="group flex items-center gap-3 px-8 py-3.5 bg-foreground text-background rounded-full text-sm font-bold hover:scale-105 active:scale-95 shadow-md shadow-foreground/10 transition-all shrink-0">
                            See All Articles
                            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                    </div>
                </Reveal>

                {/* Symmetrical Horizontal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {posts.map((post, i) => (
                        <Reveal key={post.id || post._id} delay={i * 80}>
                            <TiltCard>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col h-full bg-theme-element border border-theme-accent/20 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-none hover:border-theme-action/40 transition-all duration-500 will-change-transform"
                                >
                                    <div className="relative w-full aspect-video overflow-hidden bg-theme-element-sec border-b border-theme-accent/10">
                                        {post.coverImage?.url || post.coverImageUrl ? (
                                            <Image
                                                src={post.coverImage?.url || post.coverImageUrl || ""}
                                                alt={post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-theme-element-sec flex items-center justify-center">
                                                <TrendingUp size={40} className="text-foreground/20" />
                                            </div>
                                        )}

                                        {/* Rank Badge */}
                                        <div className={`absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-xl text-sm font-black shadow-md ${RANK_STYLES[i] || "bg-theme-element-sec text-foreground shadow-sm border border-theme-accent/30"}`}>
                                            #{i + 1}
                                        </div>

                                        {/* View Count floating */}
                                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-background/90 backdrop-blur-md text-foreground text-[10px] font-black px-3 py-1.5 rounded-xl border border-theme-accent/20">
                                            <Eye size={12} className="text-theme-action" />
                                            {Number(post.viewCount || 0).toLocaleString()} views
                                        </div>
                                    </div>

                                    <div className="p-7 flex-1 flex flex-col">
                                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-theme-action mb-3">
                                            {post.category || post.tags?.[0] || "Featured"}
                                        </span>
                                        <h3 className="text-xl font-black text-foreground leading-tight mb-3 line-clamp-2 group-hover:text-theme-action transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-foreground/60 text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                                            {post.description || "Read more about this trending topic..."}
                                        </p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-foreground/50 uppercase tracking-widest mt-auto">
                                            <span className="flex items-center gap-1.5"><Heart size={14} className="text-red-500 fill-red-500/20" /> {post.likesCount}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-theme-action" /> {post.readTime || 1} min read</span>
                                        </div>
                                    </div>
                                </Link>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
