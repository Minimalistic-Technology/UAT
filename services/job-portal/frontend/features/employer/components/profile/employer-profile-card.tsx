import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface EmployerProfileCardProps {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    companyRole?: string | null;
    onEdit?: () => void;
    onImageUpload?: (file: File) => void;
}

export function EmployerProfileCard({ firstName, lastName, email, avatarUrl, companyRole, onEdit, onImageUpload }: EmployerProfileCardProps) {
    return (
        <Card className="shadow-sm rounded-[20px] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)] pt-6">
            <CardContent className="p-8 pb-10 flex flex-col items-center text-center space-y-5">
                <ImageUpload
                    disabled={true}
                    value={avatarUrl}
                    initials={`${firstName.charAt(0)}${lastName.charAt(0)}`}
                />

                <div className="space-y-1.5">
                    <h3 className="text-[1.35rem] font-bold text-slate-800 dark:text-white leading-none">
                        {`${firstName} ${lastName}`}
                    </h3>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400">{email}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px] font-medium tracking-wide uppercase px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    {companyRole === "owner" ? "Company Owner" : "Company Member"}
                </div>
            </CardContent>
        </Card>
    );
}
