"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// Individual Shadcn UI components
import { Turnstile } from "@marsidev/react-turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  registerUserSchema,
  RegisterUserInput,
} from "@/features/auth/validations/auth.schema";
import { useRegister } from "@/features/auth/hooks/use-register";
import Image from "next/image";
import { getValidationErrorMessage } from "@/lib/validation-error";

type RegisterFormValues = Omit<RegisterUserInput, "role">;

export default function RegisterClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }

    registerMutation.mutate(data as RegisterUserInput, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || error.message;
        toast.error(errorMessage || "Registration failed");
      },
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden h-full w-1/2 lg:block relative shrink-0">
        <Image
          src="/signup-page-img.png"
          alt="signup-image"
          fill
          priority
          className="object-cover object-right"
        />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <Card className="m-auto w-full max-w-md space-y-1 shadow-2xl rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 p-2">
          <CardHeader className="text-center pb-2 pt-4">
            <CardTitle className="text-2xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Max"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label required htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Robinson"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label required htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9897654566"
                    {...register("phone")}
                    className={errors.phone ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Security Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label required htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={
                        errors.password ? "border-destructive pr-10" : "pr-10"
                      }
                      disabled={isLoading}
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
                    <p className="text-destructive text-xs font-medium">
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
                      {...register("confirmPassword")}
                      className={
                        errors.confirmPassword
                          ? "border-destructive pr-10"
                          : "pr-10"
                      }
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    <p className="text-destructive text-xs font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Terms
                  </Link>
                </label>
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
                {isLoading ? "Please wait..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-2 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
