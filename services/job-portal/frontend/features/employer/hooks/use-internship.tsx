import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInternshipPost, deleteInternshipPost, getMyInternshipPostings } from "../services/internship.service";

export const useGetMyInternshipPostings = () => {
  return useQuery({
    queryKey: ["my-internship-postings"],
    queryFn: () => getMyInternshipPostings(),
  });
};

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

export const useDeleteMyInternshipPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (internshipId: string) => deleteInternshipPost(internshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-internship-postings"] });
      toast.success("Internship deleted successfully!");
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Failed to delete internship.";
      toast.error(errorMsg);
    },
  });
};
