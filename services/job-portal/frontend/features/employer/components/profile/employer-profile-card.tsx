"use client";

import { useRef, useState } from "react";
import { Building2, Pencil, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

// Shadcn components
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface EmployerProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  companyRole?: string | null;
  onImageUpload?: (file: File) => void;
}

export function EmployerProfileCard({
  firstName,
  lastName,
  email,
  avatarUrl,
  companyRole,
  onImageUpload,
}: EmployerProfileCardProps) {
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

    if (onImageUpload) {
      onImageUpload(file);
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

  const displayAvatarUrl = localPreview || avatarUrl;
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  const badgeText =
    companyRole === "owner" ? "Company Owner" : "Company Member";

  return (
    <Card className="relative overflow-hidden rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:bg-slate-900">
      <div className="absolute top-0 left-0 h-24 w-full bg-linear-to-r from-blue-600 to-indigo-600/20" />
      <CardContent className="relative z-10 flex flex-col items-center space-y-4 px-6 pt-12 pb-6 text-center">
        <div className="group relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
          <div className="relative z-10 h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-md dark:border-slate-900">
            <Avatar className="h-full w-full">
              <AvatarImage src={displayAvatarUrl} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

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
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {firstName} {lastName}
          </h3>
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-1.5 text-sm font-medium">
            <div className="flex items-center gap-1.5 pt-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[12px] font-medium tracking-wide text-slate-700 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="h-3.5 w-3.5 text-blue-500" />
              {badgeText}
            </div>
          </div>
        </div>

        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
}
