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
    <div className="flex h-[calc(100vh-72px)] w-full bg-slate-50/50 overflow-hidden">
      <div className="hidden h-full w-1/2 lg:block relative shrink-0">
        <Image
          src="/login-page-img.png"
          alt="forgot-password-image"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 relative">
        <Card className="w-full max-w-[400px] border-0 sm:border shadow-2xl sm:border-slate-100 rounded-[24px] overflow-hidden bg-white/70 backdrop-blur-xl supports-backdrop-filter:bg-white/50 relative z-10 p-2 sm:p-4">
          <CardHeader className="space-y-1.5 text-center pb-8 pt-6">
            <CardTitle className="text-[1.6rem] font-bold tracking-tight text-slate-800">
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
