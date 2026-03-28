"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { Copy, Plus, X, Image as ImageIcon, Send, Save, ArrowLeft } from "lucide-react";
import { blogSchema } from "../schema/blog-schema";
import { BlogValues } from "../types/blog-type";
import { useCreateBlog } from "../hooks/use-create-blog";
import { isAxiosError } from "@/lib/api";
import { BlogPreview } from "./blog-preview";
import { useRouter } from "next/navigation";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
// We'll use a custom dark theme wrapper via Tailwind in globals.css

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ color: [] }, { background: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "script",
  "color",
  "background",
  "link",
  "image",
  "video",
];

export const BlogForm = () => {
  const router = useRouter();
  const { mutate, isPending, error } = useCreateBlog();
  const [tagInput, setTagInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<BlogValues>({
    resolver: zodResolver(blogSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      tags: [],
      status: "draft",
    },
  });

  const currentValues = watch();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();

    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (trimmedTag.length < 2 || trimmedTag.length > 30) {
      setError("tags", { message: "Tag must be between 2 and 30 characters" });
      return;
    }

    const currentTags = currentValues.tags || [];

    if (currentTags.includes(trimmedTag)) {
      setTagInput("");
      return; // prevent duplicate
    }

    if (currentTags.length >= 5) {
      setError("tags", { message: "Maximum 5 tags allowed" });
      return;
    }

    setValue("tags", [...currentTags, trimmedTag], { shouldValidate: true });
    setTagInput("");
    clearErrors("tags");
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = currentValues.tags || [];
    setValue(
      "tags",
      currentTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const onSubmit = (data: BlogValues) => {
    mutate(data, {
      onSuccess: () => {
        // Show success toast or navigate
        console.log("Blog created successfully!", data);
        alert(`Blog ${data.status === "published" ? 'Published' : 'Saved as Draft'} successfully!`);
        router.push("/blogs"); // Adjust destination as needed
      },
    });
  };

  if (!isMounted) return null; // Avoid hydration mismatch on initial render

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 overflow-hidden font-sans">

      {/* LEFT PANEL: EDITOR (60%) */}
      <div className="w-full lg:w-[60%] h-full flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-[0_0_40px_rgba(0,0,0,0.03)] z-10 transition-colors">

        {/* Header */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
              Create Post
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setValue("status", "draft");
                handleSubmit(onSubmit)();
              }}
              disabled={isPending || !isValid}
              className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-transparent dark:border-gray-800"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("status", "published");
                handleSubmit(onSubmit)();
              }}
              disabled={isPending || !isValid}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              Publish
            </button>
          </div>
        </header>

        {/* Editor Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form className="p-8 max-w-4xl mx-auto space-y-10">

            {/* Title */}
            <div className="group">
              <input
                {...register("title")}
                type="text"
                placeholder="Blog Title..."
                className="w-full text-4xl lg:text-5xl font-extrabold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-white transition-all min-w-0"
              />
              {errors.title && <p className="mt-2 text-sm text-red-500 font-medium translate-y-1 transition-transform">{errors.title.message}</p>}
            </div>

            {/* Meta Section Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-800/50">

              {/* Cover Image URL */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  Cover Image URL
                </label>
                <div className="relative group">
                  <input
                    {...register("coverImageUrl")}
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-sm shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">URL</span>
                  </div>
                </div>
                {errors.coverImageUrl && <p className="text-sm text-red-500">{errors.coverImageUrl.message}</p>}
              </div>

              {/* Tags Manager */}
              <div className="space-y-2">
                <label className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-emerald-500" />
                  Tags <span className="text-xs font-normal text-gray-400 shrink-0">({currentValues.tags?.length || 0}/5)</span>
                </label>
                <div className="p-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all flex flex-wrap gap-2 min-h-[48px] items-center">
                  {currentValues.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-800/50"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5 rounded-md transition-colors text-emerald-600 dark:text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={currentValues.tags && currentValues.tags.length >= 5 ? "Max tags reached" : "Add tag..."}
                    disabled={!!(currentValues.tags && currentValues.tags.length >= 5)}
                    className="flex-1 min-w-[100px] px-2 py-1 text-sm bg-transparent border-none outline-none disabled:opacity-50 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-1.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {errors.tags && <p className="text-sm text-red-500">{errors.tags.message}</p>}
              </div>

            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400">
                Summary / Excerpt
              </label>
              <textarea
                {...register("excerpt")}
                rows={2}
                placeholder="A brief summary of your post..."
                className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm dark:text-gray-200 custom-scrollbar"
              />
              {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt.message}</p>}
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2 pb-10">
              <label className="text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-400">
                Content
              </label>
              <div className="rounded-xl overflow-hidden text-black border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all quill-dark-theme-wrapper">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={modules}
                      formats={formats}
                      className="h-[400px] pb-10" // Padding bottom to accommodate quill toolbar which absolute positions sometimes
                      placeholder="Write your amazing story here..."
                    />
                  )}
                />
              </div>
              {errors.content && <p className="text-sm text-red-500 pt-2">{errors.content.message}</p>}
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW (40%) hidden on mobile */}
      <div className="hidden lg:block w-[40%] h-full bg-gray-100 dark:bg-[#050505] p-6 custom-scrollbar overflow-hidden">
        <BlogPreview
          title={currentValues.title}
          content={currentValues.content}
          excerpt={currentValues.excerpt}
          coverImageUrl={currentValues.coverImageUrl}
          tags={currentValues.tags || []}
        />
      </div>

      {/* Absolute Error Banner (API Errors) */}
      {error && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl shadow-xl shadow-red-500/10 border border-red-200 dark:border-red-800/50 flex items-start gap-3 z-50 animate-in slide-in-from-bottom pb-4">
          <X className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Failed to save</h4>
            <p className="text-sm opacity-90 mt-1">
              {isAxiosError(error) ? error.response?.data?.message || error.message : "An unexpected error occurred"}
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 text-xs font-medium underline">
            Refresh
          </button>
        </div>
      )}

    </div>
  );
};
