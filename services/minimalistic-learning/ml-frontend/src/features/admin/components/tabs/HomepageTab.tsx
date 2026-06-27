"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Hero } from "@/components/Hero";

const DEFAULT_FORM = {
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
};

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  isArea?: boolean;
  highlight?: boolean;
  cols?: number;
  placeholder?: string;
}

const Field = ({
  label,
  name,
  value,
  onChange,
  isArea = false,
  highlight = false,
  cols = 1,
  placeholder = "",
}: FieldProps) => (
  <div
    className={`space-y-2 ${cols === 2 ? "md:col-span-2" : ""} ${cols === 3 ? "lg:col-span-2" : ""}`}
  >
    <label
      className={`block text-xs font-bold tracking-widest uppercase ${highlight ? "text-theme-action" : "text-foreground/60"}`}
    >
      {label}
    </label>
    {isArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        className="bg-background/80 focus:bg-theme-element border-theme-accent/20 focus:border-theme-action/50 focus:ring-theme-action/10 w-full resize-y rounded-2xl border-2 px-5 py-4 text-sm font-bold backdrop-blur-xl transition-all focus:ring-4"
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`focus:border-theme-action/50 focus:ring-theme-action/10 w-full rounded-2xl border-2 px-5 py-6 text-sm font-bold backdrop-blur-xl transition-all focus:ring-4 ${highlight ? "bg-theme-action/5 border-theme-action/30 text-theme-action hover:bg-theme-action/10" : "bg-background/80 hover:bg-theme-element border-theme-accent/20"}`}
      />
    )}
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="text-theme-action mb-6 flex items-center gap-3 text-sm font-black tracking-widest uppercase">
    <div className="bg-theme-action/20 flex h-6 w-6 items-center justify-center rounded-full">
      <div className="bg-theme-action h-2.5 w-2.5 rounded-full" />
    </div>
    {title}
  </h4>
);

