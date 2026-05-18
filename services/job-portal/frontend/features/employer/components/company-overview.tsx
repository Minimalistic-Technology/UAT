import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Globe, Loader2 } from "lucide-react";
import { IconBrandFacebook, IconBrandTwitter, IconBrandLinkedin } from '@tabler/icons-react';

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
  if (!company) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-900">
          Company Logo
        </h3>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg rounded-xl">
              <AvatarImage src={company?.logo?.url || ""} className="object-cover rounded-xl" />
              <AvatarFallback className="bg-indigo-50 text-indigo-600 text-3xl font-bold rounded-xl">
                {company.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-white shadow-sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={isLogoUploading}
            >
              {isLogoUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-slate-500">
            Allowed formats: JPEG, PNG. Max size: 5MB
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
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
