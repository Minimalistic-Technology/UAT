"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  registerEmployerSchema,
  type EmployerRegisterInput,
} from "@/features/auth/validations/auth.schema";
import { useRegisterEmployer } from "@/features/auth/hooks/use-register";
import { CompanyRole } from "@/types";
import Image from "next/image";
import { getValidationErrorMessage } from "@/lib/validation-error";

type EmployerRegisterFormValues = Omit<EmployerRegisterInput, "role">;

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Marketing",
  "Real Estate",
  "Other",
];

export default function EmployerRegisterPage() {
  const registerMutation = useRegisterEmployer();
  const router = useRouter();
  const [dropdownIndustry, setDropdownIndustry] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        const errorMessage = error?.response?.data?.message || error.message;
        toast.error(errorMessage || "Employer Registration failed");
      },
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="flex h-[calc(100dvh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden h-full w-1/2 lg:block relative shrink-0">
        <Image
          src="/employer-signup-page-img.png"
          alt="employer-signup-image"
          fill
          priority
          className="object-cover object-right"
        />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <Card className="m-auto w-full max-w-md space-y-1 shadow-2xl rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 p-2">
          <CardHeader className="text-center pb-2 pt-4">
            <CardTitle className="text-2xl font-bold">
              Create Employer Account
            </CardTitle>
            <CardDescription className="text-slate-500">
              Hire top talent and grow your company
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">

              {/* Native Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    disabled={isLoading}
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-xs">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label required htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    disabled={isLoading}
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-xs">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Inc."
                    disabled={isLoading}
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p className="text-destructive text-xs">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
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
                    <SelectTrigger
                      className={errors.industry ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
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
                  {errors.industry && (
                    <p className="text-destructive text-xs">
                      {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label required htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={
                        errors.password ? "border-destructive pr-10" : "pr-10"
                      }
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label required htmlFor="confirmPassword">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className={
                        errors.confirmPassword
                          ? "border-destructive pr-10"
                          : "pr-10"
                      }
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center w-full my-2 min-h-[65px]">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => {
                    setValue("captchaToken", token, { shouldValidate: true });
                    clearErrors("captchaToken");
                  }}
                  onError={() => {
                    setValue("captchaToken", "");
                  }}
                  options={{ theme: "light" }}
                />
                {errors.captchaToken && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.captchaToken.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register Company"}
              </Button>
            </form>

            <div className="mt-2 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="hover:text-primary underline underline-offset-4"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
