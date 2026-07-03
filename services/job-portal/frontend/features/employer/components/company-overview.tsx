import { Globe, Loader2 } from "lucide-react";
import { SOCIAL_LINKS } from "../config";
import { useGetUserDetails } from "@/hooks/use-user";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import Link from "next/link";

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
  const isOwner = user && company?.owner?.id === user.id;

  if (!company) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
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
                  toast.error(
                    "You are not authorized to update the company logo",
                  );
                  return;
                }
                if (logoInputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  logoInputRef.current.files = dataTransfer.files;
                  logoInputRef.current.dispatchEvent(
                    new Event("change", { bubbles: true }),
                  );
                }
              }}
            />
            {isLogoUploading && (
              <div className="absolute inset-0 z-10 flex h-28 w-28 items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-sm text-slate-500">
            Allowed formats: JPEG, PNG. Max size: 5MB
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900">Links & Social</h3>

        <div className="space-y-4">
          {company.website ? (
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-slate-100 p-2">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <Link
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium text-indigo-600 hover:underline"
              >
                {company.website}
              </Link>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No website added</div>
          )}

          {SOCIAL_LINKS.map((link) => {
            const url = company.socialLinks?.[link.key];
            if (!url) return null;
            return (
              <div key={link.key} className="flex items-center gap-3">
                <div className="rounded-md bg-slate-100 p-2">{link.icon}</div>
                <Link
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm font-medium text-indigo-600 hover:underline"
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
