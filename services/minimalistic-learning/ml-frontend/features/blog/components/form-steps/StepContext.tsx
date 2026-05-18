import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Tags, X, ArrowLeft } from "lucide-react";
import { BlogValues } from "../../types/blog-type";

interface StepContextProps {
  register: UseFormRegister<BlogValues>;
  errors: FieldErrors<BlogValues>;
  watch: UseFormWatch<BlogValues>;
  setValue: UseFormSetValue<BlogValues>;
  tagInput: string;
  setTagInput: (val: string) => void;
  handleAddTag: (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => void;
  removeTag: (tag: string) => void;
  prevStep: () => void;
}

export const StepContext: React.FC<StepContextProps> = ({
  register,
  errors,
  watch,
  setValue,
  tagInput,
  setTagInput,
  handleAddTag,
  removeTag,
  prevStep
}) => {
  const currentTags = watch("tags") || [];

  return (
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
            {currentTags.map((tag) => (
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
              placeholder={currentTags.length >= 5 ? "Limit reached" : "Type and press Enter..."}
              disabled={currentTags.length >= 5}
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
        <button type="button" onClick={prevStep} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-all cursor-pointer">
          <ArrowLeft size={16} />
          Change Identity Settings
        </button>
      </div>
    </div>
  );
};
