"use client";

import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    initials?: string;
    onChange: (file: File) => void;
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

    const handleClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onChange(file);
    };

    const displayUrl = previewUrl || value;

    return (
        <div className={cn("relative group cursor-pointer inline-block", className)} onClick={handleClick}>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
            />

            {/* Avatar Display */}
            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden text-3xl font-bold text-slate-500 ring-4 ring-white shadow-sm transition-all group-hover:ring-slate-100">
                {displayUrl ? (
                    <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    initials || "U"
                )}
            </div>

            {/* Upload Badge Action */}
            {!disabled && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 flex items-center justify-center rounded-full shadow-md hover:bg-slate-50 transition-colors">
                    {icon || <Camera className="w-3.5 h-3.5 text-slate-500" />}
                </div>
            )}
        </div>
    );
}
