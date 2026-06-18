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
import { UserPlus, Mail, Lock, Phone, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
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
      onError: (err) => {
        toast.error(isAxiosError(err) ? err.response?.data?.message : "Registration failed");
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
      onError: (err) => {
        toast.error(isAxiosError(err) ? err.response?.data?.message : "Verification failed");
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
    <Card className="w-full mx-auto animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-[28px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Join our exclusive community today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Captcha bypassed
        <div className="flex flex-col items-center pt-2">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Default to test key
            onChange={(token) => setValue('recaptchaToken', token || "")}
          />
          {errors.recaptchaToken && <p className="text-xs font-semibold text-red-500 mt-2">{errors.recaptchaToken.message}</p>}
        </div>
        */}

        <Button
          type="submit"
          disabled={isRegisterPending}
          fullWidth
          className="mt-2 py-3.5 bg-[#111] dark:bg-white hover:bg-black text-white dark:text-gray-900 hover:text-white border-0 shadow-sm"
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

      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100 dark:border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white dark:bg-[#0a0a0a] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        type="button"
        fullWidth
        className="py-3 border border-gray-200 dark:border-white/10"
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </Button>

      <div className="mt-8 text-center">
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
