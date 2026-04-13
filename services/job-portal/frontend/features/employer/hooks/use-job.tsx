import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJobPost,
  getJobPostById,
  getMyJobPostings,
  GetMyJobPostingsResponse,
} from "../services/job.service";
import { ApiSuccessResponse } from "@/lib/api-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useGetMyJobPostings = () => {
  return useQuery<ApiSuccessResponse<GetMyJobPostingsResponse>>({
    queryKey: ["my-job-postings"],
    queryFn: getMyJobPostings,
  });
};

export const useCreateMyJobPosting = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (jobData: any) => createJobPost(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
      toast.success("Job posted successfully!");
      router.push("/employer-dashboard")
    },
    onError: (error: any) => {
      console.error("Error posting job:", error);
      const errorMsg = error?.response?.data?.message || "Failed to post job. Please try again.";
      toast.error(errorMsg);
    },
  });
};

export const useGetJobPostById = (jobId: string) => {
  return useQuery({
    queryKey: ["job-post", jobId],
    queryFn: () => getJobPostById(jobId),
    enabled: !!jobId, // Only run the query if jobId is provided
  });
}