import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth-service";

export const useResetPassword = () => {
    return useMutation({
        mutationFn: authService.resetPassword,
    });
};
