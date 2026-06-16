import React from "react";
import { Building2 } from "lucide-react";
import { GlobalProfileCard } from "@/components/global-profile-card";

interface EmployerProfileCardProps {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    companyRole?: string | null;
    onEdit?: () => void;
    onImageUpload?: (file: File) => void;
}

export function EmployerProfileCard({
    firstName,
    lastName,
    email,
    avatarUrl,
    companyRole,
    onImageUpload
}: EmployerProfileCardProps) {
    return (
        <GlobalProfileCard
            firstName={firstName}
            lastName={lastName}
            email={email}
            avatarUrl={avatarUrl}
            onAvatarUpload={onImageUpload}
            profileStrength={100}
            badgeIcon={<Building2 className="w-3.5 h-3.5 text-blue-500" />}
            badgeText={companyRole === "owner" ? "Company Owner" : "Company Member"}
        />
    );
}
