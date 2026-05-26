"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift, PackageOpen, AlertCircle, Calendar } from 'lucide-react';
import api from '@/lib/axios';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

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
                    setError(err.response?.data?.error || 'Gift collection not found or expired');
                    setLoading(false);
                });
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="space-y-8 w-full max-w-6xl px-4">
                    <div className="text-center space-y-4 mb-16">
                        <Skeleton className="h-8 w-32 mx-auto rounded-full" />
                        <Skeleton className="h-12 w-3/4 max-w-md mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-destructive/20">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Link Unavailable</h1>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto">{error}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Background Glow */}
            <div className="absolute top-0 inset-x-0 h-96 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.15),transparent_70%)]" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-24">

                {/* Header */}
                <header className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 flex items-center justify-center gap-2 mx-auto w-fit">
                        <Gift className="w-4 h-4" /> {APP_NAME} Collection
                    </motion.div>

                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        A Gift Chosen <span className="text-primary">Specially</span> For You
                    </motion.h1>

                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Open up to see the curated selection of premium products assigned to your profile.
                    </motion.p>
                </header>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {data?.selectedProducts.map((product: any, idx: number) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (idx * 0.1), duration: 0.5 }}
                            >
                                <Card className="overflow-hidden group h-full border border-border/50 hover:border-primary/45 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 bg-card flex flex-col rounded-2xl">
                                    <div className="relative aspect-[4/3] bg-white flex items-center justify-center p-6 border-b border-border/40 overflow-hidden">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.title}
                                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground/45">
                                                <PackageOpen className="w-10 h-10 mb-2" />
                                                <span className="text-sm font-medium">No Image</span>
                                            </div>
                                        )}

                                        {product.stock === 0 && (
                                            <Badge variant="destructive" className="absolute top-4 left-4 shadow-md font-semibold text-xs px-2.5 py-0.5">
                                                Out of Stock
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="absolute top-4 right-4 shadow-sm font-bold text-sm bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md px-3 py-1 border-none rounded-full">
                                            ${product.price?.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-6 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="text-xs uppercase tracking-wider text-primary font-bold mb-2.5">{product.category}</div>
                                            <h3 className="text-xl font-bold mb-2 text-foreground line-clamp-2 leading-snug">{product.title}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{product.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {data?.expiryDate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" /> This gift collection is available until {new Date(data.expiryDate).toLocaleDateString()}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
