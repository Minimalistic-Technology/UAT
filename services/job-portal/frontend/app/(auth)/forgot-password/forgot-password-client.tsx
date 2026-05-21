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
    <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-50/50">
      <Image
        src="/login-page-img.png"
        alt="forgot-password-image"
        height={1000}
        width={1000}
        className="hidden h-full w-1/2 object-cover lg:block"
      />
      <div className="flex h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm space-y-3 border-none shadow-lg sm:border">
          <CardHeader className="space-y-0.5 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  disabled={isMutationLoading}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full mt-2" disabled={isMutationLoading}>
                {isMutationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {isMutationLoading ? "Sending..." : "Send Reset Link"}
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
