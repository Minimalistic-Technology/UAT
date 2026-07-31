import React from "react";
import { ShieldCheck } from "lucide-react";
import { GlobalProfileCard } from "@/components/global-profile-card";

interface AdminProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  onEdit?: () => void;
  onImageUpload?: (file: File) => void;
}

export function AdminProfileCard({
  firstName,
  lastName,
  email,
  avatarUrl,
  onImageUpload,
}: AdminProfileCardProps) {
  return (
    <GlobalProfileCard
      firstName={firstName}
      lastName={lastName}
      email={email}
      avatarUrl={avatarUrl}
      onAvatarUpload={onImageUpload}
      profileStrength={100}
      badgeIcon={<ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}
      badgeText="Super Admin"
    />
  );
}
