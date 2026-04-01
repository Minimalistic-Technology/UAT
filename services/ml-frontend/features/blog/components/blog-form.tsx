"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { X, Image as ImageIcon, Send, Save, ArrowLeft, Zap, Plus, Layout, Eye, PanelLeft, PanelRight } from "lucide-react";
import { blogSchema } from "../schema/blog-schema";
import { BlogValues } from "../types/blog-type";
import { useCreateBlog } from "../hooks/use-create-blog";
import { useUpdateBlog } from "../hooks/use-update-blog";
import { useGetBlog } from "../hooks/use-get-blog";
import { isAxiosError } from "@/lib/api";
import { BlogPreview } from "./blog-preview";
import { useRouter } from "next/navigation";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ script: "sub" }, { script: "super" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image", "video", "divider"],
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
  "indent",
  "script",
  "color",
  "background",
  "link",
  "image",
  "video",
  "align",
];

export const BlogForm = ({ id }: { id?: string }) => {
  const router = useRouter();
  const isEdit = !!id;

  const { mutate: createMutate, isPending: isCreating, error: createError } = useCreateBlog();
  const { mutate: updateMutate, isPending: isUpdating, error: updateError } = useUpdateBlog();
  const { data: blogData, isLoading: isLoadingBlog } = useGetBlog(id || "");

  const isPending = isCreating || isUpdating;
  const formError = createError || updateError;
  const [tagInput, setTagInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

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
    reset,
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
      category: "",
      status: "draft",
    },
  });

  // Pre-fill form when in edit mode
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
      return;
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
    const payload = {
      ...data,
      published: data.status === "published",
    };

    const mutationOptions = {
      onSuccess: () => {
        alert(`Blog ${isEdit ? 'Updated' : (data.status === "published" ? 'Published' : 'Saved as Draft')} successfully!`);
        router.push(isEdit ? "/my-blogs" : "/");
      },
      onError: (err: any) => {
        console.error("Mutation error:", err);
      }
    };

    if (isEdit && id) {
      updateMutate({ id, data: payload }, mutationOptions);
    } else {
      createMutate(payload as any, mutationOptions);
    }
  };

  if (!isMounted || (isEdit && isLoadingBlog)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4 text-center">
        <div className="w-10 h-10 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">{isEdit ? 'Syncing details...' : 'Preparing editor...'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 overflow-hidden font-sans select-none">
      
      {/* 1. TOP NAVIGATION */}
      <header className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-4 w-[1px] bg-gray-100" />
          <h2 className="text-sm font-bold tracking-tight text-gray-900">
             {isEdit ? 'Edit Edition' : 'Create New Post'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
             type="button"
             onClick={() => setShowConfig(!showConfig)}
             className={`p-2 rounded-lg transition-all ${showConfig ? 'text-[#1877F2] bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
             title={showConfig ? 'Hide Configuration' : 'Show Configuration'}
          >
             <PanelLeft size={18} />
          </button>
          <button 
             type="button"
             onClick={() => setShowPreview(!showPreview)}
             className={`p-2 rounded-lg transition-all ${showPreview ? 'text-[#1877F2] bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
             title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
             <PanelRight size={18} />
          </button>
          <div className="h-4 w-[1px] bg-gray-100 mx-2" />
          <button 
             type="button"
             onClick={() => {
               setValue("status", "draft");
               handleSubmit(onSubmit)();
             }}
             disabled={isPending}
             className="px-5 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
             Save Draft
          </button>
          <button 
             type="button"
             onClick={() => {
               setValue("status", "published");
               handleSubmit(onSubmit)();
             }}
             disabled={isPending || !isValid}
             className="px-6 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
             {isEdit ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </header>

      {/* 2. THE THREE-PANE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT HALF: Sidebar + Editor */}
        <div className={`flex-1 flex overflow-hidden ${showPreview ? "border-r border-gray-100" : ""}`}>

        {/* PANEL 1: METADATA SIDEBAR (Left) */}
        {showConfig && (
          <aside className={`${showPreview ? "w-[300px]" : "w-1/2"} bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in slide-in-from-left duration-300`}>
             <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Layout size={10} className="text-[#1877F2]" />
                   Configuration
                </label>
                
                {/* Title Section */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-700 uppercase tracking-wide">Headline</label>
                   <textarea 
                     {...register("title")}
                     placeholder="Main title..."
                     rows={2}
                     className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-200 outline-none focus:border-[#1877F2] transition-colors shadow-sm resize-none"
                   />
                   {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">{errors.title.message}</p>}
                </div>
  
                {/* Category Section */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-700 uppercase tracking-wide">Category</label>
                   <select 
                     {...register("category")}
                     className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:border-[#1877F2] transition-colors appearance-none cursor-pointer shadow-sm"
                   >
                     <option value="" disabled>Select category</option>
                     <option value="Technology">Technology</option>
                     <option value="Lifestyle">Lifestyle</option>
                     <option value="Business">Business</option>
                     <option value="Education">Education</option>
                     <option value="AI">Artificial Intelligence</option>
                   </select>
                </div>
  
                {/* Cover Image URL */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-700 uppercase tracking-wide">Cover Image URL</label>
                   <input 
                     {...register("coverImageUrl")}
                     type="url"
                     placeholder="https://..."
                     className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 outline-none focus:border-[#1877F2] transition-colors shadow-sm"
                   />
                </div>
             </div>
  
             {/* Tags Section */}
             <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Plus size={10} className="text-[#1877F2]" />
                   Keywords
                </label>
                <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-100 rounded-xl items-center min-h-[64px] shadow-sm">
                   {currentValues.tags?.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500 rounded-full flex items-center gap-1.5 hover:border-red-100 transition-all">
                         #{tag}
                         <X size={10} onClick={() => removeTag(tag)} className="cursor-pointer hover:text-red-500" />
                      </span>
                   ))}
                   <input 
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="tag..."
                      className="flex-1 bg-transparent border-none outline-none px-3 py-1 text-xs font-medium min-w-[50px]"
                   />
                </div>
                {errors.tags && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.tags.message}</p>}
             </div>
  
             {/* Excerpt Section */}
             <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Summary</label>
                <textarea 
                  {...register("excerpt")}
                  placeholder="Brief high-level overview..."
                  rows={4}
                  className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-medium text-gray-600 outline-none focus:border-[#1877F2] transition-all resize-none shadow-sm"
                />
             </div>
          </aside>
        )}

        {/* PANEL 2: MAIN EDITOR */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
           <div className="h-full overflow-y-auto custom-scrollbar p-8">
              <div className="h-full flex flex-col space-y-6">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Plus size={10} className="text-[#1877F2]" />
                       Story Editor
                    </label>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                       {currentValues.content?.length || 0} chars
                    </span>
                 </div>
                 <div className="flex-1 min-h-[600px] quill-triple-pane prose prose-lg max-w-none">
                    <style>{`
                      .ql-editor {
                        font-size: 1.125rem;
                        line-height: 1.75;
                        padding: 0 !important;
                      }
                      .ql-editor p {
                        margin-bottom: 0.5em !important;
                        line-height: 1.4 !important;
                      }
                      .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                        margin-top: 1em !important;
                        margin-bottom: 0.5em !important;
                        font-weight: 800 !important;
                      }
                      .ql-container.ql-snow {
                        border: none !important;
                        font-family: inherit !important;
                      }
                      .ql-toolbar.ql-snow {
                        border: none !important;
                        border-bottom: 1px solid #f3f4f6 !important;
                        padding: 8px 0 !important;
                        margin-bottom: 20px !important;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        background: white;
                      }
                    `}</style>
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
                          className="h-full pb-12"
                          placeholder="Tell your stories..."
                        />
                      )}
                    />
                 </div>
              </div>
           </div>
        </main>

        </div>{/* END LEFT HALF */}

        {/* RIGHT HALF: LIVE PREVIEW */}
        {showPreview && (
          <aside className="w-1/2 bg-gray-50/50 flex flex-col shrink-0 overflow-hidden relative border-l border-gray-100 animate-in slide-in-from-right duration-300">
             <div className="h-full flex flex-col">
                <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shrink-0">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Eye size={10} className="text-[#1877F2]" />
                      Live Render
                   </span>
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400/20" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400/20" />
                      <div className="w-2 h-2 rounded-full bg-green-400/20" />
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                   <BlogPreview
                     title={currentValues.title}
                     content={currentValues.content}
                     excerpt={currentValues.excerpt}
                     coverImageUrl={currentValues.coverImageUrl}
                     tags={currentValues.tags || []}
                   />
                </div>
             </div>
          </aside>
        )}

      </div>{/* END THREE-PANE */}

      {/* FLOATING SUCCESS/ERROR ALERTS */}
      {formError && (
        <div className="fixed bottom-10 left-10 max-w-sm bg-white border border-red-50 p-6 rounded-[2rem] shadow-2xl z-50 animate-in slide-in-from-left duration-500">
           <div className="flex items-center gap-3 text-red-500 mb-2">
              <X size={18} />
              <h4 className="font-bold text-sm tracking-tight text-gray-900">Syncing Fail</h4>
           </div>
           <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {isAxiosError(formError) ? formError.response?.data?.message || formError.message : "Syncing problem encountered."}
           </p>
        </div>
      )}

    </div>
  );
};
