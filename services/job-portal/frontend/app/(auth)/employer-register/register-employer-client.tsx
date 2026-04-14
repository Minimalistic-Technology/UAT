"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { registerEmployerSchema, type EmployerRegisterInput } from "@/features/auth/validations/auth.schema";
import { useRegisterEmployer } from "@/features/auth/hooks/use-register";
import { CompanyRole } from "@/types";

type EmployerRegisterFormValues = Omit<EmployerRegisterInput, "role">;

const industries = [
  "Technology", "Finance", "Healthcare", "Education", 
  "E-commerce", "Manufacturing", "Consulting", 
  "Marketing", "Real Estate", "Other",
];

export default function EmployerRegisterPage() {
  const registerMutation = useRegisterEmployer();
  const router = useRouter();
  const [dropdownIndustry, setDropdownIndustry] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EmployerRegisterFormValues>({
    resolver: zodResolver(registerEmployerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: EmployerRegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }

    const payload: EmployerRegisterInput = {
      ...data,
      role: CompanyRole.OWNER,
    };

    registerMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Registration failed");
      },
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 px-4 py-12">
      <div className="w-full max-w-lg">
        
        <Card className="shadow-lg border-muted/60">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Create Employer Account</CardTitle>
            <CardDescription>
              Hire top talent and grow your company
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Personal Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      disabled={isLoading}
                      {...register("firstName")} 
                    />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      disabled={isLoading}
                      {...register("lastName")} 
                    />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Company Details
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Acme Inc." 
                    disabled={isLoading}
                    {...register("companyName")} 
                  />
                  {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Industry</Label>
                  <Select 
                    value={dropdownIndustry}
                    onValueChange={(value) => {
                      setDropdownIndustry(value);
                      if (value !== "Other") {
                        setValue("industry", value, { shouldValidate: true });
                        clearErrors("industry");
                      } else {
                        setValue("industry", "");
                        clearErrors("industry");
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {dropdownIndustry === "Other" && (
                    <Input
                      placeholder="Please specify your industry"
                      disabled={isLoading}
                      className={`mt-2 ${errors.industry ? "border-destructive" : ""}`}
                      {...register("industry")}
                    />
                  )}
                  {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    disabled={isLoading}
                    {...register("email")} 
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      disabled={isLoading}
                      {...register("password")} 
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      disabled={isLoading}
                      {...register("confirmPassword")} 
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register Company"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}