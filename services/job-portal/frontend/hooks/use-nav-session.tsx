import { GlobalRole } from "@/types/enums";
import { useSession } from "next-auth/react";

export function useNavSession() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const isEmployer = !!(
    isAuthenticated &&
    session?.user?.role === GlobalRole.USER &&
    session?.user?.isEmployee
  );

  const isJobSeeker = !!(
    isAuthenticated &&
    session?.user?.role === GlobalRole.USER &&
    !session?.user?.isEmployee
  );

  const isAdmin = !!(session?.user?.role === GlobalRole.SUPER_ADMIN);

  return {
    session,
    isLoading,
    isAuthenticated,
    isEmployer,
    isJobSeeker,
    isAdmin,
  };
}
