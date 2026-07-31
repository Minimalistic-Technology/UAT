import LoginForm from "@/features/auth/components/login-form";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Log in to your Minimalistic Learning account to write articles and manage discussions.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-64px)] w-full bg-white dark:bg-[#0a0a0a]">
      {/* Left Half - Fixed on Desktop */}
      <div className="z-0 hidden bg-gray-900 lg:fixed lg:top-[64px] lg:bottom-0 lg:left-0 lg:block lg:w-1/2">
        <Image
          src="/login-illustration.png"
          alt="Login Illustration"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Right Content - Scrolls natively without double scrollbars */}
      <div className="z-10 flex min-h-[calc(100dvh-64px)] w-full flex-col items-center justify-center bg-gray-50 p-4 lg:ml-[50%] lg:w-1/2 lg:px-8 lg:py-2 dark:bg-[#0a0a0a]">
        <div className="flex w-full max-w-[420px] flex-col justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
