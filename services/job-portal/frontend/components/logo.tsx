"use client";

import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

const Logo = () => {
  const { data: session, status } = useSession();

  const redirectUrl = useMemo(() => {
    if (status === "loading") return "/";
    if (!session?.user) return "/";

    switch (session.user.role) {
      case "super_admin":
        return "/admin-dashboard";
      case "user":
        if (session?.user.isEmployee) return "/employer-dashboard";
        else return "/user-dashboard";
      default:
        return "/";
    }
  }, [session, status]);

  return (
    <Link
      href={redirectUrl}
      className="group flex items-center gap-2 transition-all"
    >
      <div className="bg-primary rounded-lg p-1.5">
        <BriefcaseBusiness
          className="text-primary-foreground size-6"
          strokeWidth={2.5}
        />
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Job<span className="text-primary">Portal</span>
      </span>
    </Link>
  );
};

export default Logo;
