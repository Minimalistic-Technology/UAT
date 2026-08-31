import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecommendedJobsCardProps {
  jobs: any[];
}

export function RecommendedJobsCard({ jobs }: RecommendedJobsCardProps) {
  return (
    <Card className="max-h-2xl min-h-fit shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recommended for You</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-visible px-6 lg:max-h-[320px] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
          <div className="mt-2 space-y-6 pb-6">
            {!jobs || jobs.length === 0 ? (
              <div className="pt-10 text-center text-sm text-slate-500">
                No matching jobs found right now.
              </div>
            ) : (
              jobs.map((listing: any) => (
                <Link
                  key={listing.id || listing._id}
                  href={
                    listing.listingType === "internship" ||
                    listing.opportunityType === "INTERNSHIP"
                      ? `/internship/${listing.id || listing._id}`
                      : `/job/${listing.id || listing._id}`
                  }
                  className="group block"
                >
                  <div className="hover:border-border space-y-1.5 rounded-lg border border-transparent p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-900">
                    <h4 className="group-hover:text-primary line-clamp-1 text-sm font-bold transition-colors">
                      {listing.title}
                    </h4>
                    <p className="text-muted-foreground text-xs font-semibold">
                      {listing.company?.name || "Premium Company"}
                    </p>
                    <div className="flex items-center gap-2 pt-1 uppercase">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0 text-[9px] font-bold tracking-wider"
                      >
                        {(
                          listing.employmentType ||
                          listing.jobType ||
                          "full_time"
                        )
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </Badge>
                      <span className="flex items-center overflow-hidden text-[10px] font-medium text-ellipsis whitespace-nowrap text-slate-400">
                        <MapPin className="text-primary/60 mr-0.5 h-3 w-3 shrink-0" />{" "}
                        {listing.location?.city || "Remote"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
