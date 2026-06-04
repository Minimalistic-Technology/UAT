import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInternshipPost, deleteInternshipPost, getMyInternshipPostings, getInternshipPostById, updateInternshipPostDetails } from "../services/internship.service";

export const useGetMyInternshipPostings = () => {
  return useQuery({
    queryKey: ["my-internship-postings"],
    queryFn: () => getMyInternshipPostings(),
  });
};

export const useUpdateMyInternshipPosting = (internshipId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (internshipData: any) =>
      updateInternshipPostDetails(internshipId, internshipData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-internship-postings"] });
      queryClient.invalidateQueries({ queryKey: ["internship-post", internshipId] });
      toast.success("Internship updated successfully!");
      router.push(`/employer-dashboard/internships/${internshipId}`);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message || "Failed to update internship.";
      toast.error(errorMsg);
    },
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

export const useGetInternshipPostById = (internshipId: string) => {
  return useQuery({
    queryKey: ["internship-post", internshipId],
    queryFn: () => getInternshipPostById(internshipId),
    enabled: !!internshipId,
  });
};
