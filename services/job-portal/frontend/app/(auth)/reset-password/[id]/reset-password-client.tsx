"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/features/auth/validations/auth.schema";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getValidationErrorMessage } from "@/lib/validation-error";

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword(token);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset successfully! Please login with your new password.");
        router.push("/login");
      },
      onError: (error: any) => {
        if (error.message === "Validation failed") {
          const firstErrorMessage = getValidationErrorMessage(error);
          toast.error(firstErrorMessage);
          return;
        }
        toast.error(error.message || "Failed to reset password");
      },
    });
  };

  const isMutationLoading = resetPasswordMutation.isPending;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50/50">
      <Image
        src="/login-page-img.png"
        alt="reset-password-image"
        height={1000}
        width={1000}
        priority
        className="hidden h-full w-1/2 object-cover lg:block"
      />
      <div className="flex  h-full flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm space-y-1 shadow-2xl rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 p-2">
          <CardHeader className="text-center pb-2 pt-4">
            <CardTitle className="text-2xl font-bold">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isMutationLoading}
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

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isMutationLoading}
                    className={
                      errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
                    }
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

              {/* Submit Button */}
              <Button type="submit" className="w-full mt-2" disabled={isMutationLoading}>
                {isMutationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                {isMutationLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <div className="text-muted-foreground mt-6 text-center text-sm">
              <Link
                href="/login"
                className="text-primary font-medium underline-offset-4 hover:underline flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
