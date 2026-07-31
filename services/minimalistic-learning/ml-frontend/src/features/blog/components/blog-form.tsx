"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  ArrowLeft,
  Eye,
  Loader2,
  Sparkles,
  UploadCloud,
  Layout,
  Tags,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Quote,
  Calendar,
  User as UserIcon,
  Plus,
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
  loading: () => (
    <div className="bg-theme-element border-theme-accent/10 h-[450px] animate-pulse rounded-[2rem] border" />
  ),
});

const CATEGORIES = [
  "Technology",
  "Lifestyle",
  "Business",
  "Education",
  "AI & Future",
];

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
      title: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      tags: [],
      category: "",
      status: "draft",
    },
  });

  const currentValues = watch();
  const coverImageUrl = watch("coverImageUrl");
  const currentTags = watch("tags") || [];
  const content = watch("content");

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Strict Auto-save has been removed to prevent duplicate post submissions and moderation queue spam.

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
      } catch {
        toast.error("Image upload failed.");
      } finally {
        setIsUploadingMedia(false);
      }
    };
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { url } = await blogService.uploadMedia(file);
      setValue("coverImageUrl", url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Cover image uploaded!");
    } catch {
      toast.error("Cover upload failed.");
    } finally {
      setIsUploadingCover(false);
    }
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
      },
    };
    const targetId = isEdit ? id : activeDraftId;
    if (targetId)
      updateMutate({ id: targetId, data: payload as any }, mutationOptions);
    else createMutate(payload as any, mutationOptions);
  };

  if (!isMounted || (isEdit && isLoadingBlog)) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-theme-action h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 pt-32 pb-16 transition-colors duration-500 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-2 p-2"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="text-foreground text-3xl font-black tracking-tight">
                {isEdit ? "Edit Post" : "Create New Post"}
              </h1>
            </div>
            <p className="text-foreground/50 ml-12 text-sm font-medium">
              Fill in the details below to publish your blog.
            </p>
          </div>
          <div className="ml-12 flex items-center gap-3 sm:ml-0">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye size={18} className="mr-2" /> Preview
            </Button>
            {isAutoSaving && (
              <span className="text-theme-action animate-pulse text-[10px] font-black tracking-widest uppercase">
                Saving...
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* STEP 1: BASICS */}
          <Card className="rounded-[2rem] p-8">
            <div className="border-theme-accent/10 mb-8 flex items-center gap-3 border-b pb-4">
              <div className="bg-theme-action/10 text-theme-action flex h-10 w-10 items-center justify-center rounded-xl font-black">
                1
              </div>
              <h2 className="text-foreground text-xl font-black">
                Basic Information
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-foreground/50 mb-3 ml-1 block text-xs font-black tracking-widest uppercase">
                  Blog Title
                </label>
                <Input
                  {...register("title")}
                  placeholder="Enter a catchy title..."
                  error={!!errors.title}
                />
                {errors.title && (
                  <p className="mt-2 ml-1 text-xs font-bold text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label className="text-foreground/50 mb-3 ml-1 block text-xs font-black tracking-widest uppercase">
                    Category
                  </label>
                  <select
                    {...register("category")}
                    className="bg-theme-element-sec border-theme-accent/20 text-foreground focus:bg-theme-element focus:border-theme-action focus:ring-theme-action/10 w-full cursor-pointer rounded-2xl border px-5 py-4 font-bold transition-all outline-none focus:ring-4"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 ml-1 text-xs font-bold text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-foreground/50 mb-3 ml-1 block text-xs font-black tracking-widest uppercase">
                    Cover Image
                  </label>
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="group bg-theme-element-sec border-theme-accent/20 hover:bg-theme-element hover:border-theme-action/50 relative flex h-[58px] w-full cursor-pointer items-center justify-between rounded-2xl border px-5 transition-all"
                  >
                    {coverImageUrl ? (
                      <span className="text-theme-action max-w-[200px] truncate text-xs font-bold">
                        Image Uploaded!
                      </span>
                    ) : (
                      <span className="text-foreground/40 group-hover:text-foreground/60 text-xs font-bold transition-colors">
                        Select Image...
                      </span>
                    )}
                    {isUploadingCover ? (
                      <Loader2
                        size={18}
                        className="text-theme-action animate-spin"
                      />
                    ) : (
                      <UploadCloud
                        size={18}
                        className="text-foreground/40 group-hover:text-theme-action transition-colors"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={handleCoverUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* STEP 2: CONTEXT */}
          <Card className="rounded-[2rem] p-8">
            <div className="border-theme-accent/10 mb-8 flex items-center gap-3 border-b pb-4">
              <div className="bg-theme-action/10 text-theme-action flex h-10 w-10 items-center justify-center rounded-xl font-black">
                2
              </div>
              <h2 className="text-foreground text-xl font-black">
                Context & Tags
              </h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-foreground/50 mb-3 ml-1 block text-xs font-black tracking-widest uppercase">
                  Short Excerpt
                </label>
                <Textarea
                  {...register("excerpt")}
                  rows={3}
                  className="resize-none"
                  placeholder="Write a brief summary to hook your readers..."
                />
              </div>

              <div>
                <label className="text-foreground/50 mb-3 ml-1 block text-xs font-black tracking-widest uppercase">
                  Tags (Max 5)
                </label>
                <div className="mb-4 flex flex-wrap gap-2.5">
                  {currentTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-theme-action/10 text-theme-action border-theme-action/20 hover:bg-theme-action/20 flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black transition-colors"
                    >
                      #{tag}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "tags",
                            currentTags.filter((t) => t !== tag),
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter to add tags..."
                  />
                  <div
                    onClick={() =>
                      handleAddTag({ key: "Enter", preventDefault: () => {} })
                    }
                    className="bg-theme-element border-theme-accent/20 text-foreground/50 hover:bg-theme-action/10 hover:text-theme-action absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-lg border p-2 transition-colors"
                  >
                    <Plus size={16} />
                  </div>
                </div>
                {errors.tags && (
                  <p className="mt-2 ml-1 text-xs font-bold text-red-500">
                    {errors.tags.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* STEP 3: EDITOR */}
          <Card className="rounded-[2rem] p-8">
            <div className="border-theme-accent/10 mb-8 flex items-center gap-3 border-b pb-4">
              <div className="bg-theme-action/10 text-theme-action flex h-10 w-10 items-center justify-center rounded-xl font-black">
                3
              </div>
              <h2 className="text-foreground text-xl font-black">
                Post Content
              </h2>
            </div>

            <div className="border-theme-accent/20 bg-theme-element overflow-hidden rounded-2xl border">
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
                onChange={(val: string) =>
                  setValue("content", val, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                imageHandler={handleEditorImage}
                blogDataContent={blogData?.data?.content}
              />

              {errors.content && (
                <div className="border-t border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm font-bold text-red-500">
                    {errors.content.message}
                  </p>
                </div>
              )}

              {isUploadingMedia && (
                <div className="text-theme-action border-theme-accent/10 bg-theme-element flex animate-pulse items-center gap-2 border-t p-4 text-xs font-bold">
                  <Loader2 size={14} className="animate-spin" /> Uploading image
                  to content...
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-5 pt-6 sm:flex-row">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setValue("status", "draft");
                handleSubmit(onSubmit)();
              }}
              disabled={isPending}
              className="w-full rounded-2xl px-10 py-4 font-black sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={() => setValue("status", "published")}
              disabled={isPending}
              className="bg-foreground text-background hover:bg-foreground/90 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-black shadow-xl hover:scale-[1.02] sm:flex-1"
            >
              {isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
              {isEdit ? "Update Post Now" : "Publish Post Now"}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="bg-background animate-in fade-in zoom-in-95 fixed inset-0 z-[100] flex flex-col duration-200">
          <div className="border-theme-accent/10 bg-theme-element flex items-center justify-between border-b px-8 py-5 shadow-sm">
            <h2 className="text-foreground text-xl font-black">Live Preview</h2>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="hover:bg-theme-element-sec hover:border-theme-accent/20 text-foreground rounded-xl border border-transparent p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <BlogPreview
              title={currentValues.title}
              content={currentValues.content}
              excerpt={currentValues.excerpt}
              coverImageUrl={currentValues.coverImageUrl}
              tags={currentValues.tags || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};
