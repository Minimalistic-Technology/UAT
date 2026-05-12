"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { 
  X, 
  Image as ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Trash2, 
  UploadCloud, 
  Link as LinkIcon, 
  Loader2, 
  Settings2, 
  CheckCircle2, 
  Layout, 
  Send, 
  Save, 
  Sparkles,
  Type,
  Tags,
  FileText
} from "lucide-react";
import { blogSchema } from "../schema/blog-schema";
import { BlogValues } from "../types/blog-type";
import { useCreateBlog } from "../hooks/use-create-blog";
import { useUpdateBlog } from "../hooks/use-update-blog";
import { useGetBlog } from "../hooks/use-get-blog";
import { isAxiosError } from "@/lib/api";
import { BlogPreview } from "./blog-preview";
import { useRouter } from "next/navigation";
import { blogService } from "../services/blog-service";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

// Register custom fonts and attributors with Quill
if (typeof window !== "undefined") {
  const { Quill } = require("react-quill-new");
  if (Quill) {
    const Font = Quill.import("formats/font");
    Font.whitelist = ["serif", "monospace", "roboto", "playfair", "montserrat", "lora"];
    Quill.register(Font, true);

    const Image = Quill.import("formats/image");
    class ResizableImage extends Image {
      static create(value: any) {
        const node = super.create(value);
        if (typeof value === 'object') {
          if (value.width) node.setAttribute('width', value.width);
          if (value.height) node.setAttribute('height', value.height);
          if (value.style) node.setAttribute('style', value.style);
        }
        return node;
      }
      static formats(domNode: HTMLElement) {
        const formats = super.formats(domNode);
        if (domNode.hasAttribute('width')) formats['width'] = domNode.getAttribute('width');
        if (domNode.hasAttribute('height')) formats['height'] = domNode.getAttribute('height');
        if (domNode.hasAttribute('style')) formats['style'] = domNode.getAttribute('style');
        return formats;
      }
      format(name: string, value: any) {
        if (name === 'width' || name === 'height' || name === 'style') {
          if (value) this.domNode.setAttribute(name, value);
          else this.domNode.removeAttribute(name);
        } else super.format(name, value);
      }
    }
    Quill.register(ResizableImage, true);

    const Parchment = Quill.import("parchment");
    const WidthStyle = new Parchment.StyleAttributor("width", "width", { scope: Parchment.Scope.INLINE });
    const MarginStyle = new Parchment.StyleAttributor("margin", "margin", { scope: Parchment.Scope.INLINE });
    const DisplayStyle = new Parchment.StyleAttributor("display", "display", { scope: Parchment.Scope.INLINE });

    Quill.register(WidthStyle, true);
    Quill.register(MarginStyle, true);
    Quill.register(DisplayStyle, true);
  }
}

const formats = [
  "header", "font", "bold", "italic", "underline", "strike", "blockquote",
  "list", "indent", "script", "color", "background", "link", "image", "video", "align"
];

