import { Code2, MonitorPlay, Zap, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Our Services" };

export default function ServicesPage() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="text-center max-w-3xl mx-auto mb-20 lg:mb-32">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Premium Offerings
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter mb-8 leading-[1.1]">
                    Services built for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                        deep mastery.
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/70 font-medium leading-relaxed">
                    We don't do superficial crash courses. Our services are engineered strictly for professionals who want to understand the engine, not just drive the car.
                </p>
            </div>

            {/* Core Services Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 md:mb-32">
                {/* Main Feature / Span 2 */}
                <div className="lg:col-span-2 group relative bg-theme-element border border-theme-accent/20 rounded-[2.5rem] p-8 md:p-12 overflow-hidden hover:border-emerald-500/50 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Code2 size={32} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-4">Elite Mentorship</h3>
                    <p className="text-foreground/70 text-base md:text-lg mb-8 max-w-xl font-medium leading-relaxed">
                        1-on-1 intensive code reviews, system design architecture planning, and personalized career roadmaps from industry veterans.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 mb-8">
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80"><CheckIcon /> Full Stack Architecture</li>
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80"><CheckIcon /> Advanced Code Reviews</li>
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80"><CheckIcon /> Deployment CI/CD</li>
                        <li className="flex items-center gap-3 text-sm font-bold text-foreground/80"><CheckIcon /> Performance Tuning</li>
                    </ul>
                </div>

                {/* Vertical Feature */}
                <div className="group relative bg-theme-element border border-theme-accent/20 rounded-[2.5rem] p-8 md:p-12 overflow-hidden hover:border-theme-action/50 transition-all duration-500 flex flex-col items-start justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-theme-element-sec border border-theme-accent/20 text-foreground flex items-center justify-center mb-8 group-hover:bg-theme-action group-hover:text-white transition-all duration-500">
                        <MonitorPlay size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight mb-4">Masterclasses</h3>
                    <p className="text-foreground/70 text-sm md:text-base mb-8 font-medium leading-relaxed">
                        Highly technical, deeply focused video masterclasses on exact, real-world problems. No fluff, just code.
                    </p>
                    <Link href="/courses" className="mt-auto group/btn flex items-center gap-2 text-sm font-black text-foreground hover:text-theme-action transition-colors uppercase tracking-widest">
                        Browse Catalog <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Smaller Card 1 */}
                <div className="group bg-theme-element border border-theme-accent/20 rounded-[2.5rem] p-8 hover:border-theme-action/50 transition-all duration-500">
                    <Zap size={28} className="text-theme-action mb-6" />
                    <h4 className="text-lg font-black text-foreground mb-3">Enterprise Audits</h4>
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                        We review your company's codebase for security, scalability, and technical debt.
                    </p>
                </div>

                {/* Smaller Card 2 */}
                <div className="group bg-theme-element border border-theme-accent/20 rounded-[2.5rem] p-8 hover:border-theme-action/50 transition-all duration-500">
                    <Database size={28} className="text-theme-action mb-6" />
                    <h4 className="text-lg font-black text-foreground mb-3">Database Optimization</h4>
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                        Indexing strategies, query tuning, and schema re-designs for massive scale.
                    </p>
                </div>

                {/* Smaller Card 3 */}
                <div className="group bg-theme-element border border-theme-accent/20 rounded-[2.5rem] p-8 hover:border-theme-action/50 transition-all duration-500">
                    <ShieldCheck size={28} className="text-theme-action mb-6" />
                    <h4 className="text-lg font-black text-foreground mb-3">Security Hardening</h4>
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                        Penetration testing and vulnerability patches for sensitive API environments.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative bg-foreground rounded-[3rem] p-12 md:p-20 overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
                <Cpu size={48} className="mx-auto text-background/80 mb-6" />
                <h2 className="relative z-10 text-3xl md:text-5xl font-black text-background tracking-tighter mb-6">
                    Ready to build something serious?
                </h2>
                <p className="relative z-10 text-background/70 font-medium text-lg mb-10 max-w-2xl mx-auto">
                    Contact us for enterprise solutions or intensive personal mentorship programs.
                </p>
                <Link href="#" className="relative z-10 inline-flex items-center justify-center bg-background text-foreground font-black px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-2xl">
                    Get in Touch
                </Link>
            </div>
        </div>
    );
}

const CheckIcon = () => (
    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </span>
);
