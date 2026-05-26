"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-glow via-background to-background"></div>

            <div className="w-full max-w-md z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                        SmartShare
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">Secure Product Sharing Platform</p>
                </div>

                <div className="glassmorphism p-8 rounded-3xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
