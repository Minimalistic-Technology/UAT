"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { useToast } from "../_context/ToastContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDynamicRoutes } from "../_context/RouteContext";

const LoginForm = () => {
    const { login } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const { isRouteActive } = useDynamicRoutes();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Lockout State
    const [lockCountdown, setLockCountdown] = useState<number | null>(null);

    // Timer Effect
    React.useEffect(() => {
        if (lockCountdown !== null && lockCountdown > 0) {
            const timer = setTimeout(() => setLockCountdown(lockCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (lockCountdown === 0) {
            setLockCountdown(null);
        }
    }, [lockCountdown]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (lockCountdown && lockCountdown > 0) {
            showToast("Account is currently locked.", "error");
            return;
        }

        setIsLoading(true);
        try {
            await login(identifier, password);
            showToast("Logged in successfully", "success");
            // AuthContext automatically redirects to dashboard/home based on role
        } catch (err: any) {
            const errorMsg = err.message || err.response?.data?.msg || "Invalid credentials";

            // Extract minutes from lockout message
            if (errorMsg.includes("temporarily locked")) {
                const match = errorMsg.match(/after (\d+) minute/);
                if (match && match[1]) {
                    const minutes = parseInt(match[1], 10);
                    setLockCountdown(minutes * 60);
                }
            }

            showToast(errorMsg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex bg-white dark:bg-slate-900">
            {/* Left Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
                {/* Subtle Background Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-10">
                        <Link href="/">
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent mb-6 inline-block">
                                DDTEC
                            </h2>
                        </Link>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Please enter your details to sign in to your account.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email or Phone</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                <input
                                    required
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-900 dark:text-white"
                                    placeholder="john@example.com or phone"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <button type="button" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition">Forgot Password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Lockout Warning UI */}
                            {lockCountdown !== null && lockCountdown > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex gap-3 text-red-600 dark:text-red-400 mt-4 overflow-hidden"
                                >
                                    <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold">Account Locked</p>
                                        <p>Too many failed attempts. Try again in <strong>{Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}</strong></p>
                                    </div>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || (lockCountdown !== null && lockCountdown > 0)}
                                className="w-full py-4 mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin size-5" /> : (
                                    (lockCountdown !== null && lockCountdown > 0) ? "Wait for timeout..." : "Sign In"
                                )}
                            </button>

                            {isRouteActive('/signup') && (
                                <p className="text-center text-sm text-slate-500 mt-6 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                    Don't have an account?{' '}
                                    <Link href="/signup" className="text-teal-600 font-bold hover:underline">
                                        Sign up freely
                                    </Link>
                                </p>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Right Side: Image Showcase */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-slate-900 z-10" />
                <Image
                    src="/auth_login_bg.png"
                    alt="DDTEC Login Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />

                {/* Glassmorphism Text Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-20 backdrop-blur-md bg-white/10 dark:bg-black/20 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md text-center"
                >
                    <h3 className="text-2xl font-bold text-white mb-4">Enterprise Grade IT Solutions</h3>
                    <p className="text-slate-200 leading-relaxed">
                        Securely manage your IT assets, request new hardware, and streamline your entire hardware lifecycle with the DDTEC smart platform.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

const Login = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <Loader2 className="animate-spin size-10 text-teal-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
};

export default Login;
