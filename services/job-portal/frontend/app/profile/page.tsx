"use client";

import { useRef } from "react";
import { useSession } from "next-auth/react";
import { useGetUserDetails } from "@/hooks/use-user";
import { useUploadAvatar, useUploadResume } from "@/hooks/use-upload";

import { ProfileHeader } from "./_components/profile-header";
import { ProfileOverview } from "./_components/profile-overview";
import { AccountInformation } from "./_components/account-information";
import { ApplicationDocuments } from "./_components/application-documents";
import { SkillsSection } from "./_components/skills-section";
import { ExperienceSection } from "./_components/experience-section";
import { EducationSection } from "./_components/education-section";
import { ProfileSkeleton } from "./_components/profile-skeleton";

const Page = () => {
  const {
    data: userDetails,
    isLoading: isUserLoading,
    isError,
  } = useGetUserDetails();

  const { data: session, status } = useSession();

  const { mutate: mutateAvatar, isPending: isAvatarUploading } = useUploadAvatar();
  const { mutate: mutateResume, isPending: isResumeUploading } = useUploadResume();

  const user = userDetails?.data;
  console.log("user", user);
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  const isDataLoading = isUserLoading || status === "loading";

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutateAvatar(file);
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutateResume(file);
  };

  if (isDataLoading) {
    return <ProfileSkeleton />;
  }

  // Logic for Job Seeker specific documents (Role is 'user' and not an employee)
  const isJobSeeker = user?.role === "user" && !session?.user?.isEmployee;
  console.log("Is Job Seeker: ", isJobSeeker);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Hidden Native File Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarSelect}
      />
      <input
        type="file"
        ref={resumeInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeSelect}
      />

      <ProfileHeader user={user} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProfileOverview
          user={user}
          session={session}
          initials={initials}
          isAvatarUploading={isAvatarUploading}
          avatarInputRef={avatarInputRef}
        />

        {/* Right Column - Account Settings / Details */}
        <div className="space-y-6 lg:col-span-2">
          <AccountInformation user={user} />

          {isJobSeeker && (
            <>
              <ApplicationDocuments
                user={user}
                isResumeUploading={isResumeUploading}
                resumeInputRef={resumeInputRef}
              />
              <SkillsSection user={user} />
              <ExperienceSection user={user} />
              <EducationSection user={user} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;