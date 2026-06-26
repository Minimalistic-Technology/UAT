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

  const [heroBadgeText, setHeroBadgeText] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroHighlight, setHeroHighlight] = useState("");
  const [heroBottomText, setHeroBottomText] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaSubtitle, setCtaSubtitle] = useState("");
  const [trendingTitle, setTrendingTitle] = useState("");
  const [trendingBadge, setTrendingBadge] = useState("");

  const [advantageBadge, setAdvantageBadge] = useState("");
  const [advantageTitle1, setAdvantageTitle1] = useState("");
  const [advantageTitle2, setAdvantageTitle2] = useState("");
  const [bento1, setBento1] = useState({
    stat: "",
    label: "",
    title: "",
    desc: "",
  });
  const [bento2, setBento2] = useState({
    stat: "",
    label: "",
    title: "",
    desc: "",
  });
  const [bento3, setBento3] = useState({
    stat: "",
    label: "",
    title: "",
    desc: "",
  });

  useEffect(() => {
    let isMounted = true;
    api
      .get("/public/content/home")
      .then((homepageRes) => {
        if (!isMounted) return;
        const heroContent = homepageRes.data?.data?.hero || {};
        if (heroContent.badgeText) setHeroBadgeText(heroContent.badgeText);
        if (heroContent.title) setHeroTitle(heroContent.title);
        if (heroContent.highlight) setHeroHighlight(heroContent.highlight);
        if (heroContent.bottomText) setHeroBottomText(heroContent.bottomText);
        if (heroContent.subtitle) setHeroSubtitle(heroContent.subtitle);
        if (heroContent.ctaTitle) setCtaTitle(heroContent.ctaTitle);
        if (heroContent.ctaSubtitle) setCtaSubtitle(heroContent.ctaSubtitle);
        if (heroContent.trendingTitle)
          setTrendingTitle(heroContent.trendingTitle);
        if (heroContent.trendingBadge)
          setTrendingBadge(heroContent.trendingBadge);
        if (heroContent.advantageBadge)
          setAdvantageBadge(heroContent.advantageBadge);
        if (heroContent.advantageTitle1)
          setAdvantageTitle1(heroContent.advantageTitle1);
        if (heroContent.advantageTitle2)
          setAdvantageTitle2(heroContent.advantageTitle2);
        if (heroContent.c1Stat)
          setBento1({
            stat: heroContent.c1Stat,
            label: heroContent.c1StatLabel,
            title: heroContent.c1Title,
            desc: heroContent.c1Desc,
          });
        if (heroContent.c2Stat)
          setBento2({
            stat: heroContent.c2Stat,
            label: heroContent.c2StatLabel,
            title: heroContent.c2Title,
            desc: heroContent.c2Desc,
          });
        if (heroContent.c3Stat)
          setBento3({
            stat: heroContent.c3Stat,
            label: heroContent.c3StatLabel,
            title: heroContent.c3Title,
            desc: heroContent.c3Desc,
          });
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      await api.put("/admin/content/home/hero", {
        content: {
          badgeText: heroBadgeText,
          title: heroTitle,
          highlight: heroHighlight,
          bottomText: heroBottomText,
          subtitle: heroSubtitle,
          ctaTitle,
          ctaSubtitle,
          trendingTitle,
          trendingBadge,
          advantageBadge,
          advantageTitle1,
          advantageTitle2,
          c1Stat: bento1.stat,
          c1StatLabel: bento1.label,
          c1Title: bento1.title,
          c1Desc: bento1.desc,
          c2Stat: bento2.stat,
          c2StatLabel: bento2.label,
          c2Title: bento2.title,
          c2Desc: bento2.desc,
          c3Stat: bento3.stat,
          c3StatLabel: bento3.label,
          c3Title: bento3.title,
          c3Desc: bento3.desc,
        },
      });
      toast.success("Homepage hero sequence updated!");
    } catch (err) {
      toast.error("Failed to update homepage content");
    } finally {
      setIsSavingHero(false);
    }
  };

  const previewDataBlock = {
    badgeText: heroBadgeText,
    title: heroTitle,
    highlight: heroHighlight,
    bottomText: heroBottomText,
    subtitle: heroSubtitle,
    ctaTitle,
    ctaSubtitle,
    trendingTitle,
    trendingBadge,
    advantageBadge,
    advantageTitle1,
    advantageTitle2,
    c1Stat: bento1.stat,
    c1StatLabel: bento1.label,
    c1Title: bento1.title,
    c1Desc: bento1.desc,
    c2Stat: bento2.stat,
    c2StatLabel: bento2.label,
    c2Title: bento2.title,
    c2Desc: bento2.desc,
    c3Stat: bento3.stat,
    c3StatLabel: bento3.label,
    c3Title: bento3.title,
    c3Desc: bento3.desc,
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-10 w-10">
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div className="bg-theme-element border-theme-accent/20 overflow-hidden rounded-[2.5rem] border p-4 shadow-sm sm:p-8">
        <h3 className="text-foreground mb-2 text-xl font-black tracking-tight">
          Live Page Builder
        </h3>
        <p className="text-foreground/50 mb-8 text-sm font-medium">
          Update the introductory block texts on the main landing page and
          preview them directly.
        </p>

        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="max-h-[85vh] w-full flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleSaveHero} className="space-y-8">
              <div>
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  Initial View Options
                </h4>
                <div className="bg-background/50 border-theme-accent/5 grid grid-cols-1 gap-6 rounded-[1.5rem] border p-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Badge Text
                    </label>
                    <Input
                      type="text"
                      value={heroBadgeText}
                      onChange={(e) => setHeroBadgeText(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Top Text
                    </label>
                    <Input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-foreground/60 text-theme-action block text-xs font-bold tracking-widest uppercase">
                      Gradient Word
                    </label>
                    <Input
                      type="text"
                      value={heroHighlight}
                      onChange={(e) => setHeroHighlight(e.target.value)}
                      className="bg-theme-element border-theme-action/30 text-theme-action w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Bottom Line Text
                    </label>
                    <Input
                      type="text"
                      value={heroBottomText}
                      onChange={(e) => setHeroBottomText(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Subtitle / Description
                    </label>
                    <textarea
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      rows={2}
                      className="bg-theme-element border-theme-accent/10 w-full resize-y rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  Call-To-Action (CTA) Footer
                </h4>
                <div className="bg-background/50 border-theme-accent/5 grid grid-cols-1 gap-6 rounded-[1.5rem] border p-6 lg:grid-cols-3">
                  <div className="space-y-2 lg:col-span-1">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      CTA Title
                    </label>
                    <Input
                      type="text"
                      value={ctaTitle}
                      onChange={(e) => setCtaTitle(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      CTA Subtitle
                    </label>
                    <Input
                      type="text"
                      value={ctaSubtitle}
                      onChange={(e) => setCtaSubtitle(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  Trending / Stats Section
                </h4>
                <div className="bg-background/50 border-theme-accent/5 grid grid-cols-1 gap-6 rounded-[1.5rem] border p-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Trending Badge
                    </label>
                    <Input
                      type="text"
                      value={trendingBadge}
                      onChange={(e) => setTrendingBadge(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                      Trending Main Title
                    </label>
                    <Input
                      type="text"
                      value={trendingTitle}
                      onChange={(e) => setTrendingTitle(e.target.value)}
                      className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  'Why Choose' Bento Cards
                </h4>
                <div className="bg-background/50 border-theme-accent/5 space-y-6 rounded-[1.5rem] border p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                        Advantage Badge
                      </label>
                      <Input
                        type="text"
                        value={advantageBadge}
                        onChange={(e) => setAdvantageBadge(e.target.value)}
                        className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                        Advantage Left Title
                      </label>
                      <Input
                        type="text"
                        value={advantageTitle1}
                        onChange={(e) => setAdvantageTitle1(e.target.value)}
                        className="bg-theme-element border-theme-accent/10 w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-theme-action block text-xs font-bold tracking-widest uppercase">
                        Advantage Highlight Title
                      </label>
                      <Input
                        type="text"
                        value={advantageTitle2}
                        onChange={(e) => setAdvantageTitle2(e.target.value)}
                        className="bg-theme-element border-theme-action/30 text-theme-action w-full rounded-xl border-2 px-4 py-3 text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="bg-theme-element border-theme-accent/10 space-y-4 rounded-xl border p-4">
                    <h5 className="text-foreground/80 text-sm font-bold">
                      Card 1: Focus
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        value={bento1.stat}
                        onChange={(e) =>
                          setBento1({ ...bento1, stat: e.target.value })
                        }
                        placeholder="Stat (e.g. 100%)"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento1.label}
                        onChange={(e) =>
                          setBento1({ ...bento1, label: e.target.value })
                        }
                        placeholder="Label (e.g. Ad Free)"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento1.title}
                        onChange={(e) =>
                          setBento1({ ...bento1, title: e.target.value })
                        }
                        placeholder="Title"
                        className="bg-background border-theme-accent/10 col-span-2 rounded-lg border px-3 py-2 text-sm"
                      />
                      <textarea
                        value={bento1.desc}
                        onChange={(e) =>
                          setBento1({ ...bento1, desc: e.target.value })
                        }
                        placeholder="Description"
                        rows={2}
                        className="bg-background border-theme-accent/10 col-span-2 resize-y rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-theme-element border-theme-accent/10 space-y-4 rounded-xl border p-4">
                    <h5 className="text-foreground/80 text-sm font-bold">
                      Card 2: Quality
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        value={bento2.stat}
                        onChange={(e) =>
                          setBento2({ ...bento2, stat: e.target.value })
                        }
                        placeholder="Stat (e.g. 4.9★)"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento2.label}
                        onChange={(e) =>
                          setBento2({ ...bento2, label: e.target.value })
                        }
                        placeholder="Label"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento2.title}
                        onChange={(e) =>
                          setBento2({ ...bento2, title: e.target.value })
                        }
                        placeholder="Title"
                        className="bg-background border-theme-accent/10 col-span-2 rounded-lg border px-3 py-2 text-sm"
                      />
                      <textarea
                        value={bento2.desc}
                        onChange={(e) =>
                          setBento2({ ...bento2, desc: e.target.value })
                        }
                        placeholder="Description"
                        rows={2}
                        className="bg-background border-theme-accent/10 col-span-2 resize-y rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-theme-element border-theme-accent/10 space-y-4 rounded-xl border p-4">
                    <h5 className="text-foreground/80 text-sm font-bold">
                      Card 3: Community
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        value={bento3.stat}
                        onChange={(e) =>
                          setBento3({ ...bento3, stat: e.target.value })
                        }
                        placeholder="Stat (e.g. 12k+)"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento3.label}
                        onChange={(e) =>
                          setBento3({ ...bento3, label: e.target.value })
                        }
                        placeholder="Label"
                        className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
                      />
                      <Input
                        type="text"
                        value={bento3.title}
                        onChange={(e) =>
                          setBento3({ ...bento3, title: e.target.value })
                        }
                        placeholder="Title"
                        className="bg-background border-theme-accent/10 col-span-2 rounded-lg border px-3 py-2 text-sm"
                      />
                      <textarea
                        value={bento3.desc}
                        onChange={(e) =>
                          setBento3({ ...bento3, desc: e.target.value })
                        }
                        placeholder="Description"
                        rows={2}
                        className="bg-background border-theme-accent/10 col-span-2 resize-y rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-theme-accent/10 bg-theme-element sticky bottom-0 z-20 border-t py-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSavingHero}
                  className="bg-theme-action flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-black text-white transition-all hover:shadow-lg disabled:opacity-60"
                >
                  {isSavingHero ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Settings2 size={16} />
                  )}{" "}
                  Save Hero Settings
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-background border-theme-accent/20 relative sticky top-8 hidden h-[85vh] w-[60%] shrink-0 flex-col overflow-hidden rounded-[2rem] border shadow-2xl lg:w-[50%] xl:flex">
            <div className="bg-theme-element-sec border-theme-accent/10 z-20 flex shrink-0 items-center justify-between border-b px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/20" />
                <div className="h-3 w-3 rounded-full bg-amber-500/20" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/20" />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#27C93F]/20 bg-[#27C93F]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#27C93F] uppercase shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#27C93F]" />{" "}
                Live Preview
              </div>
              <div className="w-12"></div>
            </div>
            <div className="bg-background relative flex-1 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-[200%] w-[200%] origin-top-left"
                style={{ transform: "scale(0.5)" }}
              >
                <div className="custom-scrollbar bg-background h-full w-full overflow-x-hidden overflow-y-auto">
                  <div className="pointer-events-none select-none">
                    <Hero previewData={previewDataBlock} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
