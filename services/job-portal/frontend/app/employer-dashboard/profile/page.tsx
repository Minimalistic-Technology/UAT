"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNavSession } from "@/hooks/use-nav-session";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";

import { EmployerProfileCard } from "@/features/employer/components/profile/employer-profile-card";
import { EmployerQuickStats } from "@/features/employer/components/profile/employer-quick-stats";
import { EmployerPersonalInfo } from "@/features/employer/components/profile/employer-personal-info";
import { EmployerSecurityCard } from "@/features/employer/components/profile/employer-security-card";
import { EmployerEditProfileModal } from "@/features/employer/components/profile/employer-edit-profile-modal";

export default function EmployerProfilePage() {
  const { session } = useNavSession();
  const { update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
  const companyRole = session?.user?.companyRole;

  // Fetch real profile data immediately when session has loaded
  useEffect(() => {
    async function fetchProfile() {
      if (session?.user?.id) {
        try {
          const res = await apiClient.get(`/users/${session.user.id}`);
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
                .filter((c: string) => dbUser.phone.startsWith(c))
                .sort((a: string, b: string) => b.length - a.length)[0];
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

  const handleSave = async (updatedData: any) => {
    try {
      setIsLoading(true);

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        await apiClient.put("/users/avatar", avatarFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setAvatarFile(null); // Clear after successful upload
      }

      // Update profile details
      await apiClient.put("/users/profile", {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phone: updatedData.phone
          ? `${updatedData.countryCode}${updatedData.phone}`
          : "",
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
        <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900">
          My Profile
        </h1>
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-3.5 w-3.5" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6">
          <EmployerProfileCard
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={email}
            avatarUrl={avatarUrl}
            companyRole={companyRole}
          />
          {/* <EmployerQuickStats /> */}
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          <EmployerPersonalInfo formData={formData} email={email} />
          {/* <EmployerSecurityCard /> */}
        </div>
      </div>

      <EmployerEditProfileModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isLoading={isLoading}
        email={email}
        avatarUrl={avatarUrl}
        companyRole={companyRole}
        formData={formData}
        handleSave={handleSave}
        onImageUpload={(file) => {
          const previewUrl = URL.createObjectURL(file);
          setAvatarUrl(previewUrl);
          setAvatarFile(file);
          toast.info("Image selected! Click Save to upload to Cloud.");
        }}
      />
    </div>
  );
}
