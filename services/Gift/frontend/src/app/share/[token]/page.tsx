"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/axios';

export default function SharedLinkView() {
    const params = useParams();
    const token = params.token as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            api.get(`/share/${token}`)
                .then(res => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.response?.data?.error || 'Shared link not found or expired');
                    setLoading(false);
                });
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="glassmorphism p-8 rounded-3xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Link Unavailable</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                <header className="mb-12 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                        Exclusive Selection
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                        Curated Products Just For You
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Review this specially selected collection of premium items.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data?.selectedProducts.map((product: any, idx: number) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="relative aspect-[4/3] bg-secondary/20 overflow-hidden">
                                {product.thumbnail ? (
                                    <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute top-3 left-3 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                                        Out of Stock
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="text-sm text-primary font-medium mb-2">{product.category}</div>
                                <h3 className="text-xl font-bold mb-2 line-clamp-1">{product.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{product.description}</p>
                                <div className="flex items-end justify-between mt-auto">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Price</div>
                                        <div className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
