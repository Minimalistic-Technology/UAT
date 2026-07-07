'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Sparkles, Globe } from 'lucide-react';

const AboutHero: React.FC = () => {
    const router = useRouter();

    return (
        <section className="relative min-h-[calc(100vh-112px)] flex items-center bg-background overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
                <div className="absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10 w-full flex flex-col justify-center min-h-[80vh]">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-20 lg:gap-24 items-center text-center lg:text-left py-20 lg:py-[clamp(60px,10vw,120px)] w-full">
                    {/* Left: Copy */}
                    <div className="flex flex-col items-center lg:items-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block text-[#a3e635] font-black uppercase tracking-[0.4em] text-[0.65rem] mb-6">ESTABLISHED 2026</span>
                            <h1 className="text-[clamp(3.5rem,8vw,6rem)] leading-[0.9] font-black tracking-[-0.05em] mb-8 text-[var(--text-bright)]">
                                Engineering <br />
                                The <span className="bg-[linear-gradient(135deg,hsl(82,84%,50%),hsl(82,84%,35%))] bg-clip-text text-transparent">Future</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-[var(--text-main)] font-bold mb-10 opacity-90 tracking-tight leading-relaxed max-w-2xl">
                                An elite collective of architects and designers building high-performance digital solutions with surgical precision.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/#contact-form')}
                                className="relative inline-flex items-center justify-center px-8 lg:px-12 py-4 lg:py-5 bg-primary text-black font-bold rounded-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] hover:bg-[#9de02b] z-10 gap-3 group"
                            >
                                <span>Start Project</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9}}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative [perspective:2000px] hidden lg:block"
                    >
                        <div className="relative rounded-[48px] overflow-hidden border border-white/10 shadow-2xl aspect-[16/11]">
                            <img
                                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"
                                alt="Modern Workspace"
                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; delay: number }> = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="p-8 rounded-[32px] bg-[hsla(210,10%,97%,0.8)] dark:bg-[hsla(0,0%,5%,0.6)] backdrop-blur-[20px] border border-white/5 hover:border-[#a3e635]/30 transition-all duration-500 group"
    >
        <div className="w-14 h-14 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center text-[#a3e635] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(163,230,53,0.1)]">
            {icon}
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-[var(--text-main)] mb-4 tracking-tight">{title}</h3>
        <p className="text-[var(--text-dim)] leading-relaxed text-base font-medium opacity-80">{desc}</p>
    </motion.div>
);

const WhoWeAre: React.FC = () => {
    return (
        <section className="py-[clamp(60px,10vw,120px)] relative overflow-hidden bg-[var(--surface-hover)]/30">
            <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <span className="text-[#a3e635] text-[0.65rem] font-black uppercase tracking-[0.4em] mb-4 block">OUR PHILOSOPHY</span>
                        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-[var(--text-main)] mb-8 tracking-tighter leading-[1.1]">
                            Complexity Met <br />
                            With <span className="text-[#a3e635]">Elegance</span>
                        </h2>
                        <div className="space-y-8">
                            <p className="text-lg md:text-xl text-[var(--text-dim)] leading-relaxed font-semibold">
                                At Minimalistic Technology, we believe that the most powerful solutions are often the simplest ones. Our philosophy is rooted in the idea that every line of code should serve a purpose.
                            </p>
                            <p className="text-lg md:text-xl text-[var(--text-dim)] leading-relaxed font-semibold">
                                Founded by experts in distributed systems, we specialize in building scalable web applications that don't just work — they perform.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:pt-16">
                        <ValueCard delay={0.1} icon={<Zap size={24} />} title="Performance" desc="Optimization first. Our apps load instantly and feel buttery smooth." />
                        <ValueCard delay={0.2} icon={<Shield size={24} />} title="Security" desc="Enterprise-grade security integrated into every layer of development." />
                        <ValueCard delay={0.3} icon={<Sparkles size={24} />} title="Craftsmanship" desc="Not just code, but digital art. We prioritize aesthetics and logic." />
                        <ValueCard delay={0.4} icon={<Globe size={24} />} title="Scalability" desc="Architecture designed to handle millions of users globally." />
                    </div>
                </div>
            </div>
        </section>
    );
};

const TeamCTA: React.FC = () => {
    const router = useRouter();
    return (
        <section className="py-12 md:py-20">
            <div className="max-w-[1280px] mx-auto px-[clamp(1.5rem,5vw,4rem)]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-10 md:p-20 rounded-[48px] bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden text-left group"
                >
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#a3e635]/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-[#a3e635]/10 transition-colors duration-1000" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#a3e635]/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-[#a3e635]/10 transition-colors duration-1000" />

                    <h2 className="text-[clamp(2rem,5vw,3rem)] font-black text-[var(--text-main)] mb-6 tracking-tight">
                        Powered By <span className="text-[#a3e635]">People</span>
                    </h2>
                    <p className="text-[var(--text-dim)] text-lg mb-8 max-w-xl font-medium leading-relaxed opacity-80">
                        Our strength lies in our diversity of thought and unity of mission. Meet the experts behind the scenes crafting your digital footprint.
                    </p>
                    <button
                        onClick={() => router.push('/team')}
                        className="relative inline-flex items-center justify-center bg-primary text-black font-bold rounded-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] hover:bg-[#9de02b] z-10 px-8 py-3 text-xs uppercase tracking-[0.2em] group"
                    >
                        View Team Members
                        <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default function AboutClient() {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            <AboutHero />
            <WhoWeAre />
            <TeamCTA />
        </div>
    );
}
