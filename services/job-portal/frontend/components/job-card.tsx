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
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
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
    <Link href={`/jobs/${job._id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 border shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            
            {/* Left side: Logo and Title Info */}
            <div className="flex gap-4 items-start">
              <Avatar className="h-12 w-12 rounded-lg border bg-muted/50">
                <AvatarImage
                  src={job.company?.logo}
                  alt={job.company?.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg bg-primary/5 text-primary">
                  <Building2 className="h-6 w-6 opacity-60" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  {job.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 gap-1 text-[10px] font-bold uppercase py-0 px-2">
                      <Zap className="h-3 w-3 fill-current" /> Featured
                    </Badge>
                  )}
                  {job.hasApplied && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px] font-bold uppercase py-0 px-2">
                      <CheckCircle2 className="h-3 w-3" /> Applied
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {job.company?.name || "Anonymous Company"}
                </p>
              </div>
            </div>

            {/* Right side: Salary Info (Desktop) */}
            {job.salary?.min && (
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center text-base font-bold text-foreground">
                  <CurrencyIcon
                    currency={job.salary.currency}
                    className="w-4 h-4 mr-0.5"
                  />
                  <span>{job.salary.min.toLocaleString()}</span>
                  <span className="mx-1 font-normal text-muted-foreground">-</span>
                  <span>{job.salary.max?.toLocaleString()}</span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Per {job.salary.period}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location.remote
                ? "Remote"
                : `${job.location.city}, ${job.location.country}`}
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{job.jobType.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(job.createdAt), {
                addSuffix: true,
              })}
            </div>
            {/* Mobile Salary View */}
            {job.salary?.min && (
              <div className="flex md:hidden items-center gap-1.5 font-semibold text-foreground">
                 <CurrencyIcon currency={job.salary.currency} className="w-4 h-4" />
                 {job.salary.min.toLocaleString()} - {job.salary.max?.toLocaleString()}
              </div>
            )}
          </div>

          {/* Description Snippet */}
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {job.description}
          </p>

          {/* Skills Row */}
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill: any, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-md font-medium px-2.5 py-0.5 text-xs bg-muted/50 border-transparent hover:bg-muted"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <span className="text-xs text-muted-foreground self-center ml-1">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}