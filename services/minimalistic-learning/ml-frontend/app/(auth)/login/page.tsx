import LoginForm from "@/features/auth/components/login-form";
import Link from "next/link";
import { Home } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-[#0a0a0a]">

      {/* Left Full Height Split - Desktop Only */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-50 dark:bg-gray-900 overflow-hidden items-center justify-center">
        <Image
          src="/login-illustration.png"
          alt="Login Illustration"
          fill
          priority
          className="object-cover opacity-90 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 pb-24 text-white">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
            Elevate Your <br />
            <span className="text-blue-400">Professional Journey</span>
          </h1>
          <p className="text-gray-200 font-medium text-lg max-w-md">
            Access your personalized dashboard to connect with top recruiters and manage your applications.
          </p>
        </div>
      </div>

      {/* Right Content Split */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Link
          href="/"
          className="absolute top-6 left-6 sm:top-10 sm:left-10 z-30 flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#111] px-5 py-2.5 rounded-full border border-gray-200 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-md"
        >
          <Home size={16} />
          Back to Home
        </Link>

        <div className="w-full max-w-[420px] z-10 flex flex-col justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

