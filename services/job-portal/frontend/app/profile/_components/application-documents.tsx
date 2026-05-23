import { Button } from "@/components/ui/button";
import { Loader2, Upload, ExternalLink, FileText } from "lucide-react";
import { User } from "@/types";
import { ProfileSectionCard } from "./profile-section-card";

interface ApplicationDocumentsProps {
  user: User | undefined;
  isResumeUploading: boolean;
  resumeInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ApplicationDocuments = ({
  user,
  isResumeUploading,
  resumeInputRef,
}: ApplicationDocumentsProps) => {
  return (
    <ProfileSectionCard
      icon={FileText}
      title="Application Documents"
      description="Manage the documents you use for job applications."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Resume Section */}
        <div className="space-y-3">
          <label className="text-muted-foreground text-sm font-bold tracking-tight uppercase">
            Resume
          </label>
          <div className="bg-muted/20 flex min-h-[58px] items-center justify-between rounded-md border p-3">
            <span
              className="max-w-[150px] truncate text-sm font-medium"
              title={user?.resumeOriginalName || "My_Resume.pdf"}
            >
              {user?.resume?.url
                ? user?.resumeOriginalName || "My_Resume.pdf"
                : "No resume found"}
            </span>
            {user?.resume?.url ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={user.resume.url}
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
    </ProfileSectionCard>
  );
};
