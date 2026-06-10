"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNavSession } from "@/hooks/use-nav-session";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

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

  // Provide stable defaults
  const name = session?.user?.name || "Super Admin";
  const email = session?.user?.email || "admin@jobsmadeeasy.com";
  const nameParts = name.split(" ");
  const fallbackFirst = nameParts[0] || "Super";
  const fallbackLast = nameParts.slice(1).join(" ") || "Admin";

  const [formData, setFormData] = useState({
    firstName: fallbackFirst,
    lastName: fallbackLast,
    phone: "555-0123",
    countryCode: "+1",
    city: "San Francisco",
    state: "California",
    country: "United States"
  });

  // Keep state synced if session loads late
  useEffect(() => {
    if (session?.user?.name) {
      const parts = session.user.name.split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(" ") || prev.lastName
      }));
    }
  }, [session?.user?.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await apiClient.put("/users/profile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `${formData.countryCode}${formData.phone}`,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        }
      });

      if (update) {
        await update({ name: `${formData.firstName} ${formData.lastName}` });
      }
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-5">
        <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900 dark:text-white">Profile Page</h1>
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 rounded-lg px-5 h-9"
        >
          <Edit className="w-3.5 h-3.5 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <AdminProfileCard
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={email}
            onEdit={() => setIsEditing(true)}
            onImageUpload={(file) => {
              console.log("File ready to upload:", file);
              // Handle your backend API call here
            }}
          />
          <AdminQuickStats />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <AdminPersonalInfo formData={formData} email={email} />
          <AdminSecurityCard />
        </div>
      </div>

      <AdminEditProfileModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isLoading={isLoading}
        email={email}
        formData={formData}
        handleChange={handleChange}
        handleSave={handleSave}
      />
    </div>
  );
}