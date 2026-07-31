"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, ShieldCheck, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { verifyOtpSchema, type VerifyOtpInput } from "../lib/auth-validator";
import { useVerifyOtp } from "../hooks/use-register"; // Verify this path exists
import { authService } from "../services/auth.service";
import { toast } from "sonner"

export const VerifyOtpClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, otp: "" },
  });

  const otpValue = watch("otp");
  const { mutate: verifyOtp, isPending } = useVerifyOtp();

  // Redirect if no email is present in URL
  useEffect(() => {
    if (!email) {
      router.replace("/auth/register");
    }
  }, [email, router]);

  // Cooldown Timer Logic
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = (data: VerifyOtpInput) => {
    verifyOtp(data);
  };

  // const handleResend = async () => {
  //   if (resendCooldown > 0 || isResending || !email) return;
  //   setIsResending(true);
  //   try {
  //     await authService.resendOtp(email);
  //     toast.success("OTP Resent", {
  //       description: `Check ${email} for your new code.`,
  //     });
  //     setResendCooldown(60);
  //   } catch (err: any) {
  //     console.error("OTP Resend Error: ", err);
  //     toast.error("OTP Resend Error");
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="border-border/50 bg-card/50 w-full max-w-sm shadow-xl backdrop-blur-sm">
        <Card>
          <CardHeader className="space-y-3 text-center">
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <ShieldCheck className="text-primary h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Verify Email</CardTitle>
              <CardDescription>Enter the 6-digit code sent to:</CardDescription>
              <div className="bg-muted mx-auto flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium">
                <Mail className="h-3 w-3" /> {email}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-4">
            {/* Simplified InputOTP structure. 
                Using index 0-5 directly inside slots.
            */}
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setValue("otp", value)}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="bg-background/50 rounded-md border"
                />
                <InputOTPSlot
                  index={1}
                  className="bg-background/50 rounded-md border"
                />
                <InputOTPSlot
                  index={2}
                  className="bg-background/50 rounded-md border"
                />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={3}
                  className="bg-background/50 rounded-md border"
                />
                <InputOTPSlot
                  index={4}
                  className="bg-background/50 rounded-md border"
                />
                <InputOTPSlot
                  index={5}
                  className="bg-background/50 rounded-md border"
                />
              </InputOTPGroup>
            </InputOTP>

            {errors.otp && (
              <p className="text-destructive text-xs font-medium">
                {errors.otp.message}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isPending || otpValue.length < 6}
              className="w-full font-semibold transition-all hover:scale-[1.01]"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify Account"
              )}
            </Button>

            {/* <div className="text-muted-foreground text-center text-sm">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-primary font-medium hover:underline disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </button>
            </div> */}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default VerifyOtpClient;
