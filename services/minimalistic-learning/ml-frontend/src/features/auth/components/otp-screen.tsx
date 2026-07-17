"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";

interface OtpScreenProps {
    userEmail: string;
    isVerifyPending: boolean;
    isResendPending: boolean;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onCancel: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
    userEmail,
    isVerifyPending,
    isResendPending,
    onVerify,
    onResend,
    onCancel,
}) => {
    const [otpValue, setOtpValue] = useState("");
    const [timer, setTimer] = useState(120);

    useEffect(() => {
        setTimer(120);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otpValue.length === 6) {
            onVerify(otpValue);
        }
    };

    return (
        <div className="animate-in fade-in zoom-in mx-auto w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] duration-300 sm:p-10 dark:border-white/5 dark:bg-[#0a0a0a] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="mb-8 flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Verify Email
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Enter the code sent to <br />
                    <span className="font-bold text-gray-900 dark:text-gray-200">
                        {userEmail}
                    </span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Verification Code
                        </label>
                        <div
                            className={`text-xs font-bold ${timer === 0 ? "text-red-500" : "flex items-center gap-1 text-[#1877F2]"}`}
                        >
                            {timer > 0 ? (
                                <>
                                    <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-blue-500" />
                                    Expires in {formatTimer(timer)}
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onResend}
                                    disabled={isResendPending}
                                    className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isResendPending ? (
                                        <>
                                            <Loader2 className="animate-spin" size={12} />{" "}
                                            Resending...
                                        </>
                                    ) : (
                                        "Resend OTP"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <input
                        value={otpValue}
                        onChange={(e) =>
                            setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        type="text"
                        maxLength={6}
                        className="w-full rounded-xl border border-gray-200 bg-white py-4 text-center text-2xl font-bold tracking-[1em] text-gray-900 transition-all outline-none placeholder:text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-[#111] dark:text-white dark:placeholder:text-gray-700 dark:focus:border-blue-500"
                        placeholder="000000"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isVerifyPending || otpValue.length !== 6 || timer === 0}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1877F2] py-3.5 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isVerifyPending ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            Create Account
                            <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full text-sm font-semibold text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                >
                    Edit Registration Info
                </button>
            </form>
        </div>
    );
};
