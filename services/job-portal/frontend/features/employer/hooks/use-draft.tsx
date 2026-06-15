import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft,
} from "../services/draft.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useSaveDraft = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { id?: string; type: "job" | "internship"; formData: any }) => saveDraft(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["draft", variables.id] });
      }
      toast.success("Draft saved successfully!");
      router.push("/employer-dashboard/drafts");
    },
    onError: (error: any) => {
      console.error("Error saving draft:", error);
      const errorMsg = error?.response?.data?.message || "Failed to save draft. Please try again.";
      toast.error(errorMsg);
    },
  });
};

export const useGetDrafts = () => {
  return useQuery({
    queryKey: ["drafts"],
    queryFn: getDrafts,
  });
};

export const useGetDraftById = (draftId?: string) => {
  return useQuery({
    queryKey: ["draft", draftId],
    queryFn: () => getDraftById(draftId!),
    enabled: !!draftId, // Only run the query if draftId is provided
    gcTime: 0, // Prevent caching stale draft data across navigations
  });
};

export const useDeleteDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => deleteDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
    onError: (error: any) => {
      console.error("Error deleting draft:", error);
    },
  });
};
