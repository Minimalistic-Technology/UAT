"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ApplicationStatus } from "@/types/enums";
import { Briefcase, MapPin, Clock, Trash2, Eye, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ApplicationCardProps {
  application: any;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const appStatus = application.status?.toLowerCase();
  const isActionDisabled = [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ].includes(appStatus as any);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200",
      withdrawn: "bg-slate-100 text-slate-600 border-slate-300",
    };

    return (
      <Badge
        variant="outline"
        className={cn(
          "border px-3 py-1 text-[11px] font-bold tracking-wide capitalize shadow-none",
          variants[status] || variants.pending,
        )}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="group bg-card hover:border-primary/30 flex flex-col justify-between gap-4 rounded-xl border p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <Avatar className="bg-muted/50 hidden h-12 w-12 rounded-lg border sm:block">
          <AvatarImage
            src={application.listing?.company?.logo?.url}
            alt={application.listing?.company?.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/5 text-primary rounded-lg">
            <Building2 className="h-6 w-6 opacity-60" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="group-hover:text-primary line-clamp-1 text-lg font-bold text-slate-900 transition-colors">
              {application.listing?.title}
            </h4>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 text-[10px] font-bold uppercase"
            >
              {application.listing?.listingType || "Job"}
            </Badge>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Building2 className="h-3.5 w-3.5" />
              {application.listing?.company?.name || "Unknown Company"}
            </span>

            <span className="flex items-center gap-1.5 capitalize">
              <Briefcase className="h-3.5 w-3.5" />
              {application.listing?.employmentType?.replace(/_/g, " ")}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {application.listing?.location?.city || "Location not set"}
              {application.listing?.workMode === "remote" && (
                <Badge
                  variant="outline"
                  className="ml-1 h-4 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-600"
                >
                  Remote
                </Badge>
              )}
            </span>

            <span className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              Applied {format(new Date(application.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 border-t pt-3 sm:mt-0 sm:justify-end sm:border-0 sm:pt-0">
        <StatusBadge status={appStatus} />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-primary/10 hover:text-primary border-secondary/20 h-9 w-9 cursor-pointer rounded-full bg-slate-50 transition-colors"
            asChild
          >
            <Link
              href={`/user-dashboard/applications/${application.id || application._id}`}
            >
              <Eye className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
