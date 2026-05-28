"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Compass, Shield, Users, Gift, Smile } from "lucide-react";
import UserNavbar from "@/components/UserNavbar";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GIFT";

const values = [
    {
        icon: Heart,
        title: "Thoughtful Curation",
        desc: "We believe in the power of thoughtful options. Our platform enables administrators to handpick combinations tailored perfectly to the recipient's tastes.",
    },
    {
        icon: Compass,
        title: "Seamless Experience",
        desc: "From the initial catalog upload to the final unwrapping animation, we optimize every transaction step to feel natural, smooth, and modern.",
    },
    {
        icon: Shield,
        title: "Privacy First",
        desc: "Security is non-negotiable. Authenticated assignments mean that only the intended recipient will ever see their curated collections.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
            <div>
                <UserNavbar />

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(var(--primary-rgb),0.08),transparent)]" />
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <Badge variant="secondary" className="mb-6 px-4 py-1 rounded-full text-sm font-medium">
                            Our Story
                        </Badge>
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight"
                        >
                            Redefining the Art of <span className="text-primary">Corporate & Personal</span> Gifting
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        >
                            We built {APP_NAME} to remove the guesswork and logistical stress of sending premium packages. By creating a digital dashboard, we enable curated selection bundles sent directly to user profiles.
                        </motion.p>
                    </div>
                </section>

                {/* Company Values */}
                <section className="max-w-6xl mx-auto px-6 py-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight">Our Core Philosophy</h2>
                        <p className="text-muted-foreground mt-2">Every feature we implement focuses on three primary pillars.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v, i) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all duration-300 rounded-2xl">
                                    <CardContent className="p-8 space-y-4">
                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                            <v.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-xl">{v.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Stats / Story Banner */}
                <section className="max-w-6xl mx-auto px-6 py-12 pb-20">
                    <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                <Smile className="w-4 h-4" /> Delight Made Simple
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold">Curate, Bundle, and Share</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Our goal is to connect catalog inventory directly into personal moments. Administrators curate tailored bundles, recipients log in, reveal their rewards, and access their selections in a polished, premium aesthetic interface.
                            </p>
                        </div>
                        <div className="w-fit flex-shrink-0 bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Gift className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">100%</div>
                                <div className="text-xs text-muted-foreground">Digital & Waste Free</div>
                            </div>
                        </div>
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
