"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight, Phone, MessageSquare, Key, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Turnstile from "../_components/Turnstile";
import api from "@/lib/api";

const SignupForm = () => {
    const { checkUser } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const [step, setStep] = useState<"details" | "otp">("details");

    // Details State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");

    // Onboarding Mode Settings State
    const [onboardingMode, setOnboardingMode] = useState<"open" | "closed" | "invite_only" | "admin_approval">("open");
    const [closedMessage, setClosedMessage] = useState("");
    const [isSignupAllowed, setIsSignupAllowed] = useState(true);
    const [checkingSettings, setCheckingSettings] = useState(true);

    // OTP State
    const [otp, setOtp] = useState("");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchOnboardingConfig = async () => {
            try {
                const { data } = await api.get("/settings");
                if (data?.onboarding) {
                    setOnboardingMode(data.onboarding.mode || "open");
                    setClosedMessage(data.onboarding.closedMessage || "New user onboarding is currently restricted by administrator.");
                    if (data.onboarding.mode === "closed") {
                        setIsSignupAllowed(false);
                    }
                }
            } catch (err) {
                console.error("Failed to load onboarding config", err);
            } finally {
                setCheckingSettings(false);
            }
        };
        fetchOnboardingConfig();
    }, []);

    const handleTurnstileVerify = React.useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    const handleTurnstileExpire = React.useCallback(() => {
        setTurnstileToken(null);
    }, []);

    const handleTurnstileError = React.useCallback(() => {
        setTurnstileToken(null);
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (onboardingMode === "closed" || !isSignupAllowed) {
            showToast(closedMessage || "Public registration is currently disabled.", "error");
            return;
        }

        if (onboardingMode === "invite_only" && !inviteCode.trim()) {
            showToast("Invitation Code is required to register.", "error");
            return;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        if (!turnstileToken) {
            showToast("Please complete the Cloudflare Turnstile verification.", "error");
            return;
        }

        setIsLoading(true);

        const identifier = email || phone;
        if (!identifier) {
            showToast("Please provide either email or phone number", "error");
            setIsLoading(false);
            return;
        }

        try {
            // First check if user exists
            const resCheck = await api.post('/auth/check-user', { identifier });
            if (resCheck.data.exists) {
                showToast("Account already exists. Please login.", "error");
                router.push('/login');
                return;
            }

            if (!resCheck.data.signupAllowed) {
                showToast(resCheck.data.closedMessage || "Public registration is currently disabled by administrator.", "error");
                setIsSignupAllowed(false);
                return;
            }

            // Send OTP
            if (resCheck.data.otpRequired !== false) {
                await api.post('/auth/send-otp', { identifier, recaptchaToken: turnstileToken, turnstileToken });
                showToast(`Verification code sent to ${identifier}`, "success");
                setStep("otp");
            } else {
                // If OTP disabled globally
                setStep("otp");
            }
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to process request.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                firstName,
                lastName,
                email,
                phone,
                password,
                inviteCode,
                otp,
                role: 'user',
                accountType: 'individual'
            };

            const resReg = await api.post('/auth/register', payload);

            if (resReg.data?.pendingApproval) {
                showToast(resReg.data.msg || "Account registration submitted! Waiting for Admin Approval.", "info");
                router.push('/login');
                return;
            }

            // Auto Login directly after registration
            await api.post('/auth/login', {
                email: email || phone,
                password: password
            });

            // Sync State
            await checkUser();

            showToast("Account Created Successfully!", "success");

            // Redirect
            router.push('/');
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Registration failed.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex bg-white dark:bg-slate-900">
            {/* Left Side: Image Showcase */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12 order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 to-slate-900 z-10" />
                <Image
                    src="/auth_signup_bg.png"
                    alt="DDTEC Signup Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />

                {/* Glassmorphism Text Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-20 backdrop-blur-md bg-white/10 dark:bg-black/20 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md text-center"
                >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-emerald-500/30">
                        <Lock className="text-emerald-400 size-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Secure & Reliable</h3>
                    <p className="text-slate-200 leading-relaxed">
                        Join DDTEC to request top-class IT accessories, manage your deliveries, and track hardware lifecycles in an incredibly secure environment.
                    </p>
                </motion.div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden order-1 lg:order-2">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <Link href="/">
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent mb-6 inline-block">
                                DDTEC
                            </h2>
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {step === 'details' ? "Create an Account" : "Secure Verification"}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {step === 'details' ? "Fill in your details to get started with DDTEC." : "Enter the OTP sent to your contact and verify."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'details' && (
                            <motion.form
                                key="details-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendOtp}
                                className="space-y-4"
                            >
                                {onboardingMode === 'closed' || !isSignupAllowed ? (
                                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 space-y-2">
                                        <div className="flex items-center gap-2 font-bold text-sm">
                                            <ShieldAlert className="size-5 text-rose-600" />
                                            <span>Registration Paused</span>
                                        </div>
                                        <p className="text-xs text-rose-600 dark:text-rose-400">
                                            {closedMessage || "New user registrations are currently restricted by administrator."}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {onboardingMode === 'invite_only' && (
                                            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                                                <div className="flex items-center gap-2 font-bold text-xs text-teal-800 dark:text-teal-300">
                                                    <Key className="size-4 text-teal-600" />
                                                    <span>Invite-Only Registration Enabled</span>
                                                </div>
                                                <p className="text-xs text-teal-700 dark:text-teal-400">
                                                    An Invitation Code provided by administrator is required to create an account.
                                                </p>
                                                <div className="relative pt-1">
                                                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 size-4" />
                                                    <input
                                                        required
                                                        type="text"
                                                        value={inviteCode}
                                                        onChange={(e) => setInviteCode(e.target.value)}
                                                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="Enter Secret Invitation Code"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {onboardingMode === 'admin_approval' && (
                                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                                                <Clock className="size-4 text-amber-600 shrink-0" />
                                                <span>Note: New accounts require manual Admin Approval before logging in.</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address (Optional if phone provided)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone Number (Optional if email provided)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                                            className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                            placeholder="e.g. 1234567890"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                            <input
                                                required
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-2 mb-2 pt-4">
                                    <Turnstile
                                        onVerify={handleTurnstileVerify}
                                        onExpire={handleTurnstileExpire}
                                        onError={handleTurnstileError}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin size-5" /> : <>Continue to Verification <ArrowRight className="size-4" /></>}
                                </button>

                                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-teal-600 font-bold hover:underline">
                                        Sign In
                                    </Link>
                                </p>
                            </motion.form>
                        )}

                        {step === 'otp' && (
                            <motion.form
                                key="otp-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCompleteSignup}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification Code (OTP)</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                        <input
                                            required
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-xl tracking-widest text-center font-bold"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                                        Code sent to {email || phone}
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin size-5" /> : "Complete Signup"}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

const Signup = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <Loader2 className="animate-spin size-10 text-teal-600" />
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
};

export default Signup;
