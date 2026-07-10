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
import { TermsModal } from "./terms-modal";
import { OtpScreen } from "./otp-screen";

const RegisterForm = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const {
    mutate: registerMutate,
    isPending: isRegisterPending,
    error: registerError,
  } = useRegister();
  const { mutate: verifyMutate, isPending: isVerifyPending } = useVerifyOTP();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const turnstileToken = watch("turnstileToken");

  const onSubmit = (data: RegisterValues) => {
    registerMutate(data, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        setUserEmail(data.email);
        setShowOTP(true);
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || err?.message || "Registration failed",
        );
      },
    });
  };

  const onVerifyOTP = (otpValue: string) => {
    verifyMutate(
      { email: userEmail, otp: otpValue },
      {
        onSuccess: () => {
          toast.success("Account verified! Welcome to Portal.");
          refreshUser();
          router.push("/dashboard");
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || err?.message || "Verification failed",
          );
        },
      },
    );
  };

  // ── OTP Screen ───────────────────────────────────────────────────────────
  if (showOTP) {
    return (
      <OtpScreen
        userEmail={userEmail}
        isVerifyPending={isVerifyPending}
        isResendPending={isRegisterPending}
        onVerify={onVerifyOTP}
        onResend={() => onSubmit(getValues())}
        onCancel={() => setShowOTP(false)}
      />
    );
  }

  // ── Register Form (New Minimalist Aesthetic) ────────────────────────────────
  return (
    <Card className="animate-in fade-in zoom-in mx-auto w-full p-4 duration-300 sm:p-5 sm:px-6">
      <div className="mb-2 flex flex-col items-center">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-gray-500 sm:text-xs dark:text-gray-400">
          Join our exclusive community today
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-2 sm:space-y-3"
      >
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              First Name
            </label>
            <Input
              {...register("firstName")}
              type="text"
              placeholder="John"
              error={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Last Name
            </label>
            <Input
              {...register("lastName")}
              type="text"
              placeholder="Doe"
              error={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                error={!!errors.email}
              />
            </div>
            {errors.email && (
              <p className="mt-0.5 text-[10px] font-semibold text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              error={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Confirm
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2 pb-1">
          <div className="pt-0.5">
            <input
              type="checkbox"
              id="acceptTerms"
              {...register("acceptTerms")}
              className="border-theme-accent/20 text-theme-action focus:ring-theme-action/20 bg-theme-element-sec h-3.5 w-3.5 rounded"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="acceptTerms" className="text-foreground/70 text-xs">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-theme-action font-bold hover:underline"
              >
                Terms and Conditions
              </button>
            </label>
            {errors.acceptTerms && (
              <p className="mt-0.5 text-[10px] font-semibold text-red-500">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-1 mb-4 w-full overflow-hidden">
          <div className="w-full">
            <Turnstile
              siteKey={
                process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
                "0x4AAAAAADn3TrbiqdzPMzAM"
              }
              onSuccess={(token) => setValue("turnstileToken", token || "")}
              options={{ size: "flexible" }}
            />
          </div>
          {errors.turnstileToken && (
            <p className="mt-1 text-center text-xs font-semibold text-red-500">
              {errors.turnstileToken.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isRegisterPending || !turnstileToken}
          fullWidth
        >
          {isRegisterPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Mail size={16} />
              Sign Up
            </>
          )}
        </Button>
      </form>

      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Already a member?{" "}
          <Link
            href="/login"
            className="font-bold text-gray-900 hover:underline dark:text-white"
          >
            Login here
          </Link>
        </p>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </Card>
  );
};

export default RegisterForm;
