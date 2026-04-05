"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { X, Image as ImageIcon, Send, Save, ArrowLeft, ArrowRight, Zap, Plus, Layout, Eye, PanelLeft, PanelRight, Trash2 } from "lucide-react";
import { blogSchema } from "../schema/blog-schema";
import { BlogValues } from "../types/blog-type";
import { useCreateBlog } from "../hooks/use-create-blog";
import { useUpdateBlog } from "../hooks/use-update-blog";
import { useGetBlog } from "../hooks/use-get-blog";
import { isAxiosError } from "@/lib/api";
import { BlogPreview } from "./blog-preview";
import { useRouter } from "next/navigation";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;
import "react-quill-new/dist/quill.snow.css";

// Register custom fonts and attributors with Quill
if (typeof window !== "undefined") {
  const { Quill } = require("react-quill-new");
  if (Quill) {
    // 1. Register Fonts
    const Font = Quill.import("formats/font");
    Font.whitelist = ["serif", "monospace", "roboto", "playfair", "montserrat", "lora"];
    Quill.register(Font, true);

    // 2. Define and Register Custom Image Blot for Resizing
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
          if (value) {
            this.domNode.setAttribute(name, value);
          } else {
            this.domNode.removeAttribute(name);
          }
        } else {
          super.format(name, value);
        }
      }
    }
    
    Quill.register(ResizableImage, true);

    // 3. Register Style Attributors (Legacy support for width/margin/display)
    const Parchment = Quill.import("parchment");
    
    const WidthStyle = new Parchment.StyleAttributor("width", "width", {
      scope: Parchment.Scope.INLINE,
    });
    
    const MarginStyle = new Parchment.StyleAttributor("margin", "margin", {
      scope: Parchment.Scope.INLINE,
    });

    const DisplayStyle = new Parchment.StyleAttributor("display", "display", {
      scope: Parchment.Scope.INLINE,
    });

    Quill.register(WidthStyle, true);
    Quill.register(MarginStyle, true);
    Quill.register(DisplayStyle, true);
  }
}

