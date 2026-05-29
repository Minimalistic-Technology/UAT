import { useState } from "react";
import { Eye, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { KycWithUser } from "../types/kyc.type";

interface KycTableProps {
  applications: KycWithUser[];
  isLoading: boolean;
  isUpdating: boolean;
  onUpdateStatus: (
    id: string,
    status: "approved" | "rejected" | "pending",
    note?: string,
  ) => void;
}

const KYC_COLUMNS = [
  { key: "company", label: "Company Info" },
  { key: "ids", label: "Tax & ID Details" },
  { key: "docs", label: "Proof Files" },
  { key: "status", label: "Current Status" },
  { key: "actions", label: "Actions" },
];

const isPdf = (url: string) =>
  url.toLowerCase().includes(".pdf") ||
  url.toLowerCase().includes("/raw/upload/");

const getViewUrl = (url: string) => {
  if (isPdf(url)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
  }
  return url; // images open natively in a new tab
};

export const KycTable = ({
  applications,
  isLoading,
  isUpdating,
  onUpdateStatus,
}: KycTableProps) => {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewingReason, setViewingReason] = useState<string | undefined | null >(undefined);

  const handleRejectConfirm = () => {
    if (rejectingId) {
      onUpdateStatus(rejectingId, "rejected", rejectReason);
      setRejectingId(null);
      setRejectReason("");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {KYC_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                className={column.key === "actions" ? "text-right" : ""}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {KYC_COLUMNS.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton
                      className={`h-6 ${col.key === "actions" ? "ml-auto w-20" : "w-full"}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <TableRow
                key={app._id}
                className="group hover:bg-muted/20 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{app.companyName}</span>
                    <span className="text-muted-foreground text-xs">
                      {app.user?.firstName} {app.user?.lastName}
                    </span>
                    <span className="text-muted-foreground/70 font-mono text-[11px]">
                      {app.user?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-12">GST:</span>
                      {app.gstNo}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-12">
                        AADHAR:
                      </span>
                      {app.aadharNo}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-12">
                        CIN No:
                      </span>
                      {app.cinNo}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {app.photo?.url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto justify-start p-0 text-xs text-blue-600"
                        asChild
                      >
                        <a
                          href={app.photo.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Eye className="mr-1 h-3 w-3" /> Photo
                        </a>
                      </Button>
                    )}
                    {app.lightbill?.url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto justify-start p-0 text-xs text-blue-600"
                        asChild
                      >
                        <a
                          href={getViewUrl(app.lightbill.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" /> Utility Bill
                        </a>
                      </Button>
                    )}
                    {!app.photo?.url && !app.lightbill?.url && (
                      <span className="text-muted-foreground text-xs">
                        No documents
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      app.status === "approved"
                        ? "default"
                        : app.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                    className={
                      app.status === "pending"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : ""
                    }
                  >
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {app.status === "pending" ? (
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              disabled={isUpdating}
                              onClick={() =>
                                onUpdateStatus(app._id, "approved")
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Approve</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8 hover:bg-red-50"
                              disabled={isUpdating}
                              onClick={() => setRejectingId(app._id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      {app.status === "rejected" && app.rejectionReason && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                onClick={() =>
                                  setViewingReason(app.rejectionReason)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              View Rejection Reason
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className="text-muted-foreground text-[11px] font-medium italic">
                        Processed
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={KYC_COLUMNS.length}
                className="text-muted-foreground h-24 text-center"
              >
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!rejectingId}
        onOpenChange={(open) => !open && setRejectingId(null)}
      >
        <DialogContent className="px-4">
          <DialogHeader className="px-0">
            <DialogTitle>Reject KYC Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC application. The
              employer will see this reason on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. The document uploaded is blurry and illegible."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectingId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
              className="cursor-pointer"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingReason}
        onOpenChange={(open) => !open && setViewingReason(null)}
      >
        <DialogContent className="px-4">
          <DialogHeader className="px-0">
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-md p-4 text-sm whitespace-pre-wrap">
            {viewingReason}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewingReason(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
