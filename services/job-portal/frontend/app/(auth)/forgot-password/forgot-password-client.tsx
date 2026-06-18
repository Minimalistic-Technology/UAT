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
    <div className="flex h-[calc(100dvh-72px)] w-full overflow-hidden bg-slate-50/50">
      <div className="relative hidden h-full w-1/2 shrink-0 lg:block">
        <Image
          src="/login-page-img.png"
          alt="forgot-password-image"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
        <Card className="relative z-10 w-full max-w-md shrink-0 space-y-1 rounded-[24px] border border-slate-100 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="pt-4 pb-2 text-center">
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
                <Label
                  htmlFor="email"
                  className="ml-1 text-[13px] font-semibold text-slate-600"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={isMutationLoading}
                  className={`h-11 rounded-xl border-slate-200 bg-slate-50/50 px-4 text-sm focus-visible:ring-[#2563eb] ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-destructive mt-1 ml-1 text-[11px] font-bold tracking-wide">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="mt-4 h-11 w-full rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
                disabled={isMutationLoading}
              >
                {isMutationLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {isMutationLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-muted-foreground mt-6 mb-2 text-center text-sm">
              <Link
                href="/login"
                className="text-primary flex items-center justify-center font-medium underline-offset-4 hover:underline"
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
