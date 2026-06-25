"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Hero } from "@/components/Hero";

export default function HomepageTab() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingHero, setIsSavingHero] = useState(false);

    const [heroBadgeText, setHeroBadgeText] = useState('');
    const [heroTitle, setHeroTitle] = useState('');
    const [heroHighlight, setHeroHighlight] = useState('');
    const [heroBottomText, setHeroBottomText] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [ctaTitle, setCtaTitle] = useState('');
    const [ctaSubtitle, setCtaSubtitle] = useState('');
    const [trendingTitle, setTrendingTitle] = useState('');
    const [trendingBadge, setTrendingBadge] = useState('');

    const [advantageBadge, setAdvantageBadge] = useState('');
    const [advantageTitle1, setAdvantageTitle1] = useState('');
    const [advantageTitle2, setAdvantageTitle2] = useState('');
    const [bento1, setBento1] = useState({ stat: '', label: '', title: '', desc: '' });
    const [bento2, setBento2] = useState({ stat: '', label: '', title: '', desc: '' });
    const [bento3, setBento3] = useState({ stat: '', label: '', title: '', desc: '' });

    useEffect(() => {
        let isMounted = true;
        api.get('/public/content/home').then((homepageRes) => {
            if (!isMounted) return;
            const heroContent = homepageRes.data?.data?.hero || {};
            if (heroContent.badgeText) setHeroBadgeText(heroContent.badgeText);
            if (heroContent.title) setHeroTitle(heroContent.title);
            if (heroContent.highlight) setHeroHighlight(heroContent.highlight);
            if (heroContent.bottomText) setHeroBottomText(heroContent.bottomText);
            if (heroContent.subtitle) setHeroSubtitle(heroContent.subtitle);
            if (heroContent.ctaTitle) setCtaTitle(heroContent.ctaTitle);
            if (heroContent.ctaSubtitle) setCtaSubtitle(heroContent.ctaSubtitle);
            if (heroContent.trendingTitle) setTrendingTitle(heroContent.trendingTitle);
            if (heroContent.trendingBadge) setTrendingBadge(heroContent.trendingBadge);
            if (heroContent.advantageBadge) setAdvantageBadge(heroContent.advantageBadge);
            if (heroContent.advantageTitle1) setAdvantageTitle1(heroContent.advantageTitle1);
            if (heroContent.advantageTitle2) setAdvantageTitle2(heroContent.advantageTitle2);
            if (heroContent.c1Stat) setBento1({ stat: heroContent.c1Stat, label: heroContent.c1StatLabel, title: heroContent.c1Title, desc: heroContent.c1Desc });
            if (heroContent.c2Stat) setBento2({ stat: heroContent.c2Stat, label: heroContent.c2StatLabel, title: heroContent.c2Title, desc: heroContent.c2Desc });
            if (heroContent.c3Stat) setBento3({ stat: heroContent.c3Stat, label: heroContent.c3StatLabel, title: heroContent.c3Title, desc: heroContent.c3Desc });
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    const handleSaveHero = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingHero(true);
        try {
            await api.put('/admin/content/home/hero', {
                content: {
                    badgeText: heroBadgeText, title: heroTitle, highlight: heroHighlight, bottomText: heroBottomText, subtitle: heroSubtitle,
                    ctaTitle, ctaSubtitle, trendingTitle, trendingBadge, advantageBadge, advantageTitle1, advantageTitle2,
                    c1Stat: bento1.stat, c1StatLabel: bento1.label, c1Title: bento1.title, c1Desc: bento1.desc,
                    c2Stat: bento2.stat, c2StatLabel: bento2.label, c2Title: bento2.title, c2Desc: bento2.desc,
                    c3Stat: bento3.stat, c3StatLabel: bento3.label, c3Title: bento3.title, c3Desc: bento3.desc
                }
            });
            toast.success('Homepage hero sequence updated!');
        } catch (err) {
            toast.error('Failed to update homepage content');
        } finally {
            setIsSavingHero(false);
        }
    };

    const previewDataBlock = {
        badgeText: heroBadgeText, title: heroTitle, highlight: heroHighlight, bottomText: heroBottomText, subtitle: heroSubtitle,
        ctaTitle, ctaSubtitle, trendingTitle, trendingBadge, advantageBadge, advantageTitle1, advantageTitle2,
        c1Stat: bento1.stat, c1StatLabel: bento1.label, c1Title: bento1.title, c1Desc: bento1.desc,
        c2Stat: bento2.stat, c2StatLabel: bento2.label, c2Title: bento2.title, c2Desc: bento2.desc,
        c3Stat: bento3.stat, c3StatLabel: bento3.label, c3Title: bento3.title, c3Desc: bento3.desc
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" /></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm p-4 sm:p-8">
                <h3 className="text-xl font-black text-foreground tracking-tight mb-2">Live Page Builder</h3>
                <p className="text-sm text-foreground/50 mb-8 font-medium">Update the introductory block texts on the main landing page and preview them directly.</p>

                <div className="flex flex-col xl:flex-row gap-8">
                    <div className="flex-1 w-full max-h-[85vh] overflow-y-auto pr-2">
                        <form onSubmit={handleSaveHero} className="space-y-8">
                            <div>
                                <h4 className="text-sm font-black text-theme-action uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-theme-action" /> Initial View Options
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/50 p-6 rounded-[1.5rem] border border-theme-accent/5">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Badge Text</label>
                                        <Input type="text" value={heroBadgeText} onChange={(e) => setHeroBadgeText(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Top Text</label>
                                        <Input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 text-theme-action">Gradient Word</label>
                                        <Input type="text" value={heroHighlight} onChange={(e) => setHeroHighlight(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-action/30 rounded-xl text-sm font-bold text-theme-action" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Bottom Line Text</label>
                                        <Input type="text" value={heroBottomText} onChange={(e) => setHeroBottomText(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Subtitle / Description</label>
                                        <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={2} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold resize-y" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-theme-accent/10">
                                <h4 className="text-sm font-black text-theme-action uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-theme-action" /> Call-To-Action (CTA) Footer</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-background/50 p-6 rounded-[1.5rem] border border-theme-accent/5">
                                    <div className="space-y-2 lg:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">CTA Title</label>
                                        <Input type="text" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">CTA Subtitle</label>
                                        <Input type="text" value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-theme-accent/10">
                                <h4 className="text-sm font-black text-theme-action uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-theme-action" /> Trending / Stats Section</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/50 p-6 rounded-[1.5rem] border border-theme-accent/5">
                                    <div className="space-y-2"><label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Trending Badge</label><Input type="text" value={trendingBadge} onChange={(e) => setTrendingBadge(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" /></div>
                                    <div className="space-y-2"><label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Trending Main Title</label><Input type="text" value={trendingTitle} onChange={(e) => setTrendingTitle(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" /></div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-theme-accent/10">
                                <h4 className="text-sm font-black text-theme-action uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-theme-action" /> 'Why Choose' Bento Cards</h4>
                                <div className="space-y-6 bg-background/50 p-6 rounded-[1.5rem] border border-theme-accent/5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Advantage Badge</label><Input type="text" value={advantageBadge} onChange={(e) => setAdvantageBadge(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" /></div>
                                        <div className="space-y-2"><label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Advantage Left Title</label><Input type="text" value={advantageTitle1} onChange={(e) => setAdvantageTitle1(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-accent/10 rounded-xl text-sm font-bold" /></div>
                                        <div className="space-y-2 md:col-span-2"><label className="block text-xs font-bold uppercase tracking-widest text-theme-action">Advantage Highlight Title</label><Input type="text" value={advantageTitle2} onChange={(e) => setAdvantageTitle2(e.target.value)} className="w-full px-4 py-3 bg-theme-element border-2 border-theme-action/30 rounded-xl text-sm font-bold text-theme-action" /></div>
                                    </div>
                                    <div className="p-4 bg-theme-element rounded-xl border border-theme-accent/10 space-y-4">
                                        <h5 className="font-bold text-sm text-foreground/80">Card 1: Focus</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="text" value={bento1.stat} onChange={e => setBento1({ ...bento1, stat: e.target.value })} placeholder="Stat (e.g. 100%)" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento1.label} onChange={e => setBento1({ ...bento1, label: e.target.value })} placeholder="Label (e.g. Ad Free)" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento1.title} onChange={e => setBento1({ ...bento1, title: e.target.value })} placeholder="Title" className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <textarea value={bento1.desc} onChange={e => setBento1({ ...bento1, desc: e.target.value })} placeholder="Description" rows={2} className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg resize-y" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-theme-element rounded-xl border border-theme-accent/10 space-y-4">
                                        <h5 className="font-bold text-sm text-foreground/80">Card 2: Quality</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="text" value={bento2.stat} onChange={e => setBento2({ ...bento2, stat: e.target.value })} placeholder="Stat (e.g. 4.9★)" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento2.label} onChange={e => setBento2({ ...bento2, label: e.target.value })} placeholder="Label" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento2.title} onChange={e => setBento2({ ...bento2, title: e.target.value })} placeholder="Title" className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <textarea value={bento2.desc} onChange={e => setBento2({ ...bento2, desc: e.target.value })} placeholder="Description" rows={2} className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg resize-y" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-theme-element rounded-xl border border-theme-accent/10 space-y-4">
                                        <h5 className="font-bold text-sm text-foreground/80">Card 3: Community</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input type="text" value={bento3.stat} onChange={e => setBento3({ ...bento3, stat: e.target.value })} placeholder="Stat (e.g. 12k+)" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento3.label} onChange={e => setBento3({ ...bento3, label: e.target.value })} placeholder="Label" className="px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <Input type="text" value={bento3.title} onChange={e => setBento3({ ...bento3, title: e.target.value })} placeholder="Title" className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg" />
                                            <textarea value={bento3.desc} onChange={e => setBento3({ ...bento3, desc: e.target.value })} placeholder="Description" rows={2} className="col-span-2 px-3 py-2 text-sm bg-background border border-theme-accent/10 rounded-lg resize-y" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-theme-accent/10 sticky bottom-0 bg-theme-element py-4 z-20">
                                <Button type="submit" disabled={isSavingHero} className="flex items-center justify-center gap-2 px-8 py-3 bg-theme-action text-white text-sm font-black rounded-xl transition-all disabled:opacity-60 hover:shadow-lg">
                                    {isSavingHero ? <Loader2 size={16} className="animate-spin" /> : <Settings2 size={16} />} Save Hero Settings
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden xl:flex flex-col w-[60%] lg:w-[50%] shrink-0 h-[85vh] sticky top-8 bg-background rounded-[2rem] border border-theme-accent/20 overflow-hidden shadow-2xl relative">
                        <div className="bg-theme-element-sec border-b border-theme-accent/10 px-4 py-3 flex items-center justify-between z-20 shrink-0">
                            <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20" /><div className="w-3 h-3 rounded-full bg-amber-500/20" /><div className="w-3 h-3 rounded-full bg-emerald-500/20" /></div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[#27C93F] bg-[#27C93F]/10 border border-[#27C93F]/20 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm"><span className="w-1.5 h-1.5 rounded-full bg-[#27C93F] animate-pulse" /> Live Preview</div>
                            <div className="w-12"></div>
                        </div>
                        <div className="flex-1 relative overflow-hidden bg-background">
                            <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left" style={{ transform: 'scale(0.5)' }}>
                                <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar bg-background"><div className="pointer-events-none select-none"><Hero previewData={previewDataBlock} /></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
