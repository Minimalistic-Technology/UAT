import apiClient, { ApiSuccessResponse } from "@/lib/api-client"
import { useQuery } from "@tanstack/react-query"

export const useGetUserDetails = () => {
    const response = useQuery({
        queryKey: ["userDetails"],
        queryFn: async () => {
            const response = await apiClient.get<ApiSuccessResponse<any>>("/auth/me");
            return response.data;
        }
    })

    return response;
}