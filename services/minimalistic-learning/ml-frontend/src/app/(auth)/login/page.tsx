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
    <div className="m-0 flex min-h-[calc(100dvh-64px)] w-full flex-col bg-white p-0 lg:h-[calc(100dvh-64px)] lg:flex-row dark:bg-[#0a0a0a]">
      {/* Left Full Height Split - Desktop Only */}
      <div className="relative hidden w-1/2 flex-1 items-center justify-center bg-white lg:flex dark:bg-gray-900">
        <Image
          src="/login-illustration.png"
          alt="Login Illustration"
          fill
          priority
          className="scale-105 object-cover"
        />
      </div>

      {/* Right Content Split */}
      <div className="custom-scrollbar relative flex w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-gray-50 p-6 sm:p-12 lg:w-1/2 dark:bg-[#0a0a0a]">
        <div className="z-10 flex w-full max-w-[420px] flex-col justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
