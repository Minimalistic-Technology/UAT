"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { OTPInput } from "@/features/auth/components/OTPInput";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { toast } from "sonner";
import { useConfirmRegistration } from "@/features/auth/hooks/use-register";

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";

  const { data: session, status } = useSession();

  const [otp, setOtp] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!email) {
      toast.error("Invalid email provided. Please register again.");
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const { role, isEmployee } = session.user as any;

    if (role === "super_admin") {
      router.push("/admin-dashboard");
    } else if (role === "user") {
      if (isEmployee) {
        router.push("/employer/dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } else {
      router.push(callbackUrl);
    }

    router.refresh();
  }, [session, status, router, callbackUrl]);

  const onSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
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

      toast.success("Identity verified and successfully logged in!");
      // Natively relies on the useEffect layer to reroute the user dynamically based on the newly hydrated session!
    } catch (err) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

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
