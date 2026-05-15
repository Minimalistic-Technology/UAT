import LoginForm from "@/features/auth/components/login-form";
import Link from "next/link";
import { Home } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
      >
        <Home size={18} />
        Back to Home
      </Link>
      <LoginForm />
    </div>
  );
}
