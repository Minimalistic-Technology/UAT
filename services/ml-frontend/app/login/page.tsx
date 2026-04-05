import LoginForm from "@/features/auth/components/login-form";
import Link from "next/link";
import { Home } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black/95 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1877F2] transition-colors bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm"
      >
        <Home size={18} />
        Back to Home
      </Link>
      <LoginForm />
    </div>
  );
}
