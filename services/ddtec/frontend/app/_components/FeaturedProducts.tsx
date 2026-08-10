"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Search, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "../_context/CartContext";
import api from "@/lib/api";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    stock: number;
}

export default function FeaturedProducts() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await api.get("/products");
                const allProducts: Product[] = res.data || [];
                // Sort by lastMonthSales or rating to find top featured products
                const featured = [...allProducts]
                    .sort((a, b) => (b.lastMonthSales || 0) + (b.rating || 0) - ((a.lastMonthSales || 0) + (a.rating || 0)))
                    .slice(0, 8);
                setProducts(featured.length > 0 ? featured : allProducts.slice(0, 8));
            } catch (error) {
                console.error("Failed to fetch featured products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? Math.max(0, products.length - 3) : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= products.length - 3 ? 0 : prev + 1));
    };

    if (loading) {
        return (
            <section id="featured" className="py-16 bg-slate-900/40 border-y border-slate-800 flex justify-center items-center">
                <Loader2 className="size-8 text-teal-500 animate-spin" />
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section id="featured" className="py-20 bg-slate-900/60 border-y border-slate-800/60 relative overflow-hidden px-6">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <Sparkles className="size-3.5" /> Spotlight Hardware
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                            Featured Products
                        </h2>
                        <p className="text-slate-400 text-sm mt-1 max-w-md">
                            High-demand, field-tested tools built for extreme conditions and peak efficiency.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 border border-slate-700"
                            aria-label="Previous Products"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 border border-slate-700"
                            aria-label="Next Products"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Products Slider */}
                <div className="overflow-hidden rounded-3xl">
                    <motion.div
                        className="flex gap-6 transition-all duration-500 ease-out"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / Math.min(3, products.length))}%)`
                        }}
                    >
                        {products.map((product) => (
                            <div
                                key={product._id}
                                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 group relative bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="relative h-48 bg-slate-950/60 rounded-2xl p-4 overflow-hidden mb-4 flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image.startsWith("http") || product.image.startsWith("/") ? product.image : `/${product.image}`}
                                                alt={product.name}
                                                className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="text-slate-600 text-xs">No image</div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md border border-teal-500/30">
                                            ₹{product.price}
                                        </div>
                                        {product.lastMonthSales > 30 && (
                                            <div className="absolute top-3 left-3 bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                                                <Star className="size-3 fill-current" /> TOP SELLER
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/product/${product._id}`} className="block group-hover:text-teal-400 transition-colors">
                                        <h3 className="font-bold text-white text-lg line-clamp-1 mb-1" title={product.name}>
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                                        {product.description || "Industrial specification high performance tool."}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center text-amber-400">
                                            <Star className="size-4 fill-current" />
                                            <span className="ml-1 text-xs font-bold text-slate-200">{product.rating || 4.5}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">({product.numReviews || 12} reviews)</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => addToCart(product._id)}
                                            disabled={product.stock === 0}
                                            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            <ShoppingBag className="size-3.5" /> Add
                                        </button>
                                        <Link
                                            href={`/product/${product._id}`}
                                            className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 text-center shadow-lg shadow-teal-600/20"
                                        >
                                            <Search className="size-3.5" /> View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
