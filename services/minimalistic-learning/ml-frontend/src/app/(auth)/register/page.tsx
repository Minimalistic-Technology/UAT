import RegisterForm from "@/features/auth/components/register-form";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Join Minimalistic Learning. Share your code stories, build tech documentations, and learn key design systems.",
};

export default function RegisterPage() {
  return (
    <div className="flex-1 w-full flex flex-col lg:flex-row bg-white dark:bg-[#0a0a0a] overflow-hidden m-0 p-0">

      {/* Left Full Height Split - Desktop Only */}
      <div className="hidden lg:flex w-1/2 relative bg-white dark:bg-gray-900 items-center justify-center flex-1">
        <Image
          src="/login-illustration.png"
          alt="Register Illustration"
          fill
          priority
          className="object-cover scale-105"
        />
      </div>

      {/* Right Content Split */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative flex-1 bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-[420px] z-10 flex flex-col justify-center">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
