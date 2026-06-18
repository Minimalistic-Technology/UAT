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
            onError: (err) => {
                toast.error(isAxiosError(err) ? err.response?.data?.message : "Failed to send reset link");
            }
        });
    };

    return (
        <div className="flex justify-center items-center py-10 w-full animate-in fade-in zoom-in duration-300 px-4">
            <Card className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5">

                {isSuccess ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Check your email</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">
                            We've sent a password reset link to <br />
                            <span className="font-bold text-gray-900 dark:text-gray-200">{email}</span>
                        </p>
                        <Link href="/login" className="w-full">
                            <Button fullWidth className="py-3.5 bg-[#111] dark:bg-white text-white dark:text-gray-900 hover:text-white dark:hover:text-black hover:bg-black font-bold">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4">
                                <KeyRound size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Forgot Password</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5 text-left">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
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

                            <Button
                                type="submit"
                                disabled={isPending}
                                fullWidth
                                className="py-3.5 bg-[#111] dark:bg-white text-white dark:text-gray-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-0 shadow-sm font-bold"
                            >
                                {isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>

                            <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mt-6">
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
