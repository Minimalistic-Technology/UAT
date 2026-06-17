import { BuildingIcon } from "lucide-react";
import { ReadOnlyField, inputBase } from "@/features/employer/components/profile"
import { cn } from "@/lib/utils";

// Shadcn Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";
import { Input } from "@/components/ui/input";

interface EmployerPersonalInfoProps {
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

export function EmployerPersonalInfo({ formData, email }: EmployerPersonalInfoProps) {
  const locationString = [formData.city, formData.state, formData.country]
    .filter(Boolean)
    .join(", ");

  const fields: {
    label: string;
    value: string;
    placeholder?: string;
    colSpan?: boolean;
    custom?: React.ReactNode;
  }[] = [
    { label: "First Name",  value: formData.firstName },
    { label: "Last Name",   value: formData.lastName },
    { label: "Email Address", value: email },
    {
      label: "Phone Number",
      value: formData.phone,
      placeholder: "Phone number not provided",
      custom: formData.phone ? (
        <div className="flex h-10 w-full opacity-80 pointer-events-none">
          <CountryCodeSelector
            value={formData.countryCode}
            disabled
            className={cn(
              inputBase,
              "w-[70px] lg:w-[85px] rounded-r-none border-r-0 text-slate-700 dark:text-slate-200"
            )}
          />
          <Input
            value={formData.phone}
            readOnly
            className={cn(inputBase, "flex-1 rounded-l-none px-3 text-slate-700 dark:text-slate-200")}
          />
        </div>
      ) : undefined,
    },
  ];

  return (
    <Card className="rounded-[20px] border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-8 pb-4 pt-6">
        <BuildingIcon className="h-5 w-5 text-blue-500" />
        <CardTitle className="text-[17px] font-semibold text-slate-800 dark:text-white">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {fields.map((field) => (
            <ReadOnlyField
              key={field.label}
              label={field.label}
              value={field.value}
              placeholder={field.placeholder}
              className={field.colSpan ? "md:col-span-2" : undefined}
            >
              {field.custom}
            </ReadOnlyField>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}