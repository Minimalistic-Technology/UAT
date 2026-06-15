"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Mail, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface GlobalProfileCardProps {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    profileStrength?: number;
    badgeIcon?: React.ReactNode;
    badgeText?: string;
    readOnlyAvatar?: boolean;
    onAvatarUpload?: (file: File) => void;
}

export function GlobalProfileCard({
    firstName,
    lastName,
    email,
    avatarUrl,
    profileStrength = 100,
    badgeIcon,
    badgeText,
    readOnlyAvatar = false,
    onAvatarUpload
}: GlobalProfileCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(previewUrl);

        if (onAvatarUpload) {
            onAvatarUpload(file);
        } else {
            try {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("avatar", file);
                await apiClient.put("/users/avatar", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                toast.success("Profile picture updated successfully!");
            } catch (error) {
                console.error(error);
                toast.error("Failed to upload profile picture");
                setLocalPreview(null);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const radius = 64;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (profileStrength / 100) * circumference;

    const getStrokeColor = () => {
        if (profileStrength < 25) return "text-red-500";
        if (profileStrength < 100) return "text-orange-500";
        return "text-blue-500";
    };

    const displayAvatarUrl = localPreview || avatarUrl;
    const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

    return (
        <Card className="border-none shadow-sm dark:bg-slate-900/50 relative">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600/20 w-full absolute top-0 left-0 rounded-t-xl" />
            <CardContent className="pt-12 pb-6 px-6 relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="relative group mx-auto mb-4 w-32 h-32 flex items-center justify-center">
                    <svg
                        height={radius * 2}
                        width={radius * 2}
                        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                        className="absolute top-0 left-0 -rotate-90"
                        style={{ overflow: 'visible' }}
                    >
                        <circle
                            stroke="currentColor"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            className="text-slate-100 dark:text-slate-800"
                        />
                        <circle
                            stroke="currentColor"
                            fill="transparent"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${circumference} ${circumference}`}
                            style={{ strokeDashoffset, transition: "stroke-dashoffset 0.8s ease-in-out" }}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                            className={`${getStrokeColor()} drop-shadow-md`}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white dark:border-slate-950 shadow-md z-10 bg-white">
                        <Avatar className="w-full h-full">
                            <AvatarImage src={displayAvatarUrl} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
                        </Avatar>

                        {!readOnlyAvatar && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <Pencil className="w-6 h-6 text-white" />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="absolute -bottom-3 bg-background border-2 px-3 py-0.5 rounded-full text-xs font-extrabold shadow-sm z-20 text-slate-800 dark:text-slate-100">
                        {Math.round(profileStrength)}%
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="font-bold tracking-tight text-xl">
                        {firstName} {lastName}
                    </h3>
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
                        <div className="flex items-center gap-1.5 pt-1">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{email}</span>
                        </div>
                        {badgeText && (
                            <div className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[12px] font-medium tracking-wide uppercase px-3 py-1 mt-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                {badgeIcon}
                                {badgeText}
                            </div>
                        )}
                    </div>
                </div>

                {!readOnlyAvatar && (
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                )}
            </CardContent>
        </Card>
    );
}
