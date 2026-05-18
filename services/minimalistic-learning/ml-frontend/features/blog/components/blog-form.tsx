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

// IMPORT QUILL CSS TO FIX THE HUGE TRIANGLE GLITCH
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-[400px] bg-gray-50 rounded-2xl animate-pulse border border-gray-100" /> 
});

const CATEGORIES = ["Technology", "Lifestyle", "Business", "Education", "AI & Future"];

const formats = [
  "header", "font", "size", "bold", "italic", "underline", "strike", "blockquote",
  "list", "indent", "script", "color", "background", "link", "image", "video", "align"
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
  const quillRef = useRef<any>(null);

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
          if (res.success && res.data._id) setActiveDraftId(res.data._id);
        }
      } catch { } finally { setIsAutoSaving(false); }
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentValues, isEdit, activeDraftId]);

  const imageHandler = useCallback(() => {
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
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", url);
        }
      } catch { toast.error("Image upload failed."); } finally { setIsUploadingMedia(false); }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "video"],
        ["clean"]
      ],
      handlers: { image: imageHandler }
    },
    clipboard: { matchVisual: false }
  }), [imageHandler]);

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
    return <div className="flex items-center justify-center h-screen bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-[5%]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><ArrowLeft size={20}/></button>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{isEdit ? "Edit Post" : "Create New Post"}</h1>
            </div>
            <p className="text-gray-500 text-sm font-medium ml-12">Fill in the details below to publish your blog.</p>
          </div>
          <div className="flex items-center gap-3 ml-12 sm:ml-0">
             <button type="button" onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 px-4 py-2 text-gray-600 font-bold text-sm bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"><Eye size={18} /> Preview</button>
             {isAutoSaving && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Saving...</span>}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* STEP 1: BASICS */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">1</div>
              <h2 className="text-xl font-black text-gray-900">Basic Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Blog Title</label>
                <input 
                  {...register("title")}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Enter a catchy title..."
                />
                {errors.title && <p className="text-xs font-bold text-red-500 mt-2 ml-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select {...register("category")} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:bg-white focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cover Image</label>
                  <div onClick={() => coverFileInputRef.current?.click()} className="group relative w-full h-[58px] bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between px-5 cursor-pointer hover:bg-gray-100 transition-all">
                    {coverImageUrl ? (
                      <span className="text-xs font-bold text-blue-600 truncate max-w-[200px]">Image Uploaded!</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Select Image...</span>
                    )}
                    {isUploadingCover ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <UploadCloud size={18} className="text-gray-400" />}
                  </div>
                  <input type="file" ref={coverFileInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: CONTEXT */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">2</div>
              <h2 className="text-xl font-black text-gray-900">Context & Tags</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Short Excerpt</label>
                <textarea 
                  {...register("excerpt")}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:bg-white focus:border-blue-400 outline-none transition-all resize-none"
                  placeholder="Write a brief summary to hook your readers..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tags (Max 5)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentTags.map(tag => (
                    <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-black rounded-xl border border-blue-100">
                      #{tag} <button type="button" onClick={() => setValue("tags", currentTags.filter(t => t !== tag))}><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)} 
                    onKeyDown={handleAddTag} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-900 font-bold focus:bg-white focus:border-blue-400 outline-none transition-all"
                    placeholder="Type and press Enter to add tags..." 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg border border-gray-100 text-gray-400"><Plus size={16}/></div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: EDITOR */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">3</div>
              <h2 className="text-xl font-black text-gray-900">Post Content</h2>
            </div>
            
            <div className="quill-single-form">
               {isMounted && (() => {
                   const QuillEditor = ReactQuill as any;
                   return (
                     <QuillEditor
                       ref={quillRef}
                       theme="snow"
                       value={content || ""}
                       onChange={(val: string) => setValue("content", val, { shouldDirty: true, shouldValidate: true })}
                       modules={modules}
                       formats={formats}
                       placeholder="Start writing your story here..."
                     />
                   );
                 })()}
               {isUploadingMedia && (
                 <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mt-4 animate-pulse">
                   <Loader2 size={14} className="animate-spin" /> Uploading image to content...
                 </div>
               )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
             <button 
                type="button" 
                onClick={() => { setValue("status", "draft"); handleSubmit(onSubmit)(); }}
                disabled={isPending}
                className="w-full sm:w-auto px-10 py-4 bg-white border border-gray-200 text-gray-600 font-black rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50"
             >
                Save as Draft
             </button>
             <button 
                type="submit" 
                onClick={() => setValue("status", "published")}
                disabled={isPending}
                className="w-full sm:flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
             >
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isEdit ? "Update Post Now" : "Publish Post Now"}
             </button>
          </div>

        </form>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
            <h2 className="text-xl font-black text-gray-900">Live Preview</h2>
            <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto">
             <BlogPreview title={currentValues.title} content={currentValues.content} excerpt={currentValues.excerpt} coverImageUrl={currentValues.coverImageUrl} tags={currentValues.tags || []} />
          </div>
        </div>
      )}
    </div>
  );
};
