"use client";

import React, { useState, Suspense } from "react";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { isAxiosError } from "@/lib/api";
import { ApiResponse } from "@/features/auth/types/auth-response";
import { toast } from "sonner";
import { Lock, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const router = useRouter();

    const [password, setPassword] = useState("");
    const { mutate, isPending } = useResetPassword();
    const [isSuccess, setIsSuccess] = useState(false);

    // Real-time validation matching backend schema
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };
    const isValid = Object.values(checks).every(Boolean);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !email) {
            toast.error("Invalid or missing reset token.");
            return;
        }
        if (!isValid) {
            toast.error("Please meet all password requirements.");
            return;
        }

        mutate({ email, token, password }, {
            onSuccess: (res: ApiResponse<null>) => {
                toast.success(res?.message || "Password reset successfully!");
                setIsSuccess(true);
            },
            onError: (err) => {
                toast.error(isAxiosError(err) ? err.response?.data?.message : "Failed to reset password");
            }
        });
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5 text-center transition-all">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Password Reset!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                    Your password has been successfully reset. You can now use your new password to login.
                </p>
                <Link href="/login" className="w-full">
                    <Button fullWidth className="py-3.5 bg-[#111] dark:bg-white text-white dark:text-gray-900 hover:bg-black font-bold border-0 shadow-sm transition-all hover:-translate-y-0.5">
                        Continue to Login
                    </Button>
                </Link>
            </Card>
        );
    }

    if (!token || !email) {
        return (
            <Card className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5 text-center">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight mb-2">Invalid Link</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                    This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link href="/forgot-password" className="w-full">
                    <Button fullWidth variant="outline" className="py-3.5 font-bold">
                        Request New Link
                    </Button>
                </Link>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5 text-center transition-all relative">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Set New Password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">
                    Enter a strong password that you haven't used before.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5 text-left">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                    <div className="relative">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                        />
                    </div>
                    {/* Live password requirements */}
                    {password.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs">
                            {[
                                { pass: checks.length, label: "At least 8 characters" },
                                { pass: checks.uppercase, label: "One uppercase letter (A-Z)" },
                                { pass: checks.lowercase, label: "One lowercase letter (a-z)" },
                                { pass: checks.number, label: "One number (0-9)" },
                            ].map(({ pass, label }) => (
                                <li key={label} className={`flex items-center gap-1.5 font-medium transition-colors ${pass ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}>
                                    <span>{pass ? "✓" : "○"}</span>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isPending || !isValid}
                    fullWidth
                    className="py-3.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold border-0 shadow-[0_4px_15px_rgba(24,119,242,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(24,119,242,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </form>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex justify-center items-center py-10 w-full animate-in fade-in zoom-in duration-300 px-4">
            <Suspense fallback={
                <Card className="w-full max-w-md p-10 flex justify-center items-center">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
