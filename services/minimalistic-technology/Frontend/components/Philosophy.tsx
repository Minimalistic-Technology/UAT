'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, ShieldCheck } from 'lucide-react';

const Philosophy: React.FC = () => {
    const values = [
        { icon: <Cpu size={20} />, text: "Next-Gen Engineering" },
        { icon: <Layers size={20} />, text: "Sleek Minimalism" },
        { icon: <ShieldCheck size={20} />, text: "Absolute Reliability" },
    ];

    return (
        <div className="py-12 bg-background border-y border-white/5">
            <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className="flex items-center gap-3 bg-[hsla(210,10%,97%,0.8)] dark:bg-[hsla(0,0%,5%,0.6)] backdrop-blur-md border border-[hsla(0,0%,0%,0.05)] dark:border-white/5 px-6 py-3 rounded-full"
                        >
                            <div className="text-primary">
                                {v.icon}
                            </div>
                            <span className="text-sm font-bold tracking-wider uppercase text-[var(--text-main)]">
                                {v.text}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Philosophy;
