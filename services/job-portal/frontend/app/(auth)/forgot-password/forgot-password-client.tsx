"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
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
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/features/auth/validations/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import Image from "next/image";
import { getValidationErrorMessage } from "@/lib/validation-error";

export default function ForgotPasswordClient() {
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password reset link sent to your email!");
      },
      onError: (error: any) => {
        if (error.message === "Validation failed") {
          const firstErrorMessage = getValidationErrorMessage(error);
          toast.error(firstErrorMessage);
          return;
        }
        toast.error(error.message || "Failed to send reset link");
      },
    });
  };

  const isMutationLoading = forgotPasswordMutation.isPending;

  return (
    <div className="flex h-[calc(100dvh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden h-full w-1/2 lg:block relative shrink-0">
        <Image
          src="/login-page-img.png"
          alt="forgot-password-image"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="flex h-full flex-1 flex-col items-center justify-center px-4 py-4 sm:px-6 lg:px-8 bg-slate-50 relative">
        <Card className="w-full max-w-md space-y-1 shadow-2xl rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0 p-2 relative z-10">
          <CardHeader className="text-center pb-2 pt-4">
            <CardTitle className="text-2xl font-bold">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-semibold text-slate-600 text-[13px] ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={isMutationLoading}
                  className={`h-11 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-[#2563eb] text-sm px-4 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-destructive text-[11px] font-bold tracking-wide mt-1 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-11 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-[15px] shadow-md shadow-blue-500/20 mt-4 transition-all" disabled={isMutationLoading}>
                {isMutationLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {isMutationLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-muted-foreground mb-2 mt-6 text-center text-sm">
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
