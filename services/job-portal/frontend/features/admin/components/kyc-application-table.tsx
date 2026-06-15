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
  { key: "user", label: "User Info" },
  { key: "types", label: "Document Types" },
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
  const [viewingReason, setViewingReason] = useState<string | undefined | null>(undefined);

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
                    <span className="text-sm font-bold">
                      {app.user?.firstName} {app.user?.lastName}
                    </span>
                    <span className="text-muted-foreground/70 font-mono text-[11px]">
                      {app.user?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Company Doc:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.companyDocumentType}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                      <span className="text-muted-foreground">Personal Doc:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.personalDocumentType}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {app.companyDocument?.url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto justify-start p-0 text-xs text-blue-600"
                        asChild
                      >
                        <a
                          href={getViewUrl(app.companyDocument.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" /> Company Document
                        </a>
                      </Button>
                    )}
                    {app.personalDocument?.url && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto justify-start p-0 text-xs text-blue-600"
                        asChild
                      >
                        <a
                          href={getViewUrl(app.personalDocument.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" /> Personal Document
                        </a>
                      </Button>
                    )}
                    {!app.companyDocument?.url && !app.personalDocument?.url && (
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
        <DialogContent className="p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl sm:rounded-[24px]">
          <div className="p-6 sm:p-8 space-y-6">
            <DialogHeader className="px-0">
              <DialogTitle className="text-xl font-bold">Reject KYC Application</DialogTitle>
              <DialogDescription className="text-slate-500">
                Please provide a reason for rejecting this KYC application. The
                employer will see this reason on their dashboard.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The document uploaded is blurry and illegible."
              rows={4}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                setRejectingId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl shadow-sm"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!viewingReason}
        onOpenChange={(open) => !open && setViewingReason(null)}
      >
        <DialogContent className="p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl sm:rounded-[24px]">
          <div className="p-6 sm:p-8 space-y-6">
            <DialogHeader className="px-0">
              <DialogTitle className="text-xl font-bold">Rejection Reason</DialogTitle>
            </DialogHeader>
            <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-xl p-5 text-sm whitespace-pre-wrap border border-rose-100 dark:border-rose-900/50">
              {viewingReason}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={() => setViewingReason(null)} className="rounded-xl px-8 bg-[#2563eb] text-white hover:bg-blue-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
