import RegisterForm from "@/features/auth/components/register-form";
import Link from "next/link";
import { Home } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1877F2] transition-colors bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
      >
        <Home size={18} />
        Back to Home
      </Link>
      <RegisterForm />
    </div>
  );
}
