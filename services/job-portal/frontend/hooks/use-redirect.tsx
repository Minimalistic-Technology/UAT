import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export const useRedirectAsPerRole = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams?.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const { role, isEmployee } = session.user;

    if (role === "super_admin") {
      router.push("/admin-dashboard");
    } else if (role === "user") {
      if (isEmployee) {
        router.push("/employer-dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } else {
      router.push(callbackUrl);
    }

    router.refresh();
  }, [session, status, router, callbackUrl]);
};
