import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      useAuthStore.getState().logout();
      queryClient.clear();
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }

      toast.success("Logged out successfully");
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      console.error("Logout failed: ", error);
      toast.error("Logout Failed");
    },
  });
};
