"use client";

import Link from "next/link";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  IndianRupee,
  Euro,
  PoundSterling,
  Building2,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Shadcn UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JobCardProps {
  job: any;
}

const CurrencyIcon = ({
  currency,
  className,
}: {
  currency?: string;
  className?: string;
}) => {
  switch (currency?.toUpperCase()) {
    case "INR":
      return <IndianRupee className={className} />;
    case "EUR":
      return <Euro className={className} />;
    case "GBP":
      return <PoundSterling className={className} />;
    default:
      return <DollarSign className={className} />;
  }
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/${job.listingType === 'internship' ? 'internship' : 'job'}/${job._id}`} className="group block">
      <Card className="hover:border-primary/20 overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            {/* Left side: Logo and Title Info */}
            <div className="flex items-start gap-4">
              <Avatar className="bg-muted/50 h-12 w-12 rounded-lg border">
                <AvatarImage
                  src={job.company?.logo?.url}
                  alt={job.company?.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/5 text-primary rounded-lg">
                  <Building2 className="h-6 w-6 opacity-60" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="group-hover:text-primary text-lg leading-none font-bold transition-colors">
                    {job.title}
                  </h3>
                  {job.isFeatured && (
                    <Badge
                      variant="secondary"
                      className="gap-1 border-yellow-200 bg-yellow-100 px-2 py-0 text-[10px] font-bold text-yellow-800 uppercase hover:bg-yellow-100"
                    >
                      <Zap className="h-3 w-3 fill-current" /> Featured
                    </Badge>
                  )}
                  {job.listingType === "internship" && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 text-[10px] font-bold uppercase"
                    >
                      Internship
                    </Badge>
                  )}
                  {job.hasApplied && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-200 bg-emerald-50 px-2 py-0 text-[10px] font-bold text-emerald-700 uppercase"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Applied
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {job.company?.name || "Anonymous Company"}
                </p>
              </div>
            </div>

            {/* Right side: Salary Info (Desktop) */}
            {job.listingType === "internship" ? (
              job.stipend?.amount ? (
                <div className="hidden flex-col items-end md:flex">
                  <div className="text-foreground flex items-center text-base font-bold">
                    <CurrencyIcon
                      currency={job.stipend.currency}
                      className="mr-0.5 h-4 w-4"
                    />
                    <span>{job.stipend.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Per {job.stipend.period}
                  </p>
                </div>
              ) : (
                <div className="hidden flex-col items-end md:flex">
                  <span className="text-muted-foreground text-sm font-medium capitalize">
                    {job.stipend?.type === "unpaid" ? "Unpaid" : `${job.stipend?.type || ""} Stipend`}
                  </span>
                </div>
              )
            ) : job.salary?.min || job.salary?.max ? (
              <div className="hidden flex-col items-end md:flex">
                <div className="text-foreground flex items-center text-base font-bold">
                  <CurrencyIcon
                    currency={job.salary.currency}
                    className="mr-0.5 h-4 w-4"
                  />
                  {job.salary?.min && job.salary?.max ? (
                    <>
                      <span>{job.salary.min.toLocaleString()}</span>
                      <span className="text-muted-foreground mx-1 font-normal">
                        -
                      </span>
                      <span>{job.salary.max.toLocaleString()}</span>
                    </>
                  ) : job.salary?.min ? (
                    <>
                      <span className="text-muted-foreground mr-1 text-sm font-normal">
                        From
                      </span>
                      <span>{job.salary.min.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground mr-1 text-sm font-normal">
                        Up to
                      </span>
                      <span>{job.salary.max!.toLocaleString()}</span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                  Per {job.salary.period}
                </p>
              </div>
            ) : (
              <div className="hidden flex-col items-end md:flex">
                <span className="text-muted-foreground text-sm font-medium">
                  Salary not disclosed
                </span>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location.remote
                ? "Remote"
                : `${job.location.city}, ${job.location.country}`}
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">
                {job.employmentType?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(job.createdAt), {
                addSuffix: true,
              })}
            </div>
            {/* Mobile Salary View */}
            {job.listingType === "internship" ? (
              job.stipend?.amount ? (
                <div className="text-foreground flex items-center gap-1.5 font-semibold md:hidden">
                  <CurrencyIcon
                    currency={job.stipend.currency}
                    className="h-4 w-4"
                  />
                  {job.stipend.amount.toLocaleString()}
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center text-sm font-medium capitalize md:hidden">
                  {job.stipend?.type === "unpaid" ? "Unpaid" : `${job.stipend?.type || ""} Stipend`}
                </div>
              )
            ) : job.salary?.min || job.salary?.max ? (
              <div className="text-foreground flex items-center gap-1.5 font-semibold md:hidden">
                <CurrencyIcon
                  currency={job.salary.currency}
                  className="h-4 w-4"
                />
                {job.salary?.min && job.salary?.max
                  ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
                  : job.salary?.min
                    ? `From ${job.salary.min.toLocaleString()}`
                    : `Up to ${job.salary.max!.toLocaleString()}`}
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center text-sm font-medium md:hidden">
                Salary not disclosed
              </div>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed" title={job.description?.replace(/<[^>]*>?/gm, ' ')}>
            {job.description ? job.description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : ''}
          </p>

          {/* Skills Row */}
          <div className="mt-4 border-t pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills?.length > 0 ? (
                <>
                  {job.skills.slice(0, 4).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border-transparent px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="text-slate-500 ml-1 self-center text-[11px] font-bold">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-400 text-xs italic">No specific skills listed</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
