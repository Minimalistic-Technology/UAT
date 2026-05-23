"use client";

import { Download } from "lucide-react";
import { DriveFile } from "../types";
import { Button } from "@/components/ui/button"; // Using Shadcn button for consistency
import { generateCSVString } from "@/lib/generate-csv";

export default function DownloadCSV({ files }: { files: DriveFile[] }) {
  const handleDownload = () => {
    if (!files || files.length === 0) {
      alert("No data to download");
      return;
    }

    // 1. Ask user for filename
    const userInput = window.prompt(
      "Enter a name for your CSV file:",
      "drive-files",
    );

    // 2. Handle cancel or empty input
    if (userInput === null) return;

    const fileName = userInput.trim() === "" ? "drive-files" : userInput.trim();
    const finalFileName = fileName.endsWith(".csv")
      ? fileName
      : `${fileName}.csv`;

    const csv = generateCSVString(files);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", finalFileName);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up memory
  };

  return (
    <Button
      onClick={handleDownload}
      size="sm"
      className={"cursor-pointer"}
      // className="flex cursor-pointer items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
