import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecentEmployer } from "../../services/analytics.service";

export function AdminRecentEmployers({ employers }: { employers: RecentEmployer[] }) {
  return (
    <div className="flex max-h-[400px] min-h-fit flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_2px_15px_rgba(0,0,0,0.04)] sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 shrink-0 text-[17px] leading-tight font-bold text-slate-900 sm:mb-6 dark:text-white">
        Recent Employer Registrations
      </h3>

      <div className="flex-1 overflow-y-auto">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[45%] h-auto p-0 pr-2 pb-3 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Company
              </TableHead>
              <TableHead className="w-[30%] h-auto p-0 pr-2 pb-3 text-left text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Applied On
              </TableHead>
              <TableHead className="w-[25%] h-auto p-0 pb-3 text-right text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employers && employers.length > 0 ? (
              employers.map((employer) => {
                const companyInitials = employer.name.charAt(0).toUpperCase();

                let badgeVariant:
                  | "default"
                  | "secondary"
                  | "destructive"
                  | "outline" = "default";
                let statusLabel = "VERIFIED";

                if (!employer.isVerified || employer.kycStatus === "PENDING") {
                  statusLabel = "PENDING";
                  badgeVariant = "secondary";
                } else if (employer.kycStatus === "REJECTED") {
                  statusLabel = "REQUIRED"; // shortened for mobile
                  badgeVariant = "destructive";
                }

                return (
                  <TableRow
                    key={employer.id}
                    className="border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="p-0 py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#2563eb]/10 text-xs font-bold text-[#2563eb]">
                          {companyInitials}
                        </div>
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {employer.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-0 py-3 pr-2 text-xs whitespace-nowrap text-slate-500">
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-0 py-3 text-right">
                      <Badge
                        variant={badgeVariant}
                        className="px-1.5 py-0.5 text-[9px] whitespace-nowrap"
                      >
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
                  className="p-0 py-8 text-center text-sm text-slate-500"
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
