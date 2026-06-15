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
    country: string;
  };
  email: string;
}

export function AdminPersonalInfo({ formData, email }: AdminPersonalInfoProps) {
  return (
    <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] shadow-sm dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-8 pt-6 pb-4">
        <UserSquare2 className="h-5 w-5 text-blue-500" />
        <CardTitle className="text-[17px] font-semibold text-slate-800 dark:text-white">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              First Name
            </Label>
            <Input
              value={formData.firstName}
              readOnly
              className="pointer-events-none h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Last Name
            </Label>
            <Input
              value={formData.lastName}
              readOnly
              className="pointer-events-none h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Email Address
            </Label>
            <Input
              value={email}
              readOnly
              className="pointer-events-none h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
              Phone Number
            </Label>
            <div className="pointer-events-none flex h-10 w-full opacity-80">
              <CountryCodeSelector
                value={formData.countryCode}
                disabled
                className="pointer-events-none h-full w-[70px] rounded-l-xl border-r-0 border-slate-200 bg-slate-50 text-slate-700 lg:w-[85px] dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
              />
              <Input
                value={formData.phone}
                readOnly
                className="h-full flex-1 rounded-l-none rounded-r-xl border-slate-200 bg-slate-50 px-3 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
              />
            </div>
          </div>
          {formData.city && formData.state && formData.country && (
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Location
              </Label>
              <Input
                value={`${formData.city}, ${formData.state}, ${formData.country}`}
                readOnly
                className="pointer-events-none h-10 rounded-xl border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