const modules = {
  toolbar: [
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

  // -- STATE & REFS --
  const [tagInput, setTagInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1); // 1 = Config, 2 = Editor
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const quillRef = useRef<any>(null);
  const [selectedImageInfo, setSelectedImageInfo] = useState<{ element: HTMLImageElement; top: number; left: number; width: number } | null>(null);

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

  // -- EFFECTS --
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If user clicks an image inside the editor, show the toolbar
      if (target.tagName?.toLowerCase() === "img" && target.closest(".ql-editor")) {
        const container = document.querySelector(".quill-triple-pane");
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
        // Hide it if they click anywhere else (except the toolbar itself)
        setSelectedImageInfo(null);
      }
    };

    document.addEventListener("click", handleEditorClick);
    return () => document.removeEventListener("click", handleEditorClick);
  }, []);

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

  // -- HELPERS --
  const currentValues = watch();

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
            
            // Sync with React Hook Form
            const currentContent = quill.root.innerHTML;
            setValue("content", currentContent === "<p><br></p>" ? "" : currentContent, { shouldDirty: true });
          }
        }
      } catch (err) {
        console.error("Error removing image from editor:", err);
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
        
        // We use both 'width' attribute and 'style' attribute for maximum compatibility
        // across different browsers and rendering engines.
        quill.formatText(index, 1, {
          width: width,
          style: `width: ${width}; height: auto; display: block; margin: 40px 0; border-radius: 2rem;`
        });
        
        // Sync with React Hook Form
        const currentContent = quill.root.innerHTML;
        setValue("content", currentContent === "<p><br></p>" ? "" : currentContent, { shouldDirty: true });
        
        // Update state to re-position toolbar
        const container = document.querySelector(".quill-triple-pane");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const imgRect = selectedImageInfo.element.getBoundingClientRect();
          setSelectedImageInfo({
            element: selectedImageInfo.element,
            top: imgRect.top - containerRect.top,
            left: imgRect.left - containerRect.left,
            width: imgRect.width
          });
        }
      }
    }
  };

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
          <div>
            <h1 className="text-sm font-black text-gray-900 tracking-tight uppercase italic italic">
                {isEdit ? 'Edit Story' : 'New Story'}
            </h1>
            <p className="text-[10px] font-bold text-[#1877F2]/60 uppercase tracking-widest leading-none">
                {step === 1 ? "Step 1: Configuration" : "Step 2: Write your story"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {step === 1 ? (
             <button 
               type="button"
               disabled={!watch("title") || !watch("category")}
               onClick={() => setStep(2)}
               className="group flex items-center gap-2 px-8 py-2.5 bg-[#1877F2] text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
             >
                Continue to Editor
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          ) : (
             <>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                >
                   <Eye size={14} />
                   Preview
                </button>
                <div className="h-6 w-px bg-gray-100 mx-1" />
                <button 
                   type="button"
                   onClick={() => {
                     setValue("status", "draft");
                     handleSubmit(onSubmit)();
                   }}
                   disabled={isPending}
                   className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-full shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 active:scale-95 transition-all disabled:opacity-50"
                >
                   Save as Draft
                </button>
                <button 
                   type="button"
                   onClick={() => {
                     setValue("status", "published");
                     handleSubmit(onSubmit)();
                   }}
                   disabled={isPending || !isValid}
                   className="px-8 py-2.5 bg-[#1877F2] text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                   {isPending ? (isEdit ? 'Updating...' : 'Publishing...') : (isEdit ? 'Update Post' : 'Publish Story')}
                </button>
             </>
          )}
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
        
        {/* STEP 1: CONFIGURATION VIEW */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in duration-500 bg-white">
             <div className="w-full py-8 md:py-12 px-6 md:px-16 space-y-12">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight italic italic">
                      Story <span className="text-[#1877F2]">Settings.</span>
                   </h2>
                   <p className="text-sm font-medium text-gray-500 italic">Tell us about your next masterpiece.</p>
                </div>

                <div className="space-y-8">
                    {/* Title Input */}
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Story Headline</label>
                      <textarea 
                        {...register("title")}
                        placeholder="What's on your mind?"
                        rows={2}
                        className="w-full bg-gray-50/50 border border-transparent rounded-[2rem] px-10 py-8 text-3xl md:text-4xl font-bold text-gray-900 placeholder:text-gray-200 outline-none focus:bg-white focus:border-blue-100 focus:shadow-[0_20px_40px_rgba(24,119,242,0.05)] transition-all resize-none shadow-inner"
                      />
                      {errors.title && <p className="text-xs font-bold text-red-500 pl-4 capitalize">{errors.title.message}</p>}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       {/* Category Section */}
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Category</label>
                          <div className="relative">
                              <select 
                                {...register("category")}
                                className="w-full bg-gray-50/50 border border-transparent rounded-2xl px-10 py-6 text-base font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer"
                              >
                                <option value="" disabled>Select a theme</option>
                                <option value="Technology">Technology</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Business">Business</option>
                                <option value="Education">Education</option>
                                <option value="AI">AI & Future</option>
                              </select>
                              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                  <Layout size={20} />
                              </div>
                          </div>
                          {errors.category && <p className="text-xs font-bold text-red-500 pl-4">{errors.category.message}</p>}
                       </div>

                       {/* Cover Image */}
                       <div className="space-y-4">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Cover Asset</label>
                          <input 
                            {...register("coverImageUrl")}
                            type="url"
                            placeholder="Image URL..."
                            className="w-full bg-gray-50/50 border border-transparent rounded-2xl px-10 py-6 text-base font-medium text-gray-700 outline-none focus:bg-white focus:border-blue-100 transition-all"
                          />
                       </div>
                   </div>

                   {/* Tags Section */}
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Keywords</label>
                      <div className="flex flex-wrap gap-3.5 p-6 bg-gray-50/50 border border-transparent rounded-[2rem] items-center min-h-[84px]">
                         {currentValues.tags?.map((tag) => (
                            <span key={tag} className="pl-5 pr-4 py-3 bg-white border border-gray-100 text-[11px] font-black text-[#1877F2] rounded-full flex items-center gap-2.5 hover:border-red-100 transition-all shadow-sm uppercase tracking-wider">
                               #{tag}
                               <X size={14} onClick={() => removeTag(tag)} className="cursor-pointer hover:text-red-500 transition-colors" />
                            </span>
                         ))}
                         <input 
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags..."
                            className="flex-1 bg-transparent border-none outline-none px-6 py-2 text-base font-bold text-gray-600 min-w-[150px]"
                         />
                      </div>
                   </div>

                   {/* Excerpt Section */}
                   <div className="space-y-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Quick Perspective</label>
                      <textarea 
                        {...register("excerpt")}
                        placeholder="A short punchy intro for the readers."
                        rows={4}
                        className="w-full bg-gray-50/50 border border-transparent rounded-[2rem] px-10 py-8 text-base font-medium text-gray-600 outline-none focus:bg-white focus:border-blue-100 transition-all resize-none shadow-inner"
                      />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* STEP 2: EDITOR VIEW */}
        {step === 2 && (
          <main className="flex-1 bg-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
             <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="w-full px-8 md:px-16 py-12">
                   <div className="flex flex-col space-y-10">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-4">
                         <div className="space-y-1">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">{watch("title")}</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{watch("category")} • {currentValues.content?.length || 0} characters</p>
                         </div>
                         <div className="flex gap-2">
                            {currentValues.tags?.slice(0, 3).map((tag: string) => (
                               <span key={tag} className="text-[10px] font-bold text-[#1877F2]/50 italic">#{tag}</span>
                            ))}
                         </div>
                      </div>
                      
                      <div className="flex-1 min-h-[600px] quill-triple-pane prose prose-xl max-w-none relative">
                         <style>{`
                           .ql-editor {
                             font-size: 1.25rem;
                             line-height: 1.8;
                             padding: 0 !important;
                             color: #1a1a1a;
                           }
                           .ql-editor p {
                             margin-bottom: 24px !important;
                           }
                           .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                             margin-top: 48px !important;
                             margin-bottom: 24px !important;
                             color: #111;
                             font-weight: 900 !important;
                             letter-spacing: -0.04em;
                           }
                           .ql-container.ql-snow {
                             border: none !important;
                             font-family: inherit !important;
                           }
                           .ql-toolbar.ql-snow {
                             border: none !important;
                             border-bottom: 1px solid #f3f4f6 !important;
                             padding: 20px 0 !important;
                             margin-bottom: 40px !important;
                             position: sticky;
                             top: 0;
                             z-index: 10;
                             background: white;
                           }
                           .ql-editor img {
                               cursor: pointer;
                               border-radius: 2rem;
                               margin: 40px 0;
                               display: block;
                               max-width: 100%;
                               transition: all 0.3s;
                               box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                           }
                           .ql-editor img:hover {
                               box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                           }
                         `}</style>
                         <Controller
                           name="content"
                           control={control}
                           render={({ field }) => (
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
                               className="h-full pb-32"
                               placeholder="Start your story..."
                             />
                           )}
                         />

                         {selectedImageInfo && (
                           <div 
                             className="img-toolbar absolute z-[100] flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                             style={{
                               top: `${selectedImageInfo.top - 60}px`, // Place above the image
                               left: `${selectedImageInfo.left + (selectedImageInfo.width / 2)}px`,
                               transform: 'translateX(-50%)'
                             }}
                           >
                             <div className="flex items-center gap-0.5 px-1 border-r border-gray-100 mr-1">
                               {[
                                 { label: 'S', width: '25%', title: 'Small' },
                                 { label: 'M', width: '50%', title: 'Medium' },
                                 { label: 'L', width: '75%', title: 'Large' },
                                 { label: 'XL', width: '100%', title: 'Full' }
                               ].map((size) => (
                                 <button
                                   key={size.label}
                                   type="button"
                                   onClick={() => handleResizeImage(size.width)}
                                   title={size.title}
                                   className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-black transition-all hover:bg-gray-50 active:scale-90 ${
                                     selectedImageInfo.element.style.width === size.width 
                                       ? 'bg-[#1877F2] text-white' 
                                       : 'text-gray-400'
                                   }`}
                                 >
                                   {size.label}
                                 </button>
                               ))}
                             </div>
                             
                             <button
                               type="button"
                               onClick={handleRemoveImage}
                               className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all ml-1"
                               title="Remove Image"
                             >
                               <Trash2 size={14} />
                             </button>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </main>
        )}

      </div>{/* END MAIN CONTENT */}

      {/* PREVIEW MODAL OVERLAY */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-300 overflow-hidden flex flex-col">
           {/* Header */}
           <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1877F2]">
                       <Eye size={20} />
                   </div>
                   <div>
                       <h3 className="text-xl font-black text-gray-900 tracking-tight italic">Story Preview.</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live rendering of your masterpiece</p>
                   </div>
               </div>
               <button 
                 type="button"
                 onClick={() => setIsPreviewOpen(false)}
                 className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
               >
                 <X size={24} />
               </button>
           </header>

           {/* Content */}
           <div className="flex-1 overflow-y-auto custom-scrollbar">
               <BlogPreview
                 title={currentValues.title}
                 content={currentValues.content}
                 excerpt={currentValues.excerpt}
                 coverImageUrl={currentValues.coverImageUrl}
                 tags={currentValues.tags || []}
               />
           </div>

           {/* Footer */}
           <footer className="px-8 py-6 bg-white border-t border-gray-100 flex items-center justify-center">
               <button 
                 type="button"
                 onClick={() => setIsPreviewOpen(false)}
                 className="px-12 py-4 bg-gray-900 text-white rounded-full font-bold text-sm tracking-tight hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/10"
               >
                 Return to Editor
               </button>
           </footer>
        </div>
      )}

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
