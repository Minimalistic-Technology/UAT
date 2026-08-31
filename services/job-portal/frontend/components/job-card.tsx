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
import { getCurrencyIcon } from "@/utils";

// Shadcn UI Components
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JobCardProps {
  job: any;
}

export default function JobCard({ job }: JobCardProps) {
  const isInternship =
    job.listingType === "internship" || job.opportunityType === "INTERNSHIP";
  const id = job.id || job._id;

  const salary =
    job.salary ||
    (job.jobDetails
      ? {
          min: job.jobDetails.salaryMin,
          max: job.jobDetails.salaryMax,
          currency: job.jobDetails.salaryCurrency || "INR",
          period: job.jobDetails.salaryPeriod || "YEARLY",
        }
      : null);

  const stipend =
    job.stipend ||
    (job.internshipDetails
      ? {
          amount: job.internshipDetails.stipendAmount,
          currency: "INR",
          period: job.internshipDetails.durationUnit
            ? job.internshipDetails.durationUnit.toLowerCase()
            : "month",
          type: job.internshipDetails.stipendType
            ? job.internshipDetails.stipendType.toLowerCase()
            : "fixed",
        }
      : null);

  const locationText =
    job.workMode?.toLowerCase() === "remote" ||
    job.workMode === "REMOTE" ||
    job.location?.remote
      ? "Remote"
      : job.city
        ? [job.city, job.state, job.country || "India"]
            .filter(Boolean)
            .join(", ")
        : job.location
          ? typeof job.location === "string"
            ? job.location
            : [job.location.city, job.location.country]
                .filter(Boolean)
                .join(", ")
          : job.company?.locations?.[0]
            ? [
                job.company.locations[0].city,
                job.company.locations[0].country,
              ]
                .filter(Boolean)
                .join(", ")
            : "Location not specified";

  return (
    <Link
      href={`/${isInternship ? "internship" : "job"}/${id}`}
      className="group block"
    >
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
                  {isInternship && (
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
            {isInternship ? (
              stipend?.amount ? (
                <div className="hidden flex-col items-end md:flex">
                  <div className="text-foreground flex items-center text-base font-bold">
                    {getCurrencyIcon(stipend.currency, "mr-0.5 h-4 w-4")}
                    <span>{stipend.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                    Per {stipend.period}
                  </p>
                </div>
              ) : (
                <div className="hidden flex-col items-end md:flex">
                  <span className="text-muted-foreground text-sm font-medium capitalize">
                    {stipend?.type === "unpaid"
                      ? "Unpaid"
                      : `${stipend?.type || ""} Stipend`}
                  </span>
                </div>
              )
            ) : salary?.min || salary?.max ? (
              <div className="hidden flex-col items-end md:flex">
                <div className="text-foreground flex items-center text-base font-bold">
                  {getCurrencyIcon(salary.currency, "mr-0.5 h-4 w-4")}
                  {salary?.min && salary?.max ? (
                    <>
                      <span>{salary.min.toLocaleString()}</span>
                      <span className="text-muted-foreground mx-1 font-normal">
                        -
                      </span>
                      <span>{salary.max.toLocaleString()}</span>
                    </>
                  ) : salary?.min ? (
                    <>
                      <span className="text-muted-foreground mr-1 text-sm font-normal">
                        From
                      </span>
                      <span>{salary.min.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground mr-1 text-sm font-normal">
                        Up to
                      </span>
                      <span>{salary.max!.toLocaleString()}</span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                  Per {salary.period}
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
              {locationText}
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
            {isInternship ? (
              stipend?.amount ? (
                <div className="text-foreground flex items-center gap-1.5 font-semibold md:hidden">
                  {getCurrencyIcon(stipend.currency, "h-4 w-4")}
                  {stipend.amount.toLocaleString()}
                </div>
              ) : (
                <div className="text-muted-foreground flex items-center text-sm font-medium capitalize md:hidden">
                  {stipend?.type === "unpaid"
                    ? "Unpaid"
                    : `${stipend?.type || ""} Stipend`}
                </div>
              )
            ) : salary?.min || salary?.max ? (
              <div className="text-foreground flex items-center gap-1.5 font-semibold md:hidden">
                {getCurrencyIcon(salary.currency, "h-4 w-4")}
                {salary?.min && salary?.max
                  ? `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
                  : salary?.min
                    ? `From ${salary.min.toLocaleString()}`
                    : `Up to ${salary.max!.toLocaleString()}`}
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center text-sm font-medium md:hidden">
                Salary not disclosed
              </div>
            )}
          </div>

          {/* Description Snippet */}
          <p
            className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed"
            title={
              job.description
                ? job.description
                    .replace(/<[^>]*>?/gm, " ")
                    .replace(/#{1,6}\s*/g, "")
                    .replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
                : ""
            }
          >
            {job.description
              ? job.description
                  .replace(/<[^>]*>?/gm, " ")
                  .replace(/#{1,6}\s*/g, "")
                  .replace(/\*\*/g, "")
                  .replace(/\*/g, "")
                  .replace(/\s+/g, " ")
                  .trim()
              : ""}
          </p>

          {/* Skills Row */}
          <div className="mt-4 border-t pt-4">
            <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills?.length > 0 ? (
                <>
                  {job.skills.slice(0, 4).map((skill: any, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-md border-transparent bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="ml-1 self-center text-[11px] font-bold text-slate-500">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No specific skills listed
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
