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
  phone?: string;
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
  phone,
  avatarUrl,
  profileStrength = 100,
  badgeIcon,
  badgeText,
  readOnlyAvatar = false,
  onAvatarUpload,
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
  const strokeDashoffset =
    circumference - (profileStrength / 100) * circumference;

  const getStrokeColor = () => {
    if (profileStrength < 25) return "text-red-500";
    if (profileStrength < 100) return "text-orange-500";
    return "text-blue-500";
  };

  const displayAvatarUrl = localPreview || avatarUrl;
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <Card className="relative border-none shadow-sm dark:bg-slate-900/50">
      <div className="absolute top-0 left-0 h-24 w-full rounded-t-xl bg-gradient-to-r from-blue-600 to-indigo-600/20" />
      <CardContent className="relative z-10 flex flex-col items-center space-y-4 px-6 pt-12 pb-6 text-center">
        <div className="group relative mx-auto mb-4 flex h-32 w-32 items-center justify-center">
          <svg
            height={radius * 2}
            width={radius * 2}
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            className="absolute top-0 left-0 -rotate-90"
            style={{ overflow: "visible" }}
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
              style={{
                strokeDashoffset,
                transition: "stroke-dashoffset 0.8s ease-in-out",
              }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className={`${getStrokeColor()} drop-shadow-md`}
              strokeLinecap="round"
            />
          </svg>

          <div className="relative z-10 h-[100px] w-[100px] overflow-hidden rounded-full border-4 border-white bg-white shadow-md dark:border-slate-950">
            <Avatar className="h-full w-full">
              <AvatarImage src={displayAvatarUrl} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {!readOnlyAvatar && (
              <div
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Pencil className="h-6 w-6 text-white" />
                )}
              </div>
            )}
          </div>

          <div className="bg-background absolute -bottom-3 z-20 rounded-full border-2 px-3 py-0.5 text-xs font-extrabold text-slate-800 shadow-sm dark:text-slate-100">
            {Math.round(profileStrength)}%
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight">
            {firstName} {lastName}
          </h3>
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-1.5 text-sm font-medium">
            <div className="flex items-center gap-1.5 pt-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-phone"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>{phone}</span>
              </div>
            )}
            {badgeText && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[12px] font-medium tracking-wide text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
