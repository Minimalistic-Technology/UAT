import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";
import { LocationSelector } from "@/components/ui/location-selector";
import {
  UserSquare2,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface AdminEditProfileModalProps {
  isEditing: boolean;
  setIsEditing: (open: boolean) => void;
  isLoading: boolean;
  email: string;
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    countryCode: string;
    city: string;
    state: string;
    country: string;
  };
  handleSave: (data: any) => void;
}

export function AdminEditProfileModal({
  isEditing,
  setIsEditing,
  isLoading,
  email,
  formData,
  handleSave,
}: AdminEditProfileModalProps) {
  const [localData, setLocalData] = React.useState(formData);

  React.useEffect(() => {
    if (isEditing) {
      setLocalData(formData);
    }
  }, [isEditing, formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden border-0 bg-white p-0 shadow-2xl sm:rounded-[24px] dark:bg-slate-900">
        <div className="max-h-[85vh] space-y-8 overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-900/40">
              <UserSquare2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-[19px] font-bold tracking-tight text-slate-800 dark:text-white">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                Update your administrative credentials and preferences
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex items-center border-b border-slate-100 pb-6 dark:border-slate-800/60">
            <div className="flex-1 space-y-1.5">
              <div className="mb-0.5 inline-flex items-center text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                <ShieldCheck className="mr-1 h-3.5 w-3.5 text-blue-500" /> Super
                Admin
              </div>
              <h4 className="text-[17px] leading-none font-bold text-slate-800 dark:text-white">
                {`${localData.firstName} ${localData.lastName}`}
              </h4>
              <p className="max-w-sm text-[12px] leading-snug text-slate-500">
                Manage the HireFlow ecosystem with global administrative
                permissions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
              Basic Information
            </h5>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                  First Name
                </Label>
                <Input
                  name="firstName"
                  value={localData.firstName}
                  onChange={handleChange}
                  className="h-[2.35rem] rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                  Last Name
                </Label>
                <Input
                  name="lastName"
                  value={localData.lastName}
                  onChange={handleChange}
                  className="h-[2.35rem] rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                    Email Address
                  </Label>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                    <ShieldCheck className="h-[10px] w-[10px]" /> Verified
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={email}
                    disabled
                    className="h-[2.35rem] rounded-lg border-slate-200 bg-slate-100/60 pr-9 pl-3 text-sm opacity-80 dark:border-slate-800/80 dark:bg-slate-800/40"
                  />
                  <Lock className="absolute top-[10px] right-3 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
                  Phone Number
                </Label>
                <div className="flex h-[2.35rem]">
                  <CountryCodeSelector
                    name="countryCode"
                    value={localData.countryCode}
                    onChange={handleChange}
                  />
                  <Input
                    name="phone"
                    value={localData.phone}
                    onChange={handleChange}
                    className="h-full flex-1 rounded-l-none rounded-r-lg border-slate-200 bg-slate-50/50 px-3 text-sm focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="mt-2 text-[11px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
              Location Details
            </h5>
            <LocationSelector
              city={localData.city}
              state={localData.state}
              country={localData.country}
              onChange={(name, value) => {
                // Simulate event object for existing handleChange
                handleChange({ target: { name, value } } as any);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-5 px-6 sm:rounded-b-[24px] dark:border-slate-800 dark:bg-slate-900/60">
          <Button
            variant="ghost"
            disabled={isLoading}
            className="h-9 text-sm font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => handleSave(localData)}
            className="h-9 gap-2 bg-blue-600 px-5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
