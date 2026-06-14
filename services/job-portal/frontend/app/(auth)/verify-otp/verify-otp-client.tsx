"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRedirectAsPerRole } from "@/hooks/use-redirect";
import { useResendRegistrationOtp } from "@/features/auth/hooks/use-resend-otp";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);

  const { mutateAsync: resendOtp, isPending: isResending } = useResendRegistrationOtp();

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer]);

  // Redirect if no email is present
  useEffect(() => {
    if (!email) {
      toast.error("Invalid email provided. Please register again.");
      router.push("/register");
    }
  }, [email, router]);

  // Handle Role-Based Redirection after successful login
  useRedirectAsPerRole();

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      await resendOtp({ email });
      toast.success("OTP resent successfully.");
      setTimer(30);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "Failed to resend OTP.";
      toast.error(errorMessage);
    }
  };

  const onSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    if (!email) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      if (!result?.ok) {
        toast.error(result?.error || "Invalid OTP or session expired.");
        setIsLoading(false);
        return;
      }

      toast.success("Identity verified!");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Verify Your Email
          </CardTitle>
          <CardDescription>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Shadcn InputOTP Component */}
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={onSubmit}
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center text-sm">
            {timer > 0 ? (
              <p className="text-muted-foreground font-medium">
                Resend code in <span className="text-primary font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>
              </p>
            ) : (
              <p className="text-muted-foreground font-medium flex items-center justify-center gap-1">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary hover:underline font-bold disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend / Try again"}
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
