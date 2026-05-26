"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Package, FileText, Layout, Key, Eye, Gift } from "lucide-react";
import UserNavbar from "@/components/UserNavbar";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

const services = [
    {
        icon: Package,
        title: "Catalog Management",
        desc: "Upload and maintain an unlimited collection of premium product listings with clear images, pricing, categorization and stock control.",
        benefits: ["Cloudinary CDN image staging", "Categorization filters", "Realtime stock status tracking"]
    },
    {
        icon: Layout,
        title: "Personalized Link Bundling",
        desc: "Build special custom link packages that bind specific inventory items together as a combined selection for individual recipients.",
        benefits: ["Multi-product selection bundles", "Recipients only see pre-assigned items", "Reusable custom link generator"]
    },
    {
        icon: Key,
        title: "Security & Expiry Controls",
        desc: "Apply optional expiration parameters and password barriers to guarantee only approved recipients can unwrap your shared collections.",
        benefits: ["Password protected gift collections", "Specific date-time link expiration validation", "Private user profile credentials lock"]
    },
    {
        icon: Eye,
        title: "Stunning Reveal Aesthetics",
        desc: "Deliver a delightful presentation with smooth animations, sleek typography, and high-fidelity showcase cards designed to impress.",
        benefits: ["Interactive unwrap reveal flow", "Equal sizing cards responsive layouts", "Aspect ratio studio quality imaging"]
    }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
            <div>
                <UserNavbar />

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(var(--primary-rgb),0.08),transparent)]" />
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <Badge variant="secondary" className="mb-6 px-4 py-1 rounded-full text-sm font-medium">
                            Capabilities
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight"
                        >
                            Tailored Features Designed for <span className="text-primary">Stunning Delivery</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        >
                            Explore the core services built inside {APP_NAME} to make curate-and-share operations fast, secure, and visually breathtaking.
                        </motion.p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="max-w-6xl mx-auto px-6 py-12 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((s, i) => (
                            <motion.div
                                key={s.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all duration-300 rounded-2xl">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-xl">{s.title}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                                        <div className="space-y-2 pt-2 border-t border-border/40">
                                            {s.benefits.map((b) => (
                                                <div key={b} className="flex items-center gap-2 text-xs text-foreground/80">
                                                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    <span>{b}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-border bg-card py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{APP_NAME}</span>
                    </div>
                    <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
