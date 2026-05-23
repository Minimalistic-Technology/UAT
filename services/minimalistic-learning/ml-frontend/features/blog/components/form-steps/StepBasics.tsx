import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Type, Layout, UploadCloud, Loader2, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { BlogValues } from "../../types/blog-type";

interface StepBasicsProps {
  register: UseFormRegister<BlogValues>;
  errors: FieldErrors<BlogValues>;
  watch: UseFormWatch<BlogValues>;
  setValue: UseFormSetValue<BlogValues>;
  isAutoSaving: boolean;
  activeDraftId: string | null;
  isEdit: boolean;
  isUploadingCover: boolean;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  coverFileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const StepBasics: React.FC<StepBasicsProps> = ({
  register,
  errors,
  watch,
  setValue,
  isAutoSaving,
  activeDraftId,
  isEdit,
  isUploadingCover,
  handleCoverUpload,
  coverFileInputRef
}) => {
  const coverImageUrl = watch("coverImageUrl");

  return (
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
            className={`group relative w-full h-[255px] bg-white border-2 border-dashed ${coverImageUrl ? "border-blue-200" : "border-gray-200"} rounded-[2.5rem] flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 shadow-sm overflow-hidden`}
          >
            {coverImageUrl ? (
              <>
                <img src={coverImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
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
  );
};
