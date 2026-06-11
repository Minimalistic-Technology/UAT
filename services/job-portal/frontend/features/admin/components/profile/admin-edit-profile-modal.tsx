import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";
import { LocationSelector } from "@/components/ui/location-selector";
import { UserSquare2, ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface AdminEditProfileModalProps {
    isEditing: boolean;
    setIsEditing: (open: boolean) => void;
    isLoading: boolean;
    email: string;
    avatarUrl?: string;
    onImageUpload?: (file: File) => void;
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
    avatarUrl,
    onImageUpload,
    formData,
    handleSave,
}: AdminEditProfileModalProps) {
    const [localData, setLocalData] = React.useState(formData);

    React.useEffect(() => {
        if (isEditing) {
            setLocalData(formData);
        }
    }, [isEditing, formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl sm:rounded-[24px]">
                <div className="p-6 sm:p-8 space-y-8 max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="text-left space-y-0 gap-3 flex flex-row items-center">
                        <div className="bg-blue-50 dark:bg-blue-900/40 p-2.5 rounded-xl">
                            <UserSquare2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-[19px] font-bold text-slate-800 dark:text-white tracking-tight">
                                Edit Profile
                            </DialogTitle>
                            <DialogDescription className="text-[13px] mt-0.5 text-slate-500">
                                Update your administrative credentials and preferences
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                        <div className="flex-shrink-0 scale-90 origin-left">
                            <ImageUpload
                                value={avatarUrl}
                                initials={`${localData.firstName.charAt(0)}${localData.lastName.charAt(0)}`}
                                onChange={(file) => onImageUpload && onImageUpload(file)}
                            />
                        </div>
                        <div className="space-y-1.5 flex-1">
                            <div className="inline-flex items-center text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" /> Super Admin
                            </div>
                            <h4 className="text-[17px] font-bold text-slate-800 dark:text-white leading-none">
                                {`${localData.firstName} ${localData.lastName}`}
                            </h4>
                            <p className="text-[12px] text-slate-500 max-w-sm leading-snug">
                                Manage the HireFlow ecosystem with global administrative permissions.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            Basic Information
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">First Name</Label>
                                <Input
                                    name="firstName"
                                    value={localData.firstName}
                                    onChange={handleChange}
                                    className="h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Last Name</Label>
                                <Input
                                    name="lastName"
                                    value={localData.lastName}
                                    onChange={handleChange}
                                    className="h-[2.35rem] bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-lg text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Email Address</Label>
                                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 uppercase tracking-wide">
                                        <ShieldCheck className="w-[10px] h-[10px]" /> Verified
                                    </span>
                                </div>
                                <div className="relative">
                                    <Input
                                        value={email}
                                        disabled
                                        className="h-[2.35rem] bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 rounded-lg text-sm pl-3 pr-9 opacity-80"
                                    />
                                    <Lock className="w-3.5 h-3.5 absolute right-3 top-[10px] text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Phone Number</Label>
                                <div className="flex h-[2.35rem]">
                                    <CountryCodeSelector name="countryCode" value={localData.countryCode} onChange={handleChange} />
                                    <Input
                                        name="phone"
                                        value={localData.phone}
                                        onChange={handleChange}
                                        className="h-full flex-1 rounded-l-none bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-r-lg text-sm px-3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-2">
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

                <div className="bg-slate-50 dark:bg-slate-900/60 p-5 px-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sm:rounded-b-[24px]">
                    <Button
                        variant="ghost"
                        disabled={isLoading}
                        className="text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 text-sm font-medium h-9"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isLoading}
                        onClick={() => handleSave(localData)}
                        className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 text-sm font-medium gap-2 h-9 px-5"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
