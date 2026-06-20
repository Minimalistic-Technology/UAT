"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schema/auth-schema";
import { RegisterValues } from "../types/auth-type";
import { useRegister } from "../hooks/use-register";
import { useVerifyOTP } from "../hooks/use-verify-otp";
import Link from "next/link";
import { isAxiosError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";
import { ShieldCheck, Loader2, ArrowRight, Mail } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const RegisterForm = () => {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");

    // OTP Countdown Timer State
    const [timer, setTimer] = useState(120);

    React.useEffect(() => {
        if (!showOTP) return;
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
    }, [showOTP]);

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useRegister();
    const { mutate: verifyMutate, isPending: isVerifyPending } = useVerifyOTP();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterValues) => {
        registerMutate(data, {
            onSuccess: () => {
                toast.success("OTP sent to your email!");
                setUserEmail(data.email);
                setShowOTP(true);
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || err?.message || "Registration failed");
            }
        });
    };

    const onVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();
        if (otpValue.length !== 6) {
            toast.error("Please enter 6-digit OTP");
            return;
        }

        verifyMutate({ email: userEmail, otp: otpValue }, {
            onSuccess: () => {
                toast.success("Account verified! Welcome to Portal.");
                refreshUser();
                router.push("/dashboard");
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || err?.message || "Verification failed");
            }
        });
    };

    // ── OTP Screen (Unchanged Logic, Updated UI for Dark Mode) ───────────────────
    if (showOTP) {
        return (
            <div className="w-full mx-auto p-8 sm:p-10 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Verify Email</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-sm font-medium">
                        Enter the code sent to <br />
                        <span className="text-gray-900 dark:text-gray-200 font-bold">{userEmail}</span>
                    </p>
                </div>

                <form onSubmit={onVerifyOTP} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Verification Code</label>
                            <span className={`text-xs font-bold ${timer === 0 ? "text-red-500 animate-pulse" : "text-[#1877F2] flex items-center gap-1"}`}>
                                {timer > 0 ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                        Expires in {formatTimer(timer)}
                                    </>
                                ) : (
                                    "Code expired"
                                )}
                            </span>
                        </div>
                        <input
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            type="text"
                            maxLength={6}
                            className="w-full py-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl text-2xl font-bold tracking-[1em] text-center text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifyPending || otpValue.length !== 6 || timer === 0}
                        className="group w-full py-3.5 bg-[#1877F2] hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isVerifyPending ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowOTP(false)}
                        className="w-full text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        Edit Registration Info
                    </button>
                </form>
            </div>
        );
    }

    // ── Register Form (New Minimalist Aesthetic) ────────────────────────────────
    return (
        <Card className="w-full mx-auto animate-in fade-in zoom-in duration-300 p-5 sm:p-6">
            <div className="flex flex-col items-center mb-5">
                <h2 className="text-[24px] sm:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                    Create Account
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Join our exclusive community today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                        <Input
                            {...register("firstName")}
                            type="text"
                            placeholder="John"
                            error={!!errors.firstName}
                        />
                        {errors.firstName && <p className="text-xs font-semibold text-red-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                        <Input
                            {...register("lastName")}
                            type="text"
                            placeholder="Doe"
                            error={!!errors.lastName}
                        />
                        {errors.lastName && <p className="text-xs font-semibold text-red-500 mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Number</label>
                    <div className="relative">
                        <Input
                            {...register("contactNumber")}
                            type="tel"
                            placeholder="+91 9876543210"
                            error={!!errors.contactNumber}
                        />
                    </div>
                    {errors.contactNumber && <p className="text-xs font-semibold text-red-500 mt-1">{errors.contactNumber.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative">
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            error={!!errors.email}
                        />
                    </div>
                    {errors.email && <p className="text-xs font-semibold text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                        <Input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            error={!!errors.password}
                        />
                        {errors.password && <p className="text-xs font-semibold text-red-500 mt-1">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm</label>
                        <Input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            error={!!errors.confirmPassword}
                        />
                        {errors.confirmPassword && <p className="text-xs font-semibold text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col items-center pt-1">
                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADn3TrbiqdzPMzAM"}
                        onSuccess={(token) => setValue('turnstileToken', token || "")}
                    />
                    {errors.turnstileToken && <p className="text-xs font-semibold text-red-500 mt-1">{errors.turnstileToken.message}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={isRegisterPending}
                    fullWidth
                    className="mt-1"
                >
                    {isRegisterPending ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Mail size={16} />
                            Sign Up with Email
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Already a member?{" "}
                    <Link href="/login" className="text-gray-900 dark:text-white font-bold hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </Card>
    );
};

export default RegisterForm;
