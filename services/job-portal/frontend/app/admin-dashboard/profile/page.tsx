"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNavSession } from "@/hooks/use-nav-session";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";

// Import our new admin profile components
import { AdminProfileCard } from "@/features/admin/components/profile/admin-profile-card";
import { AdminQuickStats } from "@/features/admin/components/profile/admin-quick-stats";
import { AdminPersonalInfo } from "@/features/admin/components/profile/admin-personal-info";
import { AdminSecurityCard } from "@/features/admin/components/profile/admin-security-card";
import { AdminEditProfileModal } from "@/features/admin/components/profile/admin-edit-profile-modal";

export default function ProfilePage() {
  const { session } = useNavSession();
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+91",
    city: "",
    state: "",
    country: "",
  });

  const email = session?.user?.email || "";

  // Fetch real profile data immediately when session has loaded
  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        try {
          const res = await apiClient.get(
            `/users/${session.user.id}?t=${Date.now()}`,
          );
          if (res.data?.success) {
            const dbUser = res.data.data;
            let finalPhone = "";
            let finalCountryCode = "+91";
            if (dbUser.phone) {
              const possibleCodes = [
                "+1",
                "+7",
                "+20",
                "+27",
                "+33",
                "+34",
                "+39",
                "+44",
                "+49",
                "+52",
                "+55",
                "+60",
                "+61",
                "+64",
                "+65",
                "+81",
                "+82",
                "+86",
                "+91",
                "+92",
                "+94",
                "+98",
                "+254",
                "+353",
                "+358",
                "+880",
                "+971",
                "+972",
                "+977",
              ];
              const matched = possibleCodes
                .filter((c) => dbUser.phone.startsWith(c))
                .sort((a, b) => b.length - a.length)[0];
              if (matched) {
                finalCountryCode = matched;
                finalPhone = dbUser.phone.slice(matched.length).trim();
              } else {
                finalPhone = dbUser.phone; // fallback
              }
            }

            setFormData((prev) => ({
              ...prev,
              firstName: dbUser.firstName || "",
              lastName: dbUser.lastName || "",
              phone: finalPhone,
              countryCode: finalCountryCode,
              city: dbUser.location?.city || "",
              state: dbUser.location?.state || "",
              country: dbUser.location?.country || "",
            }));
            if (dbUser.avatar?.url || dbUser.avatar) {
              setAvatarUrl(dbUser.avatar?.url || dbUser.avatar);
            }
          }
        } catch (error) {
          console.error("Failed to fetch fresh profile data:", error);
        }
      }
    }
    fetchProfile();
  }, [session?.user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    const avatarFormData = new FormData();
    avatarFormData.append("avatar", file);

    try {
      const response = await apiClient.put("/users/avatar", avatarFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data?.success && response.data.data?.avatarUrl) {
        setAvatarUrl(response.data.data.avatarUrl);
      }
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Some error occured while uploading avatar");
    }
  };

  const handleSave = async (updatedData: any) => {
    try {
      setIsLoading(true);

      // Update profile details
      await apiClient.put("/users/profile", {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phone: `${updatedData.countryCode}${updatedData.phone}`,
        location: {
          city: updatedData.city,
          state: updatedData.state,
          country: updatedData.country,
        },
      });

      if (update) {
        await update({
          name: `${updatedData.firstName} ${updatedData.lastName}`,
        });
      }

      // Update local state to reflect instantly on main UI
      setFormData(updatedData);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b pb-5">
        <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900 dark:text-white">
          Profile Page
        </h1>
        <Button
          onClick={() => setIsEditing(true)}
          className="h-9 rounded-lg bg-blue-600 px-5 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
        >
          <Edit className="mr-2 h-3.5 w-3.5" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6">
          <AdminProfileCard
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={email}
            avatarUrl={avatarUrl}
            onEdit={() => setIsEditing(true)}
            onImageUpload={handleAvatarUpload}
          />
          {/* <AdminQuickStats /> */}
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          <AdminPersonalInfo formData={formData} email={email} />
          {/* <AdminSecurityCard /> */}
        </div>
      </div>

      <AdminEditProfileModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isLoading={isLoading}
        email={email}
        formData={formData}
        handleSave={handleSave}
      />
    </div>
  );
}
