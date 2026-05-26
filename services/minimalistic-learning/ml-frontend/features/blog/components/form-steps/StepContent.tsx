'use client'
import React from "react";
import { Control, Controller, FieldErrors, UseFormWatch } from "react-hook-form";
import { Settings2, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { BlogValues } from "../../types/blog-type";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for React Quill
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

interface StepContentProps {
  control: Control<BlogValues>;
  errors: FieldErrors<BlogValues>;
  watch: UseFormWatch<BlogValues>;
  quillRef: React.RefObject<any>;
  modules: any;
  formats: string[];
  isUploadingMedia: boolean;
  selectedImageInfo: any;
  handleResizeImage: (width: string) => void;
  handleRemoveImage: () => void;
  prevStep: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({
  control,
  errors,
  watch,
  quillRef,
  modules,
  formats,
  isUploadingMedia,
  selectedImageInfo,
  handleResizeImage,
  handleRemoveImage,
  prevStep
}) => {
  const currentValues = watch();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{currentValues.title || "Untitled Story"}</h2>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {currentValues.category || "General"} • {currentValues.tags?.length || 0} Tags
          </p>
        </div>
        <button 
          type="button"
          onClick={prevStep} 
          className="p-3 text-gray-400 hover:text-blue-600 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 transition-all shadow-sm cursor-pointer"
        >
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
  );
};
