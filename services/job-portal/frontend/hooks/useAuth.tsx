import { useSession } from "next-auth/react";

export const useAuth = () => {
  const session = useSession();

  return {
    ...session,
    isAuthenticated: session.status === "authenticated",
    isUnauthenticated: session.status === "unauthenticated",
    isLoading: session.status === "loading",
    user: session.data?.user,
  };
};