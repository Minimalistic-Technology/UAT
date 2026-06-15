"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { UserProfileForm } from "@/features/user/components/profile-form";
import { UserProfileCard } from "@/features/user/components/profile/user-profile-card";
import { UserQuickStats } from "@/features/user/components/profile/user-quick-stats";
import { UserPersonalInfo } from "@/features/user/components/profile/user-personal-info";
import { useGetUserDetails } from "@/features/user/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function UserProfilePage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { data: userData, isLoading } = useGetUserDetails(userId);
    const [isEditing, setIsEditing] = useState(false);

    const user = userData?.data;

    const profileStrength = useMemo(() => {
        if (!user) return 0;
        let strength = 0;
        if (user.firstName && user.lastName) strength += 15;
        if (user.email) strength += 10;
        if (user.phone) strength += 15;
        if (user.location?.city || user.location?.country) strength += 10;
        if (user.skills && user.skills.length > 0) strength += 15;
        if (user.experience && user.experience.length > 0) strength += 15;
        if (user.education && user.education.length > 0) strength += 10;
        if (user.resume?.url || user.resumeOriginalName) strength += 10;
        return strength;
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-5">
                <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    My Profile
                </h1>

                <Button onClick={() => setIsEditing(true)} size="sm" className="font-semibold shadow-sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl sm:rounded-[24px]">
                    <DialogHeader className="p-6 sm:p-8 pb-0 text-left border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogTitle className="text-xl font-bold tracking-tight">Edit Your Profile</DialogTitle>
                        <DialogDescription className="text-sm mt-1 mb-4 text-slate-500">
                            Update your resume, personal information, skills, and experience.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
                        <UserProfileForm onSuccess={() => setIsEditing(false)} />
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <UserProfileCard
                        firstName={user?.firstName || session?.user?.name?.split(" ")[0] || ""}
                        lastName={user?.lastName || session?.user?.name?.split(" ").slice(1).join(" ") || ""}
                        email={user?.email || session?.user?.email || ""}
                        avatarUrl={typeof user?.avatar === "string" ? user.avatar : user?.avatar?.url || ""}
                        profileStrength={profileStrength}
                    />
                    <UserQuickStats />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <UserPersonalInfo user={user} />
                    </div>
                </div>
            </div>
        </div>
    );
}

