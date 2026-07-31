import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginInput } from "../lib/auth-validator";
import { authService } from "../services/auth.service";
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth.store";

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      useAuthStore.getState().setUser({
        _id: data.user._id,
        email: data.user.email,
        isVerified: data.user.isVerified,
      });
      queryClient.setQueryData(["auth-user"], data.user);

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      toast.success("Welcome back!", { 
        description: `Logged in as ${data.user.email}` 
      });
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Login failed: ", error);
      toast.error("Login Failed");
    },
  });
};