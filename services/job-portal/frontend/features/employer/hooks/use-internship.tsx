import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInternshipPost } from "../services/internship.service";

export const useCreateMyInternshipPosting = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (internshipData: any) => createInternshipPost(internshipData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-internship-postings"] });
      toast.success("Internship posted successfully!");
      router.push("/employer-dashboard");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Failed to post internship.";
      toast.error(errorMsg);
    },
  });
};
