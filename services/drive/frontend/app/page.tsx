"use client";

import React, { useState } from "react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  Folder,
  ChevronRight,
  RefreshCw,
  HardDrive,
  ExternalLink,
} from "lucide-react";
import { useGetAllDriveFiles } from "@/features/drive/hooks/use-get-files"; // Using the hook we built
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DownloadCSV from "@/features/drive/components/download-csv-btn";
import { DriveFile } from "@/features/drive/types";
import { ShareEmailDialog } from "@/features/drive/components/share-csv";

export default function DriveDashboard() {
  // Manage navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string>(
    process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID || "",
  );
  const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([
    { id: currentFolderId, name: "Root" },
  ]);

  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllDriveFiles(currentFolderId);
  console.log("Drive page");

  const files = responseData?.files;
  const count = responseData?.count;

  // Folder Navigation logic
  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolderId(id);
    setPathStack((prev) => [...prev, { id, name }]);
  };

  const navigateBack = (index: number) => {
    const newStack = pathStack.slice(0, index + 1);
    const target = newStack[newStack.length - 1];
    setPathStack(newStack);
    setCurrentFolderId(target.id);
  };

  const formatSize = (bytes?: string) => {
    if (!bytes || bytes === "0") return "—";
    const b = parseInt(bytes);
    const units = ["B", "KB", "MB", "GB"];
    let l = 0,
      n = b || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
  };

  const getIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder")
      return <Folder className="h-5 w-5 fill-amber-400 text-amber-400" />;
    if (mimeType.includes("image"))
      return <FileImage className="h-5 w-5 text-emerald-500" />;
    if (mimeType.includes("video"))
      return <FileVideo className="h-5 w-5 text-violet-500" />;
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return <FileArchive className="h-5 w-5 text-rose-500" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl space-y-6 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <HardDrive className="text-primary h-8 w-8" />
            Drive Explorer
          </h1>
          <nav className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
            {pathStack.map((folder, idx) => (
              <React.Fragment key={folder.id}>
                {idx > 0 && <ChevronRight className="h-4 w-4" />}
                <button
                  onClick={() => navigateBack(idx)}
                  className={`hover:text-primary transition-colors ${idx === pathStack.length - 1 ? "text-foreground font-semibold" : ""}`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <ShareEmailDialog
            files={files || []}
            folderName={pathStack[pathStack.length - 1].name}
          />
          <DownloadCSV files={files || []} />
        </div>
      </div>

      <Card className="ring-border border-none shadow-md ring-1">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[35%]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DriveSkeleton rows={8} />
              ) : files?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-32 text-center"
                  >
                    No files or folders found here.
                  </TableCell>
                </TableRow>
              ) : (
                files?.map((file: DriveFile) => (
                  <TableRow
                    key={file.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      if (
                        file.mimeType === "application/vnd.google-apps.folder"
                      ) {
                        navigateToFolder(file.id, file.name);
                      }
                    }}
                  >
                    <TableCell className="flex items-center gap-3 font-medium">
                      {getIcon(file.mimeType || "")}
                      <span className="max-w-[250px] truncate md:max-w-[300px]">
                        {file.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {file.mimeType && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] capitalize"
                        >
                          {file.mimeType.split(".").pop()?.split("/").pop()}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {formatSize(file.size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(file.modifiedTime || "").toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {file.webViewLink &&
                      file.mimeType !== "application/vnd.google-apps.folder" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground pr-2 text-xs">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

export function DriveSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              {/* Icon Skeleton */}
              <Skeleton className="h-5 w-5 rounded" />
              {/* Name Skeleton */}
              <Skeleton className="h-5 w-[180px] md:w-[250px]" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-[80px] rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[60px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-[100px]" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
