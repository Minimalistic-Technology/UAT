"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Link as LinkIcon, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';

export default function LinksPage() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const { data } = await api.get('/share/analytics');
            setLinks(data.links);
        } catch (error) {
            console.error('Failed to load links', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (token: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
        alert('Copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Active Share Links</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your shared product collections</p>
                </div>
                <Link href="/admin/links/new">
                    <Button className="gap-2">
                        <Plus size={18} />
                        Create Link
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">
                        Loading your links...
                    </div>
                ) : links.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground glass-card">
                        No share links created yet. Click "Create Link" to bundle products!
                    </div>
                ) : (
                    links.map((link, idx) => (
                        <motion.div
                            key={link._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6 flex flex-col group relative"
                        >
                            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${link.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-secondary/30 rounded-xl text-primary">
                                    <LinkIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground truncate max-w-[150px]">/{link.token}</h3>
                                    <div className="text-xs text-muted-foreground">{new Date(link.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Products</span>
                                    <span className="font-medium">{link.selectedProducts.length} items</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total Views</span>
                                    <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <Eye size={14} /> {link.totalViews}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Expiry</span>
                                    <span className="font-medium flex items-center gap-1">
                                        <Calendar size={14} />
                                        {link.expiryDate ? new Date(link.expiryDate).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-2 pt-4 border-t border-secondary/50">
                                <Button variant="outline" className="flex-1 gap-2" onClick={() => copyToClipboard(link.token)}>
                                    <Copy size={16} /> Copy
                                </Button>
                                <Link href={`/share/${link.token}`} target="_blank" className="flex-1">
                                    <Button variant="secondary" className="w-full gap-2 text-primary">
                                        View <ExternalLink size={16} />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
