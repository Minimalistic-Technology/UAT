"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Modal } from "@/components/ui/Modal";

const RegisterForm = () => {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [showOTP, setShowOTP] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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
        control,
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
                    <Controller
                        name="contactNumber"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                value={field.value}
                                onChange={field.onChange}
                                error={!!errors.contactNumber}
                            />
                        )}
                    />
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

                <div className="flex items-start gap-3 mt-4 mb-2">
                    <div className="pt-0.5">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            {...register("acceptTerms")}
                            className="w-4 h-4 rounded border-theme-accent/20 text-theme-action focus:ring-theme-action/20 bg-theme-element-sec"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="acceptTerms" className="text-sm text-foreground/70">
                            I agree to the <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-theme-action font-bold hover:underline">Terms and Conditions</button>
                        </label>
                        {errors.acceptTerms && <p className="text-xs font-semibold text-red-500 mt-1">{errors.acceptTerms.message}</p>}
                    </div>
                </div>

                <div className="flex flex-col items-stretch w-full pt-1 [&>div]:w-full [&>div>iframe]:!w-full">
                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADn3TrbiqdzPMzAM"}
                        onSuccess={(token) => setValue('turnstileToken', token || "")}
                        options={{ size: "flexible" }}
                        style={{ width: "100%" }}
                    />
                    {errors.turnstileToken && <p className="text-xs font-semibold text-red-500 mt-1 text-center">{errors.turnstileToken.message}</p>}
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

            <Modal
                isOpen={isTermsModalOpen}
                onClose={() => setIsTermsModalOpen(false)}
                title="Terms and Conditions"
            >
                <div className="prose prose-sm dark:prose-invert">
                    <p className="font-bold mb-4">Last Updated: June 20, 2026</p>
                    <p className="mb-6">Website/Platform: <a href="https://minimalistic-learning.onrender.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-theme-action hover:underline">https://minimalistic-learning.onrender.com/</a></p>

                    <h3 className="font-black text-foreground mt-6 mb-2">1. Acceptance of Terms & Global Compliance</h3>
                    <p><strong>Binding Agreement:</strong> By accessing, signing up, or utilizing this website, you explicitly agree to comply with and be bound by these Terms and Conditions. If you disagree with any part, you must cease using our services immediately.</p>
                    <p><strong>Regulatory Compliance:</strong> This platform operates under global privacy framework guidelines, including the GDPR (General Data Protection Regulation) for UK/EU users, and the Digital Personal Data Protection (DPDP) Act / Information Technology Act for Indian users.</p>

                    <h3 className="font-black text-foreground mt-6 mb-2">2. User Accounts & Registration</h3>
                    <p><strong>Eligibility:</strong> Users must be at least 13 years of age (or 16 years within designated EU/UK jurisdictions) to establish an authorized account.</p>
                    <p><strong>Global Authentication:</strong> To serve a global audience, the registration process requires a valid international contact number accompanied by the respective country code.</p>
                    <p><strong>Account Security:</strong> Users maintain sole responsibility for safeguarding their login credentials. Any unauthorized activity under your account must be reported immediately.</p>

                    <h3 className="font-black text-foreground mt-6 mb-2">3. Data Privacy, Storage & User Rights</h3>
                    <p><strong>Data Processing:</strong> We securely collect minimal required identifiers (Username, Email Address, Contact Number, and IP Address) exclusively for operations and account maintenance.</p>
                    <p><strong>Data Protection & Encryption:</strong> All captured data is transmitted and stored securely using industrial-grade encryption standards. We do not sell raw user databases.</p>
                    <p><strong>Global Privacy Rights:</strong> Users retain absolute rights regarding data access, rectification, portability, and the Right to Erasure (Right to be Forgotten), allowing them to request permanent deletion of their account records at any time.</p>

                    <h3 className="font-black text-foreground mt-6 mb-2">4. Content Policy & Platform Integrity</h3>
                    <p><strong>Media Standards:</strong> Users managing or posting blogs are required to display or upload high-definition (HD) media. Uploading copyrighted, defamatory, or unlawful material is strictly forbidden.</p>
                    <p><strong>System Security:</strong> Any attempt to compromise platform integrity via malicious code injection, script execution, or Cross-Site Scripting (XSS) testing/attacks on any input vector is an absolute violation and will result in immediate termination.</p>

                    <h3 className="font-black text-foreground mt-6 mb-2">5. Disclaimer of Warranties & Analytics</h3>
                    <p><strong>Real-Time Data Accuracy:</strong> All statistical metrics, dashboard analytics, and platform views are extracted and populated in real-time. While we strive for system precision, we are not liable for temporary data-sync or hosting propagation delays.</p>
                    <p><strong>Limitation of Liability:</strong> The services are provided on an "as-is" and "as-available" basis without warranties of any kind.</p>

                    <h3 className="font-black text-foreground mt-6 mb-2">6. Dispute Resolution & Official Support</h3>
                    <p><strong>Governing Jurisdiction:</strong> These terms shall be governed by applicable international cyber laws and local statutory acts, without giving effect to conflict of law principles.</p>
                    <p><strong>Corporate Support Desk:</strong> For general compliance inquiries, technical reports, or data removal requests, users can reach the administration directly through our formalized helpline:</p>
                    <p><strong>Corporate Support Email:</strong> <a href="mailto:Minimalisticlearning2024@gmail.com" className="font-bold text-theme-action hover:underline">Minimalisticlearning2024@gmail.com</a></p>
                </div>
            </Modal>
        </Card>
    );
};

export default RegisterForm;
