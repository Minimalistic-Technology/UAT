"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const GithubIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);
const TwitterIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

export default function TeamPage() {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/public/team")
            .then((res) => {
                setTeam(res.data.data || []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground tracking-tighter mb-6">Our <span className="text-emerald-500">Team</span></h1>
                <p className="text-lg text-foreground/70 font-medium">A small, elite group of engineers dedicated to cutting through the modern web noise.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-emerald-500" />
                </div>
            ) : team.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-theme-accent/20 rounded-3xl">
                    <p className="text-foreground/50 font-semibold mb-2">No team members found.</p>
                    <p className="text-xs text-foreground/40">Admins can add team members from the dashboard.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((t, i) => (
                        <div key={t.id || i} className="group flex flex-col items-center text-center p-8 rounded-[2rem] bg-theme-element border border-theme-accent/10 hover:border-emerald-500/30 transition-all duration-300">
                            <div className="w-24 h-24 rounded-full bg-theme-element-sec border-4 border-background shadow-xl flex items-center justify-center text-2xl font-black text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                                {t.image ? (
                                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                                ) : (
                                    t.name.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <h3 className="text-xl font-black text-foreground mb-1">{t.name}</h3>
                            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4">{t.role}</p>
                            {t.bio && <p className="text-xs font-medium text-foreground/60 mb-6 line-clamp-3">{t.bio}</p>}

                            <div className="flex items-center justify-center gap-3 w-full border-t border-theme-accent/10 pt-5 mt-auto">
                                {t.github && <Link href={t.github} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-theme-accent/10 text-foreground/60 hover:text-emerald-500 transition-colors"><GithubIcon size={14} /></Link>}
                                {t.twitter && <Link href={t.twitter} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-theme-accent/10 text-foreground/60 hover:text-emerald-500 transition-colors"><TwitterIcon size={14} /></Link>}
                                {t.linkedin && <Link href={t.linkedin} target="_blank" className="w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-theme-accent/10 text-foreground/60 hover:text-emerald-500 transition-colors"><LinkedinIcon size={14} /></Link>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
