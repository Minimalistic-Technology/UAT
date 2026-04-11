import { DriveFile } from "@/features/drive/types";

export const generateCSVString = (data: DriveFile[]) => {
  const headers = ["Name", "Type", "Size (KB)", "Last Modified", "Link"];

  const rows = data.map((file) => [
    `"${file.name.replace(/"/g, '""')}"`,
    `"${file.mimeType?.split("/").pop() || ""}"`,
    file.size ? (parseInt(file.size) / 1024).toFixed(2) : "0",
    file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : "",
    `"${file.webViewLink || ""}"`,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
};