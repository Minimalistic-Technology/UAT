import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createJob, CreateJobPayload } from "../services/job.service";

export const useCreateJob = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => createJob(payload),
    onSuccess: () => {
      toast.success("Job posted successfully!");
      router.push("/employer/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to post job. Please try again."
      );
    },
  });

  return {
    createJob: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};
