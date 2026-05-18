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

const RegisterForm = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const { mutate: registerMutate, isPending: isRegisterPending, error: registerError } = useRegister();
  const { mutate: verifyMutate, isPending: isVerifyPending } = useVerifyOTP();

  const {
    register,
    handleSubmit,
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

  if (showOTP) {
    return (
      <div className="max-w-md w-full mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-gray-50 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Verify Email</h2>
          <p className="text-gray-500 mt-2 text-center font-medium">
            Enter the code sent to <br />
            <span className="text-gray-900 font-bold">{userEmail}</span>
          </p>
        </div>

        <form onSubmit={onVerifyOTP} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Verification Code</label>
            <input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="text"
              maxLength={6}
              className="w-full py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-black tracking-[1em] text-center text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isVerifyPending || otpValue.length !== 6}
            className="group w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isVerifyPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowOTP(false)}
            className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Edit Registration Info
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-gray-50">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4">
          <UserPlus size={32} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create <span className="text-blue-600">Account</span></h2>
        <p className="text-gray-400 mt-1 font-medium">Join our exclusive community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">First Name</label>
            <input
              {...register("firstName")}
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="John"
            />
            {errors.firstName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Last Name</label>
            <input
              {...register("lastName")}
              type="text"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Contact Number</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              {...register("contactNumber")}
              type="tel"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="+91..."
            />
          </div>
          {errors.contactNumber && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.contactNumber.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              {...register("email")}
              type="email"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>
          {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Confirm</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider pl-1 mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isRegisterPending}
          className="group w-full py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/10 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isRegisterPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-50">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          Already a member?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 ml-1">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
