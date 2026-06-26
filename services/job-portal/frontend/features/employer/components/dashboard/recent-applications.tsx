import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDashboardApplications } from "@/features/employer/hooks/use-applications";
import { DashboardApplication } from "@/features/employer/types/application.type";
import { RecentApplicationsSkeleton } from "@/skeletons/employer/employer-dashboard";
import { DashboardError } from "@/errors/employer/employer-dashboard";
import { getApplicationStatusColor } from "@/utils";
import { cn } from "@/lib/utils";

export const RecentApplications = () => {
  const {
    data: applicationsResponse,
    isLoading: isLoadingApps,
    isError,
    error,
  } = useGetDashboardApplications({ page: 1, limit: 5 });

  const recentApplications = applicationsResponse?.data?.applications || [];
  const totalApplications =
    applicationsResponse?.data?.pagination?.totalItems || 0;

  if (isLoadingApps) {
    return <RecentApplicationsSkeleton />;
  }

  if (isError) {
    return (
      <DashboardError
        title="Failed to load applications"
        message={
          error?.message || "Recent applications could not be established."
        }
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border-0 bg-white p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-heading text-foreground text-lg font-bold">
            Recent Candidate Pipeline
          </h3>
          <span className="text-muted-foreground mt-0.5 text-xs">
            Tracking {totalApplications} total applications.
          </span>
        </div>
        <Button
          variant="link"
          className="text-primary font-semibold hover:no-underline"
          asChild
        >
          <Link href="/employer-dashboard/applications">
            Pipeline Hub <ArrowUpRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        {recentApplications.length === 0 ? (
          <div className="border-border/50 bg-background/50 flex h-32 flex-col items-center justify-center rounded-xl border border-dashed text-center">
            <span className="text-muted-foreground mb-1 text-sm font-semibold">
              No active pipeline candidates.
            </span>
            <span className="text-muted-foreground/60 text-xs">
              Jobs posted will gather applications here.
            </span>
          </div>
        ) : (
          <Table className="w-full min-w-[700px] text-sm whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-border/50 text-muted-foreground border-b text-left text-xs font-bold tracking-wider uppercase hover:bg-transparent">
                <TableHead className="pr-4 pb-3">Candidate</TableHead>
                <TableHead className="px-4 pb-3">Position</TableHead>
                <TableHead className="px-4 pb-3">Type</TableHead>
                <TableHead className="px-4 pb-3">State</TableHead>
                <TableHead className="pb-3 pl-4 text-right">
                  Applied Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplications.map((app: DashboardApplication) => {
                const initials = app.jobSeeker?.firstName
                  ? app.jobSeeker.firstName.charAt(0)
                  : "U";
                return (
                  <TableRow
                    key={app._id}
                    className="border-border/30 hover:bg-muted/10 border-b transition-colors last:border-0"
                  >
                    <TableCell className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary ring-background flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-xs ring-2">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground max-w-[150px] truncate text-sm font-bold">
                            {app.jobSeeker?.firstName} {app.jobSeeker?.lastName}
                          </span>
                          <span className="text-muted-foreground max-w-[150px] truncate text-xs font-medium">
                            {app.jobSeeker?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="text-foreground max-w-[150px] truncate font-semibold">
                        {app.listing?.title || "Unknown Title"}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        {app.listingType || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "cursor-default border-0 px-3 py-1 font-bold shadow-sm",
                          getApplicationStatusColor(app.status),
                        )}
                      >
                        {app.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4 pl-4 text-right text-xs font-medium whitespace-nowrap">
                      {format(new Date(app.createdAt), "MMM d, yyyy, h:mm a")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
