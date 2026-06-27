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

  const [formData, setFormData] = useState({
    badgeText: "",
    title: "",
    highlight: "",
    bottomText: "",
    subtitle: "",
    ctaTitle: "",
    ctaSubtitle: "",
    trendingTitle: "",
    trendingBadge: "",
    advantageBadge: "",
    advantageTitle1: "",
    advantageTitle2: "",
    c1Stat: "",
    c1StatLabel: "",
    c1Title: "",
    c1Desc: "",
    c2Stat: "",
    c2StatLabel: "",
    c2Title: "",
    c2Desc: "",
    c3Stat: "",
    c3StatLabel: "",
    c3Title: "",
    c3Desc: "",
  });

  useEffect(() => {
    let isMounted = true;
    api
      .get("/public/content/home")
      .then((homepageRes) => {
        if (!isMounted) return;
        const hc = homepageRes.data?.data?.hero || {};
        setFormData({
          badgeText: hc.badgeText || "",
          title: hc.title || "",
          highlight: hc.highlight || "",
          bottomText: hc.bottomText || "",
          subtitle: hc.subtitle || "",
          ctaTitle: hc.ctaTitle || "",
          ctaSubtitle: hc.ctaSubtitle || "",
          trendingTitle: hc.trendingTitle || "",
          trendingBadge: hc.trendingBadge || "",
          advantageBadge: hc.advantageBadge || "",
          advantageTitle1: hc.advantageTitle1 || "",
          advantageTitle2: hc.advantageTitle2 || "",
          c1Stat: hc.c1Stat || "",
          c1StatLabel: hc.c1StatLabel || "",
          c1Title: hc.c1Title || "",
          c1Desc: hc.c1Desc || "",
          c2Stat: hc.c2Stat || "",
          c2StatLabel: hc.c2StatLabel || "",
          c2Title: hc.c2Title || "",
          c2Desc: hc.c2Desc || "",
          c3Stat: hc.c3Stat || "",
          c3StatLabel: hc.c3StatLabel || "",
          c3Title: hc.c3Title || "",
          c3Desc: hc.c3Desc || "",
        });
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      await api.put("/admin/content/home/hero", {
        content: formData,
      });
      toast.success("Homepage hero sequence updated!");
    } catch (err) {
      toast.error("Failed to update homepage content");
    } finally {
      setIsSavingHero(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative h-10 w-10">
          <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );

  const renderField = (
    label: string,
    name: keyof typeof formData,
    wrapperClass = "",
    isHighlight = false,
    isTextarea = false,
  ) => (
    <div className={`space-y-2 ${wrapperClass}`}>
      <label
        className={`block text-xs font-bold tracking-widest uppercase ${isHighlight ? "text-theme-action" : "text-foreground/60"}`}
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={2}
          className="bg-theme-element border-theme-accent/10 w-full resize-y rounded-xl border-2 px-4 py-3 text-sm font-bold"
        />
      ) : (
        <Input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-bold ${isHighlight ? "bg-theme-element border-theme-action/30 text-theme-action" : "bg-theme-element border-theme-accent/10"}`}
        />
      )}
    </div>
  );

  const renderBentoCard = (cardIndex: 1 | 2 | 3, title: string) => {
    const pfx = `c${cardIndex}` as const;
    return (
      <div className="bg-theme-element border-theme-accent/10 space-y-4 rounded-xl border p-4">
        <h5 className="text-foreground/80 text-sm font-bold">{title}</h5>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            name={`${pfx}Stat`}
            value={formData[`${pfx}Stat`]}
            onChange={handleChange}
            placeholder="Stat"
            className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
          />
          <Input
            type="text"
            name={`${pfx}StatLabel`}
            value={formData[`${pfx}StatLabel`]}
            onChange={handleChange}
            placeholder="Label"
            className="bg-background border-theme-accent/10 rounded-lg border px-3 py-2 text-sm"
          />
          <Input
            type="text"
            name={`${pfx}Title`}
            value={formData[`${pfx}Title`]}
            onChange={handleChange}
            placeholder="Title"
            className="bg-background border-theme-accent/10 col-span-2 rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            name={`${pfx}Desc`}
            value={formData[`${pfx}Desc`]}
            onChange={handleChange}
            placeholder="Description"
            rows={2}
            className="bg-background border-theme-accent/10 col-span-2 resize-y rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>
    );
  };

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
                  {renderField("Badge Text", "badgeText", "md:col-span-2")}
                  {renderField("Top Text", "title", "lg:col-span-1")}
                  {renderField(
                    "Gradient Word",
                    "highlight",
                    "lg:col-span-1",
                    true,
                  )}
                  {renderField(
                    "Bottom Line Text",
                    "bottomText",
                    "md:col-span-2",
                  )}
                  {renderField(
                    "Subtitle / Description",
                    "subtitle",
                    "md:col-span-2",
                    false,
                    true,
                  )}
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  Call-To-Action (CTA) Footer
                </h4>
                <div className="bg-background/50 border-theme-accent/5 grid grid-cols-1 gap-6 rounded-[1.5rem] border p-6 lg:grid-cols-3">
                  {renderField("CTA Title", "ctaTitle", "lg:col-span-1")}
                  {renderField("CTA Subtitle", "ctaSubtitle", "lg:col-span-2")}
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  Trending / Stats Section
                </h4>
                <div className="bg-background/50 border-theme-accent/5 grid grid-cols-1 gap-6 rounded-[1.5rem] border p-6 md:grid-cols-2">
                  {renderField("Trending Badge", "trendingBadge")}
                  {renderField("Trending Main Title", "trendingTitle")}
                </div>
              </div>

              <div className="border-theme-accent/10 border-t pt-2">
                <h4 className="text-theme-action mb-4 flex items-center gap-2 text-sm font-black tracking-widest uppercase">
                  <div className="bg-theme-action h-1.5 w-1.5 rounded-full" />{" "}
                  'Why Choose' Bento Cards
                </h4>
                <div className="bg-background/50 border-theme-accent/5 space-y-6 rounded-[1.5rem] border p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {renderField("Advantage Badge", "advantageBadge")}
                    {renderField("Advantage Left Title", "advantageTitle1")}
                    {renderField(
                      "Advantage Highlight Title",
                      "advantageTitle2",
                      "md:col-span-2",
                      true,
                    )}
                  </div>
                  {renderBentoCard(1, "Card 1: Focus")}
                  {renderBentoCard(2, "Card 2: Quality")}
                  {renderBentoCard(3, "Card 3: Community")}
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
                    <Hero previewData={formData} />
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
