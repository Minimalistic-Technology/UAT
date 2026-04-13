"use client";

import {
  Mail,
  CalendarDays,
  ShieldCheck,
  MapPin,
  Edit2,
  KeyRound,
  FileText,
  ExternalLink,
  Upload,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useGetUserDetails } from "@/hooks/use-user";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";
import { useUploadAvatar, useUploadResume } from "@/hooks/use-upload";

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
  console.log("user", user)
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

      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <div className="bg-primary/10 rounded-lg p-2">
              <ShieldCheck className="text-primary h-6 w-6" />
            </div>
            My Profile
          </CardTitle>
          <CardDescription className="text-base">
            View and manage your personal and account security settings.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 shadow-sm">
            <Edit2 className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - User Overview */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border shadow-sm">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="border-background h-28 w-28 border-4 shadow-xl">
                    {user?.avatar ? (
                      <AvatarImage
                        src={user.avatar}
                        alt={`${user?.firstName} ${user?.lastName}`}
                      />
                    ) : null}
                    <AvatarFallback className="bg-muted text-primary text-4xl font-extrabold opacity-70">
                      {isAvatarUploading ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : (
                        initials || <UserPlus className="h-10 w-10" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Avatar FAB */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="border-primary/20 absolute right-1 -bottom-1 h-8 w-8 rounded-full border p-0 shadow-lg"
                    title="Upload Profile Picture"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isAvatarUploading}
                  >
                    {isAvatarUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-extrabold tracking-tight">
                    {session?.user?.name ??
                      `${user?.firstName} ${user?.lastName}`}
                  </h2>
                  <p className="text-muted-foreground font-mono text-sm font-medium lowercase">
                    {user?.email ?? "email not available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-3">
              <CardTitle className="text-foreground/80 text-sm font-semibold tracking-wide uppercase">
                Quick Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3.5 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground font-medium">
                  Location
                </span>
                <span className="text-foreground ml-auto text-right font-semibold">
                  {user?.location ?? "Not Specified"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3.5 text-sm">
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground font-medium">
                  Joined
                </span>
                <span className="text-foreground ml-auto text-right font-semibold tabular-nums">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Settings / Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="h-fit border shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="text-lg font-bold">
                Account Information
              </CardTitle>
              <CardDescription>
                General profile details visible to the platform.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-bold tracking-tight">
                    First Name
                  </label>
                  <Input
                    value={user?.firstName ?? ""}
                    readOnly
                    className="bg-muted/40 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-bold tracking-tight">
                    Last Name
                  </label>
                  <Input
                    value={user?.lastName ?? ""}
                    readOnly
                    className="bg-muted/40 font-medium"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-sm font-bold tracking-tight">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      value={user?.email ?? ""}
                      readOnly
                      className="bg-muted/40 pl-10 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Security Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg border p-2.5">
                    <KeyRound className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold">Security</h4>
                    <p className="text-muted-foreground text-sm">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-1.5 text-xs font-bold tracking-tight uppercase"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Resume & Cover Letter Section */}
          {isJobSeeker && (
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/20 border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <FileText className="text-primary h-5 w-5" />
                  Application Documents
                </CardTitle>
                <CardDescription>
                  Manage the documents you use for job applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Resume Section */}
                  <div className="space-y-3">
                    <label className="text-muted-foreground text-sm font-bold tracking-tight uppercase">
                      Resume
                    </label>
                    <div className="bg-muted/20 flex min-h-[58px] items-center justify-between rounded-md border p-3">
                      <span className="max-w-[150px] truncate text-sm font-medium">
                        {user?.resume ? "My_Resume.pdf" : "No resume found"}
                      </span>
                      {user?.resume ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={user.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary flex items-center gap-1.5"
                            >
                              <ExternalLink className="h-4 w-4" /> View
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => resumeInputRef.current?.click()}
                            disabled={isResumeUploading}
                          >
                            {isResumeUploading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={isResumeUploading}
                        >
                          {isResumeUploading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;

const ProfileSkeleton = () => (
  <div className="mx-auto max-w-7xl space-y-6 p-6">
    <div className="flex items-center justify-between border-b pb-2">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card className="lg:col-span-2">
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="col-span-2 h-12 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);