"use client";

import { useEffect } from "react";
import { useRouter, redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { GlobalRole } from "@/types";
import { CreateCouponForm } from "@/features/super-admin";

export default function CreateCouponPage() {
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === GlobalRole.SUPER_ADMIN;

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      redirect("/login");
    }
  }, [status, isAdmin]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <CreateCouponForm />;
}
