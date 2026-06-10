import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBrandFacebook, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';
import { useGetUserDetails } from "@/hooks/use-user";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

interface CompanyOverviewProps {
  company: any;
  isLogoUploading: boolean;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
}

export const CompanyOverview = ({
  company,
  isLogoUploading,
  logoInputRef,
}: CompanyOverviewProps) => {
  const { data: userDetailsResponse } = useGetUserDetails();
  const user = userDetailsResponse?.data;
  const isOwner = user && company?.owner?._id === user._id;

  if (!company) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border-0 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">
          Company Logo
        </h3>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <ImageUpload
              value={company?.logo?.url}
              initials={company.name?.charAt(0).toUpperCase()}
              disabled={!isOwner || isLogoUploading}
              onChange={(file) => {
                if (!isOwner) {
                  toast.error("You are not authorized to update the company logo");
                  return;
                }
                if (logoInputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  logoInputRef.current.files = dataTransfer.files;
                  logoInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }}
            />
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            Allowed formats: JPEG, PNG. Max size: 5MB
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border-0 bg-white dark:bg-slate-900 p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Links & Social
        </h3>

        <div className="space-y-4">
          {company.website ? (
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-md">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate">
                {company.website}
              </a>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No website added</div>
          )}

          {company.socialLinks?.linkedin && (
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-md">
                <IconBrandLinkedin className="h-4 w-4 text-slate-600" />
              </div>
              <a href={company.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate">
                LinkedIn Profile
              </a>
            </div>
          )}

          {company.socialLinks?.twitter && (
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-md">
                <IconBrandTwitter className="h-4 w-4 text-slate-600" />
              </div>
              <a href={company.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate">
                Twitter Profile
              </a>
            </div>
          )}

          {company.socialLinks?.facebook && (
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-md">
                <IconBrandFacebook className="h-4 w-4 text-slate-600" />
              </div>
              <a href={company.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate">
                Facebook Profile
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
