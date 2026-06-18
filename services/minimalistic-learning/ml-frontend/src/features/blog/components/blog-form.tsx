"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X, ArrowLeft, Eye, Loader2, Sparkles,
  UploadCloud, Layout, Tags, FileText,
  Bold, Italic, Underline, List, ListOrdered,
  Image as ImageIcon, Quote, Calendar, User as UserIcon,
  Plus
} from "lucide-react";
import { blogSchema } from "../schema/blog-schema";
import { BlogValues } from "../types/blog-type";
import { useCreateBlog } from "../hooks/use-create-blog";
import { useUpdateBlog } from "../hooks/use-update-blog";
import { useGetBlog } from "../hooks/use-get-blog";
import { useAuth } from "@/features/auth/context/auth-context";
import { BlogPreview } from "./blog-preview";
import { useRouter } from "next/navigation";
import { blogService } from "../services/blog-service";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

const TiptapEditor = dynamic(() => import("./tiptap-editor"), {
  ssr: false,
  loading: () => <div className="h-[450px] bg-theme-element rounded-[2rem] animate-pulse border border-theme-accent/10" />
});

const CATEGORIES = ["Technology", "Lifestyle", "Business", "Education", "AI & Future"];

export const BlogForm = ({ id }: { id?: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const isEdit = !!id;

  const { mutate: createMutate, isPending: isCreating } = useCreateBlog();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateBlog();
  const { data: blogData, isLoading: isLoadingBlog } = useGetBlog(id || "");

  const isPending = isCreating || isUpdating;

  const [isMounted, setIsMounted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<BlogValues>({
    resolver: zodResolver(blogSchema),
    mode: "onChange",
    defaultValues: {
      title: "", content: "", excerpt: "", coverImageUrl: "", tags: [], category: "", status: "draft",
    },
  });

  const currentValues = watch();
  const coverImageUrl = watch("coverImageUrl");
  const currentTags = watch("tags") || [];
  const content = watch("content");

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isEdit && blogData?.data) {
      const blog = blogData.data;
      reset({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        coverImageUrl: blog.coverImage?.url || blog.coverImageUrl || "",
        tags: blog.tags || [],
        category: blog.category || "",
        status: blog.published ? "published" : "draft",
      });
    }
  }, [isEdit, blogData, reset]);

  // Strict Auto-save
  useEffect(() => {
    if (isEdit) return;
    const timer = setTimeout(async () => {
      const { title, content: c, category, tags, coverImageUrl: ci } = currentValues;
      const hasTitle = title && title.trim().length > 0;
      const hasContent = c && c.replace(/<[^>]*>/g, '').trim().length > 0;
      if (!hasTitle && !hasContent) return;
      setIsAutoSaving(true);
      try {
        const payload = { title: title || "Untitled Draft", content: c || "", category: category || "Uncategorized", tags: tags || [], coverImageUrl: ci || "", published: false };
        if (activeDraftId) await blogService.updateBlog({ id: activeDraftId, data: payload });
        else {
          const res = await blogService.createBlog(payload as any);
          if (res.success && (res.data.id || res.data._id)) {
            setActiveDraftId(res.data.id || res.data._id);
          }
        }
      } catch { } finally { setIsAutoSaving(false); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentValues, isEdit, activeDraftId]);

  const handleEditorImage = useCallback((editorInstance: any) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setIsUploadingMedia(true);
      try {
        const { url } = await blogService.uploadMedia(file);
        if (editorInstance) {
          editorInstance.chain().focus().setImage({ src: url }).run();
        }
      } catch { toast.error("Image upload failed."); } finally { setIsUploadingMedia(false); }
    };
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { url } = await blogService.uploadMedia(file);
      setValue("coverImageUrl", url, { shouldValidate: true, shouldDirty: true });
      toast.success("Cover image uploaded!");
    } catch { toast.error("Cover upload failed."); }
    finally { setIsUploadingCover(false); }
  };

  const handleAddTag = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && currentTags.length < 5 && !currentTags.includes(trimmed)) {
        setValue("tags", [...currentTags, trimmed], { shouldValidate: true });
        setTagInput("");
      }
    }
  };

  const onSubmit = (data: BlogValues) => {
    const payload = { ...data, published: data.status === "published" };
    const mutationOptions = {
      onSuccess: (res: any) => {
        toast.success(res?.message || "Success!");
        router.push("/my-blogs");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed.");
      }
    };
    const targetId = isEdit ? id : activeDraftId;
    if (targetId) updateMutate({ id: targetId, data: payload as any }, mutationOptions);
    else createMutate(payload as any, mutationOptions);
  };

  if (!isMounted || (isEdit && isLoadingBlog)) {
    return <div className="flex items-center justify-center h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-theme-action" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" onClick={() => router.back()} className="p-2 mr-2"><ArrowLeft size={20} /></Button>
              <h1 className="text-3xl font-black text-foreground tracking-tight">{isEdit ? "Edit Post" : "Create New Post"}</h1>
            </div>
            <p className="text-foreground/50 text-sm font-medium ml-12">Fill in the details below to publish your blog.</p>
          </div>
          <div className="flex items-center gap-3 ml-12 sm:ml-0">
            <Button variant="secondary" type="button" onClick={() => setIsPreviewOpen(true)}><Eye size={18} className="mr-2" /> Preview</Button>
            {isAutoSaving && <span className="text-[10px] font-black text-theme-action uppercase tracking-widest animate-pulse">Saving...</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

          {/* STEP 1: BASICS */}
          <Card className="rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-theme-accent/10">
              <div className="w-10 h-10 bg-theme-action/10 text-theme-action rounded-xl flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black text-foreground">Basic Information</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3 ml-1">Blog Title</label>
                <Input
                  {...register("title")}
                  placeholder="Enter a catchy title..."
                  error={!!errors.title}
                />
                {errors.title && <p className="text-xs font-bold text-red-500 mt-2 ml-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3 ml-1">Category</label>
                  <select {...register("category")} className="w-full bg-theme-element-sec border border-theme-accent/20 rounded-2xl px-5 py-4 text-foreground font-bold focus:bg-theme-element focus:border-theme-action focus:ring-4 focus:ring-theme-action/10 outline-none transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3 ml-1">Cover Image</label>
                  <div onClick={() => coverFileInputRef.current?.click()} className="group relative w-full h-[58px] bg-theme-element-sec border border-theme-accent/20 rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-theme-element hover:border-theme-action/50 transition-all">
                    {coverImageUrl ? (
                      <span className="text-xs font-bold text-theme-action truncate max-w-[200px]">Image Uploaded!</span>
                    ) : (
                      <span className="text-xs font-bold text-foreground/40 group-hover:text-foreground/60 transition-colors">Select Image...</span>
                    )}
                    {isUploadingCover ? <Loader2 size={18} className="animate-spin text-theme-action" /> : <UploadCloud size={18} className="text-foreground/40 group-hover:text-theme-action transition-colors" />}
                  </div>
                  <input type="file" ref={coverFileInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 2: CONTEXT */}
          <Card className="rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-theme-accent/10">
              <div className="w-10 h-10 bg-theme-action/10 text-theme-action rounded-xl flex items-center justify-center font-black">2</div>
              <h2 className="text-xl font-black text-foreground">Context & Tags</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3 ml-1">Short Excerpt</label>
                <Textarea
                  {...register("excerpt")}
                  rows={3}
                  className="resize-none"
                  placeholder="Write a brief summary to hook your readers..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-foreground/50 uppercase tracking-widest mb-3 ml-1">Tags (Max 5)</label>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {currentTags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-theme-action/10 text-theme-action text-xs font-black rounded-xl border border-theme-action/20 hover:bg-theme-action/20 transition-colors">
                      #{tag} <button type="button" onClick={() => setValue("tags", currentTags.filter(t => t !== tag))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter to add tags..."
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-theme-element rounded-lg border border-theme-accent/20 text-foreground/50"><Plus size={16} /></div>
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 3: EDITOR */}
          <Card className="rounded-[2rem] p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-theme-accent/10">
              <div className="w-10 h-10 bg-theme-action/10 text-theme-action rounded-xl flex items-center justify-center font-black">3</div>
              <h2 className="text-xl font-black text-foreground">Post Content</h2>
            </div>

            <div className="border border-theme-accent/20 rounded-2xl bg-theme-element overflow-hidden">
              <style>{`
                .tiptap {
                  outline: none;
                  min-height: 400px;
                  font-family: inherit;
                  font-size: 1.05rem;
                  line-height: 1.8;
                }
                .tiptap p {
                  margin-bottom: 1.25rem;
                }
                .tiptap h1 {
                  font-size: 2.25rem;
                  font-weight: 900;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  letter-spacing: -0.025em;
                }
                .tiptap h2 {
                  font-size: 1.75rem;
                  font-weight: 800;
                  margin-top: 1.75rem;
                  margin-bottom: 0.75rem;
                  letter-spacing: -0.02em;
                }
                .tiptap h3 {
                  font-size: 1.35rem;
                  font-weight: 700;
                  margin-top: 1.5rem;
                  margin-bottom: 0.5rem;
                }
                .tiptap ul {
                  list-style-type: disc;
                  padding-left: 1.5rem;
                  margin-bottom: 1.25rem;
                }
                .tiptap ol {
                  list-style-type: decimal;
                  padding-left: 1.5rem;
                  margin-bottom: 1.25rem;
                }
                .tiptap li {
                  margin-bottom: 0.5rem;
                }
                .tiptap blockquote {
                  border-left: 4px solid var(--theme-action, #3b82f6);
                  padding-left: 1.25rem;
                  font-style: italic;
                  margin: 1.5rem 0;
                  color: inherit;
                  opacity: 0.9;
                }
                .tiptap img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 1.5rem;
                  margin: 2.5rem auto;
                  display: block;
                  border: 1px solid rgba(var(--theme-accent-rgb), 0.1);
                  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .tiptap a {
                  color: #3b82f6;
                  text-decoration: underline;
                  cursor: pointer;
                }
              `}</style>

              <TiptapEditor
                value={content || ""}
                onChange={(val: string) => setValue("content", val, { shouldDirty: true, shouldValidate: true })}
                imageHandler={handleEditorImage}
                blogDataContent={blogData?.data?.content}
              />

              {isUploadingMedia && (
                <div className="flex items-center gap-2 text-xs font-bold text-theme-action p-4 border-t border-theme-accent/10 bg-theme-element animate-pulse">
                  <Loader2 size={14} className="animate-spin" /> Uploading image to content...
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-6">
            <Button
              variant="secondary"
              type="button"
              onClick={() => { setValue("status", "draft"); handleSubmit(onSubmit)(); }}
              disabled={isPending}
              className="w-full sm:w-auto px-10 py-4 font-black rounded-2xl"
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={() => setValue("status", "published")}
              disabled={isPending}
              className="w-full sm:flex-1 py-4 bg-foreground text-background hover:bg-foreground/90 font-black rounded-2xl shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isEdit ? "Update Post Now" : "Publish Post Now"}
            </Button>
          </div>

        </form>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-8 py-5 border-b border-theme-accent/10 bg-theme-element shadow-sm">
            <h2 className="text-xl font-black text-foreground">Live Preview</h2>
            <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-theme-element-sec border border-transparent hover:border-theme-accent/20 rounded-xl transition-all text-foreground"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <BlogPreview title={currentValues.title} content={currentValues.content} excerpt={currentValues.excerpt} coverImageUrl={currentValues.coverImageUrl} tags={currentValues.tags || []} />
          </div>
        </div>
      )}
    </div>
  );
};
