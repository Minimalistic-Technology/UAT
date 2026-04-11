import { toast } from "sonner"
import { GetDriveFileResponse, SendCSVParams } from "../types";
import apiClient from "@/lib/axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchDriveFiles(folderId: string, signal?: AbortSignal) {
  try {
    const response = await apiClient.get<any, GetDriveFileResponse>(`${API_URL}/api/v1/drive`, {
      params: {
        folderId,
        pageSize: 50,
        orderBy: "modifiedTime desc",
      },
      signal, // Pass signal for request cancellation
      timeout: 10000, // Increased to 10s for heavy drive queries
    });

    console.log("response of the api", response)

    return response;
  } catch (error: any) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return; // silently ignore
    }
    const errorMessage = error.response?.data?.error || "Failed to fetch Drive files";

    // Log for developers
    console.error("Drive Fetch Error:", error.message);

    // Notify users
    toast.error(errorMessage);

    // Throw error so React Query knows the request failed
    throw new Error(errorMessage);
  }
}

export async function sendCSVThroughMail({ email, fileName, csvContent }: SendCSVParams) {
  try {
    await apiClient.post(`${API_URL}/api/v1/drive/share/CSV`, {
      recipientEmail: email,
      fileName: fileName,
      csvData: csvContent,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Failed to send the email";
    console.error("Drive Fetch Error:", error.message);

    // Throw error so React Query knows the request failed
    throw new Error(errorMessage);
  }
}