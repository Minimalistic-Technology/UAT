import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminRecentEmployers({ employers }: { employers: any[] }) {
  return (
    <div className="flex max-h-[400px] min-h-fit flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-6 shrink-0 text-[17px] leading-tight font-bold text-slate-900 dark:text-white">
        Recent Employer Registrations
      </h3>

      <div className="-mr-2 flex-1 overflow-auto pr-2">
        <Table>
          <TableHeader>
            <TableRow className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              <TableHead className="w-[50%]">Company</TableHead>
              <TableHead className="w-[25%]">Applied On</TableHead>
              <TableHead className="w-[25%] text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employers && employers.length > 0 ? (
              employers.map((employer) => {
                const companyInitials = employer.name
                  ? employer.name.charAt(0).toUpperCase()
                  : "C";
                let badgeVariant:
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline" = "default";
                let statusLabel = "VERIFIED";

                if (!employer.isVerified || employer.kycStatus === "pending") {
                  statusLabel = "PENDING";
                  badgeVariant = "secondary";
                } else if (employer.kycStatus === "rejected") {
                  statusLabel = "ACTION REQUIRED";
                  badgeVariant = "destructive";
                }

                return (
                  <TableRow key={employer._id}>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-[10px] bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
                          {companyInitials}
                        </div>
                        <span className="max-w-[110px] truncate">
                          {employer.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={badgeVariant} className="text-[9px]">
                        {statusLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-slate-500"
                >
                  No recent employers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
