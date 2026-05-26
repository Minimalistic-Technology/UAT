"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function UserDashboard() {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="glass-card p-10 md:p-14 text-center max-w-2xl w-full z-10"
            >
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                    <span className="text-4xl">👋</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
                    Welcome, {user?.name || 'User'}! ✨
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Aapka dashboard aur main features ready hain. Yahan par aapko admin dwara share kiye gaye private products dikhenge (Saved Links/History).
                </p>
                <div className="p-6 bg-secondary/30 rounded-xl border border-secondary/50 text-left">
                    <h3 className="font-semibold mb-2">Upcoming Features Area</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                        <li>Your saved product links history goes here.</li>
                        <li>Profile settings and preferences.</li>
                    </ul>
                </div>
            </motion.div>
        </div>
    );
}