export default function HomepageTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/public/content/home")
      .then((res) => {
        if (isMounted && res.data?.data?.hero) {
          setFormData((prev) => ({ ...prev, ...res.data.data.hero }));
          setIsLoading(false);
        }
      })
      .catch(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put("/admin/content/home/hero", { content: formData });
      toast.success("Homepage content updated beautifully!");
    } catch {
      toast.error("Failed to update content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange =
    (name: keyof typeof DEFAULT_FORM) => (value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700">
      <div className="bg-theme-element/40 border-theme-accent/20 overflow-hidden rounded-[3rem] border p-6 shadow-2xl backdrop-blur-3xl sm:p-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h3 className="text-foreground mb-3 text-3xl font-black tracking-tight">
              Live Page Builder
            </h3>
            <p className="text-foreground/50 text-base leading-relaxed font-medium">
              Shape your landing page's narrative. Updates sync instantly with
              the live preview context showcasing premium glassmorphism layouts.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-theme-action hover:bg-theme-action/90 flex shrink-0 items-center justify-center gap-3 rounded-xl px-8 py-3.5 text-sm font-black text-white shadow-xl transition-all hover:scale-[1.02] disabled:opacity-60 md:w-auto"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Settings2 />}{" "}
            Publish Changes
          </Button>
        </div>

        <div className="flex flex-col gap-10 xl:flex-row">
          <div className="custom-scrollbar max-h-[80vh] w-full flex-1 overflow-y-auto pr-4 pb-10">
            <form onSubmit={handleSave} className="space-y-12">
              <section>
                <SectionTitle title="Initial View Options" />
                <div className="bg-background/40 border-theme-accent/10 grid grid-cols-1 gap-6 rounded-[2rem] border p-8 shadow-inner backdrop-blur-md md:grid-cols-2">
                  <Field
                    label="Badge Text"
                    name="badgeText"
                    value={formData.badgeText}
                    onChange={handleFieldChange("badgeText")}
                    cols={2}
                  />
                  <Field
                    label="Top Text"
                    name="title"
                    value={formData.title}
                    onChange={handleFieldChange("title")}
                  />
                  <Field
                    label="Gradient Word"
                    name="highlight"
                    value={formData.highlight}
                    onChange={handleFieldChange("highlight")}
                    highlight
                  />
                  <Field
                    label="Bottom Line Text"
                    name="bottomText"
                    value={formData.bottomText}
                    onChange={handleFieldChange("bottomText")}
                    cols={2}
                  />
                  <Field
                    label="Subtitle / Description"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleFieldChange("subtitle")}
                    isArea
                    cols={2}
                  />
                </div>
              </section>

              <section>
                <SectionTitle title="Call-To-Action Footer" />
                <div className="bg-background/40 border-theme-accent/10 grid grid-cols-1 gap-6 rounded-[2rem] border p-8 shadow-inner backdrop-blur-md lg:grid-cols-3">
                  <Field
                    label="CTA Title"
                    name="ctaTitle"
                    value={formData.ctaTitle}
                    onChange={handleFieldChange("ctaTitle")}
                  />
                  <Field
                    label="CTA Subtitle"
                    name="ctaSubtitle"
                    value={formData.ctaSubtitle}
                    onChange={handleFieldChange("ctaSubtitle")}
                    cols={3}
                  />
                </div>
              </section>

              <section>
                <SectionTitle title="Trending Section" />
                <div className="bg-background/40 border-theme-accent/10 grid grid-cols-1 gap-6 rounded-[2rem] border p-8 shadow-inner backdrop-blur-md md:grid-cols-2">
                  <Field
                    label="Trending Badge"
                    name="trendingBadge"
                    value={formData.trendingBadge}
                    onChange={handleFieldChange("trendingBadge")}
                  />
                  <Field
                    label="Trending Main Title"
                    name="trendingTitle"
                    value={formData.trendingTitle}
                    onChange={handleFieldChange("trendingTitle")}
                  />
                </div>
              </section>

              <section>
                <SectionTitle title="Bento Features" />
                <div className="bg-background/40 border-theme-accent/10 space-y-8 rounded-[2rem] border p-8 shadow-inner backdrop-blur-md">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field
                      label="Advantage Badge"
                      name="advantageBadge"
                      value={formData.advantageBadge}
                      onChange={handleFieldChange("advantageBadge")}
                    />
                    <Field
                      label="Advantage Left Title"
                      name="advantageTitle1"
                      value={formData.advantageTitle1}
                      onChange={handleFieldChange("advantageTitle1")}
                    />
                    <Field
                      label="Advantage Highlight Title"
                      name="advantageTitle2"
                      value={formData.advantageTitle2}
                      onChange={handleFieldChange("advantageTitle2")}
                      cols={2}
                      highlight
                    />
                  </div>
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className="bg-theme-element/50 border-theme-accent/10 space-y-5 rounded-3xl border p-6 backdrop-blur-sm"
                    >
                      <h5 className="text-foreground/80 flex items-center gap-2 text-sm font-bold">
                        <div className="bg-foreground/10 text-foreground flex h-6 w-6 items-center justify-center rounded-lg text-xs">
                          {num}
                        </div>{" "}
                        Feature Card
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Stat"
                          name={`c${num}Stat`}
                          value={(formData as any)[`c${num}Stat`]}
                          onChange={handleFieldChange(`c${num}Stat` as any)}
                          placeholder="e.g. 100%"
                        />
                        <Field
                          label="Label"
                          name={`c${num}StatLabel`}
                          value={(formData as any)[`c${num}StatLabel`]}
                          onChange={handleFieldChange(
                            `c${num}StatLabel` as any,
                          )}
                          placeholder="e.g. Ad Free"
                        />
                        <Field
                          label="Title"
                          name={`c${num}Title`}
                          value={(formData as any)[`c${num}Title`]}
                          onChange={handleFieldChange(`c${num}Title` as any)}
                          cols={2}
                        />
                        <Field
                          label="Description"
                          name={`c${num}Desc`}
                          value={(formData as any)[`c${num}Desc`]}
                          onChange={handleFieldChange(`c${num}Desc` as any)}
                          isArea
                          cols={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </form>
          </div>

          <div className="bg-background border-theme-accent/20 relative sticky top-10 hidden h-[80vh] w-[60%] shrink-0 flex-col overflow-hidden rounded-[2.5rem] border shadow-2xl lg:w-[50%] xl:flex">
            <div className="bg-theme-element-sec/80 border-theme-accent/10 z-20 flex shrink-0 items-center justify-between border-b px-6 py-4 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="h-3.5 w-3.5 rounded-full bg-red-500/80 shadow-inner" />
                <div className="h-3.5 w-3.5 rounded-full bg-amber-500/80 shadow-inner" />
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/80 shadow-inner" />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-emerald-500 uppercase shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />{" "}
                Live Render
              </div>
              <div className="w-14" />
            </div>
            <div className="bg-background relative flex-1 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-[200%] w-[200%] origin-top-left"
                style={{ transform: "scale(0.5)" }}
              >
                <div className="custom-scrollbar bg-background pointer-events-none h-full w-full overflow-x-hidden overflow-y-auto select-none">
                  <Hero previewData={formData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex min-h-[400px] flex-col items-center justify-center">
    <div className="relative h-12 w-12">
      <div className="border-theme-action absolute inset-0 animate-spin rounded-full border-4 border-t-transparent shadow-lg" />
    </div>
    <p className="text-foreground/50 mt-4 animate-pulse text-sm font-bold tracking-widest uppercase">
      Loading Builder...
    </p>
  </div>
);
