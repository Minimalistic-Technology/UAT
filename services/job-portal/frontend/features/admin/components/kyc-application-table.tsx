import { Eye, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KycTableProps {
  applications: any[];
  isLoading: boolean;
  isUpdating: boolean;
  onUpdateStatus: (id: string, status: "approved" | "rejected" | "pending") => void;
}

const KYC_COLUMNS = [
  { key: "company", label: "Company Info" },
  { key: "ids", label: "Tax & ID Details" },
  { key: "docs", label: "Proof Files" },
  { key: "status", label: "Current Status" },
  { key: "actions", label: "Actions" },
];

export const KycTable = ({ applications, isLoading, isUpdating, onUpdateStatus }: KycTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {KYC_COLUMNS.map((column) => (
              <TableHead key={column.key} className={column.key === "actions" ? "text-right" : ""}>
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
                    <Skeleton className={`h-6 ${col.key === 'actions' ? 'ml-auto w-20' : 'w-full'}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <TableRow key={app._id} className="group transition-colors hover:bg-muted/20">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{app.companyName}</span>
                    <span className="text-muted-foreground text-xs">{app.user?.firstName} {app.user?.lastName}</span>
                    <span className="text-muted-foreground/70 text-[11px] font-mono">{app.user?.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex gap-2"><span className="text-muted-foreground w-12">GST:</span>{app.gstNo}</div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-12">AADHAR:</span>{app.aadharNo}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs justify-start text-blue-600" asChild>
                      <a href={app.photoUrl} target="_blank" rel="noreferrer"><Eye className="mr-1 h-3 w-3"/> Photo</a>
                    </Button>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs justify-start text-blue-600" asChild>
                      <a href={app.lightbillUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3 w-3"/> Utility Bill</a>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "outline"}
                    className={app.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
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
                              variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              disabled={isUpdating}
                              onClick={() => onUpdateStatus(app._id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Approve</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50"
                              disabled={isUpdating}
                              onClick={() => onUpdateStatus(app._id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-[11px] font-medium italic">Processed</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={KYC_COLUMNS.length} className="text-muted-foreground h-24 text-center">
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};