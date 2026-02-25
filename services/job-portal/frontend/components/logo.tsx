"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Briefcase } from "lucide-react";

export const Logo = () => {
  const { data: session, status } = useSession();

  const redirectUrl = useMemo(() => {
    if (status === "loading") return "/";
    if (!session?.user) return "/";

    switch (session.user.role) {
      case "admin":
        return "/admin-dashboard";
      case "employer":
        return "/employer-dashboard";
      case "jobseeker":
        return "/user-dashboard";
      default:
        return "/";
    }
  }, [session, status]);

  if (status === "loading") {
    return <div className="h-8 w-32 animate-pulse bg-gray-200 rounded-md" />;
  }

  return (
    <div className="flex items-center">
      <Link 
        href={redirectUrl} 
        className="flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg p-1"
        aria-label="Go to Dashboard"
      >
        <Briefcase 
          className="h-8 w-8 text-primary-600" 
          aria-hidden="true" 
        />
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          Job<span className="text-primary-600">Portal</span>
        </span>
      </Link>
    </div>
  );
};

export default Logo;