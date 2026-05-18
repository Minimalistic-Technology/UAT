"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Eye, Heart, Clock, ArrowRight, Flame } from "lucide-react";
import { api } from "@/lib/api";

interface TrendPost {
    _id: string;
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
        ref.current.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
    };
    const leave = () => { if (ref.current) ref.current.style.transform = "perspective(700px) rotateY(0) rotateX(0) translateZ(0)"; };
    return React.cloneElement(children as React.ReactElement<any>, { ref, onMouseMove: move, onMouseLeave: leave });
}

/* ── Rank badge colours ───────────────────────────────────────── */
const RANK_STYLES = [
    "bg-yellow-400 text-yellow-950",
    "bg-gray-300 text-gray-800",
    "bg-amber-600 text-white",
];

export default function TrendingSection() {
    const [posts, setPosts] = useState<TrendPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/posts/trending?limit=6")
            .then(res => setPosts(res.data?.data?.items || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <section className="w-full px-[5%] py-20 bg-white">
            <div className="max-w-[1200px] mx-auto flex justify-center">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#1877F2] border-t-transparent animate-spin" />
                </div>
            </div>
        </section>
    );

    if (!posts.length) return null;

    const [topPost, ...rest] = posts;

    return (
        <section className="w-full px-[5%] py-20 bg-white border-t border-gray-50">
            <div className="max-w-[1200px] mx-auto">

                {/* Section Header */}
                <Reveal>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-14">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <Flame size={16} className="text-orange-500" />
                                </div>
                                <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Trending Now</p>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                                Most <span className="text-[#1877F2]">Viewed</span> Blogs
                            </h2>
                        </div>
                        <Link href="/blog" className="group flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shrink-0">
                            All Articles
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </Reveal>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Hero Card (Top Post) */}
                    <Reveal delay={0}>
                        <TiltCard>
                            <Link
                                href={`/blog/${topPost.slug}`}
                                className="group lg:col-span-3 flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200/80 transition-all duration-300 will-change-transform"
                                style={{ gridColumn: "span 3" }}
                            >
                                <div className="relative w-full aspect-video overflow-hidden bg-gray-50 m-3 rounded-2xl" style={{ marginBottom: 0 }}>
                                    {topPost.coverImage?.url || topPost.coverImageUrl ? (
                                        <Image src={topPost.coverImage?.url || topPost.coverImageUrl || ""} alt={topPost.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                            <TrendingUp size={40} className="text-blue-200" />
                                        </div>
                                    )}
                                    {/* #1 Rank Badge */}
                                    <div className={`absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full text-xs font-black shadow-md ${RANK_STYLES[0]}`}>
                                        #1
                                    </div>
                                    {/* View Count Chip */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10">
                                        <Eye size={11} />
                                        {Number(topPost.viewCount || 0).toLocaleString()} views
                                    </div>
                                </div>
                                <div className="p-6">
                                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#1877F2] mb-2">
                                        {topPost.category || topPost.tags?.[0] || "Featured"}
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-[#1877F2] transition-colors">{topPost.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{topPost.description}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Heart size={11} className="text-rose-400" /> {topPost.likesCount}</span>
                                        <span className="flex items-center gap-1"><Clock size={11} /> {topPost.readTime || 1} min</span>
                                        <span>{topPost.authorId?.firstName} {topPost.authorId?.lastName}</span>
                                    </div>
                                </div>
                            </Link>
                        </TiltCard>
                    </Reveal>

                    {/* Sidebar List (#2 to #6) */}
                    <div className="lg:col-span-2 flex flex-col gap-4" style={{ gridColumn: "span 2" }}>
                        {rest.slice(0, 5).map((post, i) => (
                            <Reveal key={post._id} delay={(i + 1) * 60}>
                                <Link href={`/blog/${post.slug}`} className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#1877F2]/30 hover:shadow-md transition-all">
                                    {/* Rank */}
                                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[11px] font-black ${RANK_STYLES[i + 1] || "bg-gray-100 text-gray-600"}`}>
                                        #{i + 2}
                                    </div>
                                    {/* Thumbnail */}
                                    <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                        {post.coverImage?.url || post.coverImageUrl ? (
                                            <Image src={post.coverImage?.url || post.coverImageUrl || ""} alt={post.title} fill sizes="(max-width: 768px) 100px, 150px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100" />
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-gray-900 line-clamp-2 group-hover:text-[#1877F2] transition-colors leading-snug mb-1.5">{post.title}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Eye size={10} /> {Number(post.viewCount || 0).toLocaleString()}</span>
                                            <span className="flex items-center gap-1"><Heart size={10} className="text-rose-300" /> {post.likesCount}</span>
                                        </div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
