"use client";

import React, { useState } from "react";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { isAxiosError } from "@/lib/api";
import { toast } from "sonner";
import { Mail, ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiResponse } from "@/features/auth/types/auth-response";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate, isPending } = useForgotPassword();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    mutate(email, {
      onSuccess: (res: ApiResponse<null>) => {
        toast.success(res?.message || "Reset link sent!");
        setIsSuccess(true);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to send reset link",
        );
      },
    });
  };

  return (
    <div className="animate-in fade-in zoom-in flex w-full items-center justify-center px-4 py-10 duration-300">
      <Card className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 dark:border-white/5 dark:bg-[#0a0a0a] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        {isSuccess ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Mail size={32} />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              We've sent a password reset link to <br />
              <span className="font-bold text-gray-900 dark:text-gray-200">
                {email}
              </span>
            </p>
            <Link href="/login" className="w-full">
              <Button fullWidth>Back to Login</Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400">
                <KeyRound size={32} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Forgot Password
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPending} fullWidth>
                {isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
