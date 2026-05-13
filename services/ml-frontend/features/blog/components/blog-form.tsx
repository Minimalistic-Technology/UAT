"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  Send, 
  Sparkles
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

// Step Components
import { StepBasics } from "./form-steps/StepBasics";
import { StepContext } from "./form-steps/StepContext";
import { StepContent } from "./form-steps/StepContent";

// Register custom fonts and attributors with Quill
if (typeof window !== "undefined") {
  const { Quill } = require("react-quill-new");
  if (Quill) {
    const Font = Quill.import("formats/font");
    Font.whitelist = ["serif", "monospace", "roboto", "playfair", "montserrat", "lora"];
    Quill.register(Font, true);

    const ImageFormat = Quill.import("formats/image");
    class ResizableImage extends ImageFormat {
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
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImageInfo, setSelectedImageInfo] = useState<{ element: HTMLImageElement; top: number; left: number; width: number } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
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

  // -- AUTO-SAVE LOGIC --
  useEffect(() => {
    if (isEdit) return; 

    const delayDebounceFn = setTimeout(async () => {
      const { title, content, category, tags, coverImageUrl } = currentValues;
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
        } else {
          const res = await blogService.createBlog(payload as any);
          if (res.success && res.data._id) setActiveDraftId(res.data._id);
        }
      } catch (error) {
        console.error("Auto-save failed", error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [currentValues, isEdit, activeDraftId]);

  // -- QUILL HANDLERS --
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
        alert("Image upload failed");
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
        alert("Video upload failed");
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
        [{ align: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: { image: imageHandler, video: videoHandler }
    }
  }), [imageHandler, videoHandler]);

  // -- IMAGE TOOLBAR LOGIC --
  useEffect(() => {
    setIsMounted(true);
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { url } = await blogService.uploadMedia(file);
      setValue("coverImageUrl", url, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
      alert("Cover upload failed");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAddTag = (e: any) => {
    if (e.key && e.key !== "Enter") return;
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    const currentTags = currentValues.tags || [];
    if (currentTags.includes(trimmedTag)) { setTagInput(""); return; }
    if (currentTags.length >= 5) { setError("tags", { message: "Max 5 tags" }); return; }
    setValue("tags", [...currentTags, trimmedTag], { shouldValidate: true });
    setTagInput("");
    clearErrors("tags");
  };

  const removeTag = (tag: string) => {
    setValue("tags", (currentValues.tags || []).filter(t => t !== tag), { shouldValidate: true });
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
        setValue("content", quill.root.innerHTML, { shouldDirty: true });
      }
    }
    setSelectedImageInfo(null);
  };

  const handleRemoveImage = () => {
    if (selectedImageInfo && quillRef.current) {
      const { Quill } = require("react-quill-new");
      const quill = quillRef.current.getEditor();
      const blot = Quill.find(selectedImageInfo.element);
      if (blot) {
        const index = quill.getIndex(blot);
        quill.deleteText(index, 1);
        setValue("content", quill.root.innerHTML, { shouldDirty: true });
      }
    }
    setSelectedImageInfo(null);
  };

  const onSubmit = (data: BlogValues) => {
    const payload = { ...data, published: data.status === "published" };
    const mutationOptions = {
      onSuccess: () => {
        alert(payload.published ? "Story published!" : "Draft saved!");
        router.push(isEdit ? "/my-blogs" : "/");
      }
    };
    const targetId = isEdit ? id : activeDraftId;
    if (targetId) updateMutate({ id: targetId, data: payload as any }, mutationOptions);
    else createMutate(payload as any, mutationOptions);
  };

  const nextStep = async () => {
    const fields: any = step === 1 ? ["title", "category"] : ["tags", "excerpt"];
    if (await trigger(fields)) setStep(step + 1);
  };

  if (!isMounted || (isEdit && isLoadingBlog)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium text-sm">Initializing editor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => router.back()} className="p-2.5 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
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

        <div className="hidden md:flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400"}`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full ${step > s ? "bg-blue-600" : "bg-gray-100"}`} />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsPreviewOpen(true)} className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-gray-600 text-sm font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
            <Eye size={18} /> Preview
          </button>
          <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block" />
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setValue("status", "draft"); handleSubmit(onSubmit)(); }} disabled={isPending} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all">
                Draft
              </button>
              <button type="button" onClick={() => { setValue("status", "published"); handleSubmit(onSubmit, () => alert("Please fix missing fields"))(); }} disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                <Sparkles size={18} /> {isEdit ? "Update" : "Publish"}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {step === 1 && (
            <StepBasics 
              register={register} errors={errors} watch={watch} setValue={setValue}
              isAutoSaving={isAutoSaving} activeDraftId={activeDraftId} isEdit={isEdit}
              isUploadingCover={isUploadingCover} handleCoverUpload={handleCoverUpload}
              coverFileInputRef={coverFileInputRef}
            />
          )}
          {step === 2 && (
            <StepContext 
              register={register} errors={errors} watch={watch} setValue={setValue}
              tagInput={tagInput} setTagInput={setTagInput} handleAddTag={handleAddTag}
              removeTag={removeTag} prevStep={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepContent 
              control={control} errors={errors} watch={watch} quillRef={quillRef}
              modules={modules} formats={formats} isUploadingMedia={isUploadingMedia}
              selectedImageInfo={selectedImageInfo} handleResizeImage={handleResizeImage}
              handleRemoveImage={handleRemoveImage} prevStep={() => setStep(2)}
            />
          )}
        </div>
      </main>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white animate-in fade-in duration-300 flex flex-col">
            <div className="h-20 px-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2"><Eye className="text-blue-600" /> Preview Mode</h3>
                <button type="button" onClick={() => setIsPreviewOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all cursor-pointer"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <BlogPreview title={currentValues.title} content={currentValues.content} excerpt={currentValues.excerpt} coverImageUrl={currentValues.coverImageUrl} tags={currentValues.tags || []} />
            </div>
        </div>
      )}

      {(formError || Object.keys(errors).length > 0) && (
        <div className="fixed bottom-8 right-8 max-w-sm bg-red-600 text-white p-5 rounded-3xl shadow-2xl z-[100] flex items-center gap-4 animate-in slide-in-from-right-10">
           <X size={20} className="shrink-0" />
           <div className="text-xs font-bold leading-tight">
             {formError ? "Backend error. Please try again." : "Please check all required fields."}
           </div>
        </div>
      )}
    </div>
  );
};
