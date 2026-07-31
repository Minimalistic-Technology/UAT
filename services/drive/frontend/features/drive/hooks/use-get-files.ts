import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchDriveFiles, sendCSVThroughMail } from "../services/drive.service";
import { SendCSVParams } from "../types";
import { toast } from "sonner";

const DEFAULT_FOLDER_ID = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || "18Fw_iggGBRbsqVA536GuqRF9c-sXlM0l";

export const useGetAllDriveFiles = (folderId: string = DEFAULT_FOLDER_ID) => {
  return useQuery({
    queryKey: ["drive-files", folderId],
    // The query function receives the signal from TanStack Query automatically
    queryFn: ({ signal }) => fetchDriveFiles(folderId, signal),
    retry: 2,                 // Retry twice before showing final error
    refetchOnWindowFocus: false,
    enabled: !!folderId,
  });
};

export const useSendCSVFile = () => {
  return useMutation(
    {
      mutationFn: (variables: SendCSVParams) => sendCSVThroughMail(variables),
      onSuccess: () => {
        toast.success("Email sent successfully!");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    }
  )
}