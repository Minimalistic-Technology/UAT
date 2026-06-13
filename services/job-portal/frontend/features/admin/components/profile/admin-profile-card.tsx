import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, ShieldCheck } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface AdminProfileCardProps {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    onEdit?: () => void;
    onImageUpload?: (file: File) => void;
}

export function AdminProfileCard({ firstName, lastName, email, avatarUrl, onEdit, onImageUpload }: AdminProfileCardProps) {
    return (
        <Card className="shadow-sm rounded-[20px] overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)] pt-6">
            <CardContent className="p-8 pb-10 flex flex-col items-center text-center space-y-5">
                <ImageUpload
                    disabled={false}
                    value={avatarUrl}
                    initials={`${firstName.charAt(0)}${lastName.charAt(0)}`}
                    onChange={(file) => onImageUpload && onImageUpload(file)}
                />

                <div className="space-y-1.5">
                    <h3 className="text-[1.35rem] font-bold text-slate-800 dark:text-white leading-none">
                        {`${firstName} ${lastName}`}
                    </h3>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400">{email}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px] font-medium">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Super Admin
                </div>
            </CardContent>
        </Card>
    );
}
