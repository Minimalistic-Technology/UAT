import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJobPost,
  getJobPostById,
  getMyJobPostings,
  deleteJobPost,
  GetMyJobPostingsResponse,
  updateJobPostDetails,
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
      router.push("/employer-dashboard");
    },
    onError: (error: any) => {
      console.error("Error posting job:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Failed to post job. Please try again.";
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
};

export const useDeleteMyJobPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJobPost(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
      toast.success("Job deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting job:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Failed to delete job. Please try again.";
      toast.error(errorMsg);
    },
  });
};

export const useUpdateMyJobPosting = (jobId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (jobData: any) => updateJobPostDetails(jobId, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-job-postings"] });
      queryClient.invalidateQueries({ queryKey: ["job-post", jobId] });
      toast.success("Job updated successfully!");
      router.push(`/employer-dashboard/jobs/${jobId}`);
    },
    onError: (error: any) => {
      console.error("Error updating job:", error);
      const errorMsg =
        error?.response?.data?.message ||
        "Failed to update job. Please try again.";
      toast.error(errorMsg);
    },
  });
};