export const BlogForm = ({ id }: { id?: string }) => {
  const router = useRouter();
  const isEdit = !!id;

  const { mutate: createMutate, isPending: isCreating, error: createError } = useCreateBlog();
  const { mutate: updateMutate, isPending: isUpdating, error: updateError } = useUpdateBlog();
  const { data: blogData, isLoading: isLoadingBlog } = useGetBlog(id || "");

  const isPending = isCreating || isUpdating;
  const formError = createError || updateError;

  // -- STATE & REFS --
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const quillRef = useRef<any>(null);
  
  const [selectedImageInfo, setSelectedImageInfo] = useState<{ element: HTMLImageElement; top: number; left: number; width: number } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // -- FORM --
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    trigger,
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

  const currentValues = watch();

  // -- DB AUTO-SAVE --
  useEffect(() => {
    if (isEdit) return; // Only for new posts

    const delayDebounceFn = setTimeout(async () => {
      const { title, content, category, tags, coverImageUrl } = currentValues;
      
      // Only auto-save if there's at least some content or title
      if (!title && !content) return;

      setIsAutoSaving(true);
      try {
        const payload = {
          title: title || "Untitled Draft",
          content: content || "",
          category: category || "Uncategorized",
          tags: tags || [],
          coverImageUrl: coverImageUrl || "",
          published: false
        };

        if (activeDraftId) {
          await blogService.updateBlog({ id: activeDraftId, data: payload });
          console.log("Auto-saved draft update:", activeDraftId);
        } else {
          const res = await blogService.createBlog(payload as any);
          if (res.success && res.data._id) {
            setActiveDraftId(res.data._id);
            console.log("Initial auto-save created draft:", res.data._id);
          }
        }
      } catch (error) {
        console.error("Auto-save failed", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(delayDebounceFn);
  }, [currentValues, isEdit, activeDraftId]);

  // Custom Image & Video Handlers for Quill
  const imageHandler = React.useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      setIsUploadingMedia(true);
      try {
        const { url } = await blogService.uploadMedia(file);
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", url);
          quill.setSelection(range.index + 1);
        }
      } catch (err: any) {
        alert(isAxiosError(err) ? err.response?.data?.message : "Image upload failed");
      } finally {
        setIsUploadingMedia(false);
      }
    };
  }, []);

  const videoHandler = React.useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "video/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("Video size must be less than 50MB");
        return;
      }

      setIsUploadingMedia(true);
      try {
        const { url } = await blogService.uploadMedia(file);
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "video", url);
          quill.setSelection(range.index + 1);
        }
      } catch (err: any) {
        alert(isAxiosError(err) ? err.response?.data?.message : "Video upload failed");
      } finally {
        setIsUploadingMedia(false);
      }
    };
  }, []);

  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: ["serif", "monospace", "roboto", "playfair", "montserrat", "lora"] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["link", "image", "video", "divider"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
        video: videoHandler,
      }
    }
  }), [imageHandler, videoHandler]);

  // -- EFFECTS --
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName?.toLowerCase() === "img" && target.closest(".ql-editor")) {
        const container = document.querySelector(".quill-container-wrapper");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const imgRect = target.getBoundingClientRect();
          setSelectedImageInfo({
            element: target as HTMLImageElement,
            top: imgRect.top - containerRect.top,
            left: imgRect.left - containerRect.left,
            width: imgRect.width
          });
        }
      } else if (!target.closest(".img-toolbar")) {
        setSelectedImageInfo(null);
      }
    };

    document.addEventListener("click", handleEditorClick);
    return () => document.removeEventListener("click", handleEditorClick);
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

  // -- HELPERS --
  const handleRemoveImage = () => {
    if (selectedImageInfo && quillRef.current) {
      try {
        const { Quill } = require("react-quill-new");
        const quill = quillRef.current.getEditor();
        const blot = Quill.find(selectedImageInfo.element);
        if (blot && quill) {
          const index = quill.getIndex(blot);
          if (index !== undefined && index !== null) {
            quill.deleteText(index, 1);
            const currentContent = quill.root.innerHTML;
            setValue("content", currentContent === "<p><br></p>" ? "" : currentContent, { shouldDirty: true });
          }
        }
      } catch (err) {
        console.error("Error removing image:", err);
      }
    }
    setSelectedImageInfo(null);
  };

  const handleResizeImage = (width: string) => {
    if (selectedImageInfo && quillRef.current) {
      const { Quill } = require("react-quill-new");
      const quill = quillRef.current.getEditor();
      const blot = Quill.find(selectedImageInfo.element);
      if (blot) {
        const index = quill.getIndex(blot);
        quill.formatText(index, 1, {
          width: width,
          style: `width: ${width}; height: auto; display: block; margin: 40px 0; border-radius: 1rem;`
        });
        const currentContent = quill.root.innerHTML;
        setValue("content", currentContent === "<p><br></p>" ? "" : currentContent, { shouldDirty: true });
      }
    }
    setSelectedImageInfo(null);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { url } = await blogService.uploadMedia(file);
      setValue("coverImageUrl", url, { shouldValidate: true, shouldDirty: true });
    } catch (err: any) {
      alert(isAxiosError(err) ? err.response?.data?.message : "Cover upload failed");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
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
    setValue("tags", currentTags.filter((t) => t !== tagToRemove), { shouldValidate: true });
  };

  const onSubmit = (data: BlogValues) => {
    const payload = {
      ...data,
      published: data.status === "published",
    };
    const mutationOptions = {
      onSuccess: () => {
        alert(payload.published ? "Story published successfully!" : "Draft saved successfully!");
        if (!isEdit) localStorage.removeItem("pending_blog_data"); // Clear storage
        router.push(isEdit ? "/my-blogs" : "/");
      },
      onError: (err: any) => {
        console.error("Mutation error:", err);
      }
    };
    const targetId = isEdit ? id : activeDraftId;
    
    if (targetId) {
      updateMutate({ id: targetId, data: payload as any }, mutationOptions);
    } else {
      createMutate(payload as any, mutationOptions);
    }
  };

  const nextStep = async () => {
    let result = false;
    if (step === 1) {
      result = await trigger(["title", "category"]);
    } else if (step === 2) {
      result = await trigger(["tags", "excerpt"]);
    }

    if (result) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  if (!isMounted || (isEdit && isLoadingBlog)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Preparing your creative space...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans overflow-hidden">
      
      <style>{`
        button, select, input[type="file"], .cursor-pointer, .ql-toolbar button {
          cursor: pointer !important;
        }
        button:disabled {
          cursor: not-allowed !important;
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            type="button"
            onClick={() => router.back()}
            className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {isEdit ? "Edit Story" : "New Story"}
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                {currentValues.status}
              </span>
            </h1>
            <p className="text-xs font-medium text-gray-400">Step {step} of 3 • {step === 1 ? "Identity" : step === 2 ? "Context" : "Writing"}</p>
          </div>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="hidden md:flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-blue-600" : "bg-gray-100"}`} />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-gray-600 text-sm font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
          >
            <Eye size={18} />
            Preview
          </button>
          
          <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block" />

          {step < 3 ? (
            <button 
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => {
                  setValue("status", "draft");
                  handleSubmit(onSubmit, (err) => console.log("Draft Errors:", err))();
                }}
                disabled={isPending}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Draft
              </button>
              <button 
                type="button"
                onClick={() => {
                  setValue("status", "published");
                  handleSubmit(onSubmit, (err) => {
                    console.log("Publish Errors:", err);
                    alert("Please check all fields. Some details are missing or too short.");
                  })();
                }}
                disabled={isPending}
                className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all ${!isValid ? 'opacity-70' : ''}`}
              >
                <Sparkles size={18} />
                {isEdit ? "Update" : "Publish"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              <div className="space-y-2 relative">
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                  {isAutoSaving ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-100">
                      <Loader2 size={12} className="animate-spin" />
                      Saving Draft...
                    </div>
                  ) : activeDraftId || isEdit ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <CheckCircle2 size={12} />
                      Draft Saved to DB
                    </div>
                  ) : null}
                </div>
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Type className="text-blue-600" />
                  Basic Identity
                </h2>
                <p className="text-gray-500 font-medium">Define your story's core attributes and cover art.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Headline</label>
                    <textarea 
                      {...register("title")}
                      placeholder="Give your story a name..."
                      rows={3}
                      className={`w-full bg-white border ${errors.title ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-5 text-xl font-bold text-gray-900 placeholder:text-gray-200 outline-none focus:border-blue-200 focus:shadow-xl focus:shadow-blue-500/5 transition-all resize-none shadow-sm`}
                    />
                    {errors.title && <p className="text-xs font-bold text-red-500 pl-2">{errors.title.message}</p>}
                  </div>

                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Category</label>
                    <div className="relative">
                      <select 
                        {...register("category")}
                        className={`w-full bg-white border ${errors.category ? 'border-red-300' : 'border-gray-100'} rounded-2xl px-6 py-4 text-base font-bold text-gray-700 outline-none focus:border-blue-200 transition-all appearance-none cursor-pointer shadow-sm`}
                      >
                        <option value="" disabled>Choose a theme...</option>
                        <option value="Technology">Technology</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="AI">AI & Future</option>
                      </select>
                      <Layout className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                    </div>
                    {errors.category && <p className="text-xs font-bold text-red-500 pl-2">{errors.category.message}</p>}
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Hero Image</label>
                  <div 
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`group relative w-full h-[255px] bg-white border-2 border-dashed ${watch("coverImageUrl") ? "border-blue-200" : "border-gray-200"} rounded-[2.5rem] flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 shadow-sm overflow-hidden`}
                  >
                    {watch("coverImageUrl") ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={watch("coverImageUrl")} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white px-4 py-2 rounded-full text-xs font-black uppercase text-gray-900 shadow-xl">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        {isUploadingCover ? (
                          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                        ) : (
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud size={32} />
                          </div>
                        )}
                        <p className="text-sm font-bold text-gray-700">Upload Visuals</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PNG, JPG or WebP up to 5MB</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 px-2">
                    <LinkIcon size={14} className="text-gray-400" />
                    <input 
                      {...register("coverImageUrl")}
                      type="url"
                      placeholder="Or paste image URL here..."
                      className="flex-1 bg-transparent border-none text-[11px] font-bold text-blue-600 outline-none placeholder:text-gray-300"
                    />
                  </div>

                  <input type="file" ref={coverFileInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTEXT */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Tags className="text-blue-600" />
                  Discovery Context
                </h2>
                <p className="text-gray-500 font-medium">Add keywords and a short summary to help readers find you.</p>
              </div>

              <div className="space-y-10 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-500/5">
                {/* Tags */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Story Keywords (Min 1, Max 5)</label>
                  <div className={`flex flex-wrap gap-3 p-5 bg-gray-50 rounded-3xl border ${errors.tags ? 'border-red-200' : 'border-transparent'} focus-within:border-blue-100 focus-within:bg-white transition-all`}>
                    {currentValues.tags?.map((tag) => (
                      <span key={tag} className="pl-4 pr-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200">
                        #{tag}
                        <X size={14} onClick={() => removeTag(tag)} className="cursor-pointer hover:scale-125 transition-transform" />
                      </span>
                    ))}
                    <input 
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={currentValues.tags?.length >= 5 ? "Limit reached" : "Type and press Enter..."}
                      disabled={currentValues.tags?.length >= 5}
                      className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-bold text-gray-700 min-w-[150px]"
                    />
                  </div>
                  {errors.tags && <p className="text-xs font-bold text-red-500 pl-2">{errors.tags.message}</p>}
                </div>

                {/* Excerpt */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Quick Perspective (Summary)</label>
                  <textarea 
                    {...register("excerpt")}
                    placeholder="Write a catchy one-liner or summary for the preview card..."
                    rows={6}
                    className="w-full bg-gray-50 border border-transparent rounded-[2rem] px-8 py-7 text-base font-medium text-gray-700 outline-none focus:bg-white focus:border-blue-100 transition-all resize-none shadow-inner"
                  />
                  {errors.excerpt && <p className="text-xs font-bold text-red-500 pl-2">{errors.excerpt.message}</p>}
                </div>
              </div>
              
              <div className="flex justify-center">
                <button onClick={prevStep} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-all cursor-pointer">
                  <ArrowLeft size={16} />
                  Change Identity Settings
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONTENT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{currentValues.title}</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{currentValues.category} • {currentValues.tags?.length} Tags</p>
                </div>
                <button onClick={prevStep} className="p-3 text-gray-400 hover:text-blue-600 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 transition-all shadow-sm cursor-pointer">
                  <Settings2 size={20} />
                </button>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-500/5 relative min-h-[600px] quill-container-wrapper p-2">
                 <style>{`
                   .ql-editor {
                     font-size: 1.15rem;
                     line-height: 1.8;
                     padding: 40px !important;
                     color: #2D3748;
                     font-family: 'Inter', sans-serif;
                   }
                   .ql-container.ql-snow {
                     border: none !important;
                     min-height: 500px;
                   }
                   .ql-toolbar.ql-snow {
                     border: none !important;
                     border-bottom: 1px solid #F7FAFC !important;
                     padding: 20px 40px !important;
                     background: #FCFDFF;
                     border-radius: 2rem 2rem 0 0;
                   }
                   .ql-editor img {
                       cursor: pointer;
                       border-radius: 1rem;
                       margin: 40px auto;
                       display: block;
                       max-width: 100%;
                       box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                   }
                 `}</style>
                 
                 {isUploadingMedia && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center rounded-[2.5rem]">
                     <div className="bg-white p-5 rounded-3xl shadow-2xl flex items-center gap-4">
                       <Loader2 className="animate-spin text-blue-600" size={24} />
                       <span className="text-sm font-black uppercase tracking-widest text-gray-900 pr-2">Uploading Media...</span>
                     </div>
                   </div>
                 )}

                 <Controller
                   name="content"
                   control={control}
                   render={({ field }) => (
                     <div className="space-y-2">
                       <ReactQuill
                         ref={quillRef}
                         theme="snow"
                         value={field.value}
                         onChange={(val: string) => {
                            field.onChange(val);
                            setSelectedImageInfo(null);
                         }}
                         modules={modules}
                         formats={formats}
                         className="h-full"
                         placeholder="Once upon a time..."
                       />
                       {errors.content && <p className="text-xs font-bold text-red-500 px-10 pb-4">{errors.content.message}</p>}
                     </div>
                   )}
                 />

                 {selectedImageInfo && (
                   <div 
                     className="img-toolbar absolute z-[100] flex items-center gap-1 p-1.5 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                     style={{
                       top: `${selectedImageInfo.top - 60}px`,
                       left: `${selectedImageInfo.left + (selectedImageInfo.width / 2)}px`,
                       transform: 'translateX(-50%)'
                     }}
                   >
                     <div className="flex items-center gap-1 px-1 border-r border-gray-700 mr-1">
                       {['25%', '50%', '75%', '100%'].map((w) => (
                         <button
                           key={w}
                           type="button"
                           onClick={() => handleResizeImage(w)}
                           className="px-2 py-1 text-[10px] font-black text-gray-400 hover:text-white transition-colors cursor-pointer"
                         >
                           {w}
                         </button>
                       ))}
                     </div>
                     <button
                       type="button"
                       onClick={handleRemoveImage}
                       className="p-1.5 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- PREVIEW MODAL --- */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-300 flex flex-col">
           <div className="h-20 px-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
               <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                 <Eye className="text-blue-600" />
                 Preview Mode
               </h3>
               <button 
                 type="button"
                 onClick={() => setIsPreviewOpen(false)}
                 className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all cursor-pointer"
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

      {/* --- ERROR FEEDBACK --- */}
      {(formError || Object.keys(errors).length > 0) && (
        <div className="fixed bottom-8 right-8 max-w-sm bg-red-600 text-white p-5 rounded-3xl shadow-2xl z-[100] flex items-center gap-4 animate-in slide-in-from-right-10">
           <X size={20} className="shrink-0" />
           <div className="text-xs font-bold leading-tight">
             {formError ? (
               isAxiosError(formError) ? formError.response?.data?.message || formError.message : "Backend error. Please try again."
             ) : (
               <div className="space-y-1">
                 <p>Please fix the following:</p>
                 <ul className="list-disc list-inside opacity-90">
                   {errors.title && <li>Title is too short</li>}
                   {errors.category && <li>Category is required</li>}
                   {errors.content && <li>Content cannot be empty</li>}
                   {errors.tags && <li>{errors.tags.message}</li>}
                 </ul>
               </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
};
