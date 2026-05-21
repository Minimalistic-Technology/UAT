import LoginForm from "@/features/auth/components/login-form";
import Link from "next/link";
import { Home } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">

      {/* Left Full Height Split - Desktop Only */}
      <div className="hidden lg:flex w-[45%] relative bg-[#f1f5f9] dark:bg-[#111] overflow-hidden flex-col justify-center border-r border-gray-200 dark:border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-[80%] bg-gradient-to-b from-blue-100 to-transparent dark:from-blue-900/20 opacity-50 rounded-bl-[100%]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-indigo-100 to-transparent dark:from-indigo-900/10 opacity-50 rounded-tr-[100%]"></div>
        </div>

        <div className="z-10 p-16 flex flex-col items-center justify-center h-full">
          <div className="relative w-full max-w-md aspect-[4/3] mb-8 bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-6 flex flex-col justify-center">
            {/* Abstract UI representation of the reference graphic */}
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-900 rounded"></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 rounded"></div>
              <div className="h-2 w-5/6 bg-gray-100 dark:bg-gray-900 rounded"></div>
              <div className="h-2 w-4/6 bg-gray-100 dark:bg-gray-900 rounded"></div>
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <div className="w-16 h-12 bg-blue-50 dark:bg-neutral-900 rounded-lg"></div>
              <div className="w-16 h-12 bg-indigo-50 dark:bg-neutral-900 rounded-lg"></div>
              <div className="w-16 h-12 bg-purple-50 dark:bg-neutral-900 rounded-lg"></div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Your Next Big Opportunity
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Explore thousands of jobs, build your career and achieve your biggest personal goals.
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Split */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <Link
          href="/"
          className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors bg-white dark:bg-[#111] px-5 py-2.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm"
        >
          <Home size={16} />
          Back to Home
        </Link>

        <div className="w-full max-w-md mt-16 sm:mt-0">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
