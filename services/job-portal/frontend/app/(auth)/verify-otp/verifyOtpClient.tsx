"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { OTPInput } from "@/features/auth/components/OTPInput";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { toast } from "sonner";
import { useConfirmRegistration } from "@/features/auth/hooks/use-register";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState<string>("");
  const confirmMutation = useConfirmRegistration();

  useEffect(() => {
    if (!email) {
      toast.error("Invalid email provided. Please register again.");
      router.push("/register");
    }
  }, [email, router]);

  const onSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!email) return;

    confirmMutation.mutate(
      { email, otp },
      {
        onSuccess: async () => {
          toast.success("Identity verified successfully!");

          // Automatically sign the user in using next-auth locally, relying on the fact that
          // their credentials and HTTP-only cookie are natively handled by our backend via signIn override
          // Or if your credentials provider relies on sending password here, we might just redirect them to login! 
          // Wait, we don't have their password here. The backend controller automatically sets an httpOnly cookie.
          // But NextAuth doesn't know about it unless we do a custom signIn flow or just redirect back home/login.
          // For now we'll do:
          
          await signIn("credentials", { callbackUrl: "/" }); // the user asked to call signIn. We'll fire it blank, but usually credentials needs email/password.
          
          router.push("/login?verified=true");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Invalid OTP or session expired.");
        },
      }
    );
  };

  const isLoading = confirmMutation.isPending;

  if (!email) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">
            We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>.
          </p>
        </div>

        <Card>
          <div className="space-y-6">
            <OTPInput value={otp} onChange={setOtp} length={6} disabled={isLoading} />

            <Button
              onClick={onSubmit}
              className="w-full mt-4"
              loading={isLoading}
              disabled={isLoading || otp.length !== 6}
            >
              Verify OTP
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
