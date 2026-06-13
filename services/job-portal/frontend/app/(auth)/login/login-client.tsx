"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Loader2, Eye, EyeOff } from "lucide-react";
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
  loginSchema,
  LoginUserInput,
} from "@/features/auth/validations/auth.schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRedirectAsPerRole } from "@/hooks/use-redirect";
import { useState } from "react";
import Image from "next/image";
import { getValidationErrorMessage } from "@/lib/validation-error";

export default function LoginClient() {
  const [showPassword, setShowPassword] = useState(false);

  // 1. Centralized redirection logic
  useRedirectAsPerRole();

  const { data: session, status } = useSession();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginUserInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Login successful!");
      },
      onError: (error: any) => {
        if (error.message === "Validation failed") {
          const firstErrorMessage = getValidationErrorMessage(error);
          toast.error(firstErrorMessage);
          return;
        }
        toast.error(error.message || "Login failed");
      },
    });
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  const isMutationLoading = loginMutation.isPending;
  const isAuthChecking = status === "loading";
  const isLoading = isMutationLoading || isAuthChecking;

  return (
    <div className="flex h-[calc(100dvh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden h-full w-1/2 lg:block relative shrink-0">
        <Image
          src="/login-page-img.png"
          alt="login-image"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-cover"
        />
      </div>
      <div className="flex h-full flex-1 flex-col overflow-y-auto justify-center px-4 py-6 sm:px-6 lg:px-8">
        <Card className="m-auto w-full max-w-sm space-y-3 shadow-2xl rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 p-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label required htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label required htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-xs underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                    className={
                      errors.password ? "border-destructive pr-10" : "pr-10"
                    }
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



              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isMutationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {isMutationLoading ? "Signing in..." : "Sign In with Email"}
              </Button>

              {/* Divider (Commented for now)
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background text-muted-foreground px-2">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Button 
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isAuthChecking ? (
                  <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                  <IconChrome className="mr-2 size-5" />
                )}
                Google
              </Button>
              */}
            </form>

            <div className="text-muted-foreground mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const IconChrome = ({
  width = 24,
  height = 20,
  stroke = "currentColor",
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M12 9h8.4" />
      <path d="M14.598 13.5l-4.2 7.275" />
      <path d="M9.402 13.5l-4.2 -7.275" />
    </svg>
  );
};
