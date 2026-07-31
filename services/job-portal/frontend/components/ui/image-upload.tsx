"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  initials?: string;
  onChange?: (file: File) => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function ImageUpload({
  value,
  initials,
  onChange,
  disabled = false,
  className,
  icon,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(null);
  }, [value]);

  const handleClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onChange?.(file);
  };

  const displayUrl = previewUrl || value;

  return (
    <div
      className={cn(
        "relative inline-block",
        !disabled && "group cursor-pointer",
        className,
      )}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Avatar Display */}
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-3xl font-bold text-slate-500 shadow-sm ring-4 ring-white transition-all group-hover:ring-slate-100">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          initials || "U"
        )}
      </div>

      {/* Upload Badge Action */}
      {!disabled && (
        <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-colors hover:bg-slate-50">
          {icon || <Camera className="h-3.5 w-3.5 text-slate-500" />}
        </div>
      )}
    </div>
  );
}
