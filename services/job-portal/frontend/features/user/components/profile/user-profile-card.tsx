import React from "react";
import { GlobalProfileCard } from "@/components/global-profile-card";

interface UserProfileCardProps {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    profileStrength: number;
    onAvatarUpload?: (file: File) => void;
}

export function UserProfileCard(props: UserProfileCardProps) {
    return <GlobalProfileCard {...props} />;
}
