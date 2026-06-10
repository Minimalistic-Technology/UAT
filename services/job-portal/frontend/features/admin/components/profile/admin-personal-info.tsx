import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserSquare2 } from "lucide-react";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";

interface AdminPersonalInfoProps {
    formData: {
        firstName: string;
        lastName: string;
        phone: string;
        countryCode: string;
        city: string;
        state: string;
    };
    email: string;
}

export function AdminPersonalInfo({ formData, email }: AdminPersonalInfoProps) {
    return (
        <Card className="shadow-sm rounded-[20px] bg-white dark:bg-slate-900 border-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 pt-6 px-8">
                <UserSquare2 className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-[17px] font-semibold text-slate-800 dark:text-white">
                    Personal Information
                </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-2">
                        <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">First Name</Label>
                        <Input
                            value={formData.firstName}
                            readOnly
                            className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-10 rounded-xl text-slate-700 dark:text-slate-200 pointer-events-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Last Name</Label>
                        <Input
                            value={formData.lastName}
                            readOnly
                            className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-10 rounded-xl text-slate-700 dark:text-slate-200 pointer-events-none"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Email Address</Label>
                        <Input
                            value={email}
                            readOnly
                            className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-10 rounded-xl text-slate-700 dark:text-slate-200 pointer-events-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Phone Number</Label>
                        <div className="flex h-10 w-full opacity-80 pointer-events-none">
                            <CountryCodeSelector
                                value={formData.countryCode}
                                disabled
                                className="h-full rounded-l-xl bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 border-r-0 text-slate-700 dark:text-slate-200 w-[70px] lg:w-[85px] pointer-events-none"
                            />
                            <Input
                                value={formData.phone}
                                readOnly
                                className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-full flex-1 rounded-r-xl rounded-l-none text-slate-700 dark:text-slate-200 px-3"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Location</Label>
                        <Input
                            value={`${formData.city}, ${formData.state}`}
                            readOnly
                            className="bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 h-10 rounded-xl text-slate-700 dark:text-slate-200 pointer-events-none"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
