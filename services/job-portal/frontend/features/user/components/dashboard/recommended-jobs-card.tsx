import React from "react";
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
        <Card className="shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="px-6 lg:max-h-[320px] overflow-visible lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="space-y-6 pb-6 mt-2">
                        {!jobs || jobs.length === 0 ? (
                            <div className="text-center text-sm text-slate-500 pt-10">
                                No matching jobs found right now.
                            </div>
                        ) : (
                            jobs.map((job: any) => (
                                <Link key={job._id || job.id} href={`/jobs/${job._id || job.id}`} className="group block">
                                    <div className="space-y-1.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-border transition-all">
                                        <h4 className="group-hover:text-primary text-sm font-bold transition-colors line-clamp-1">
                                            {job.title}
                                        </h4>
                                        <p className="text-muted-foreground text-xs font-semibold">
                                            {job.company?.name || "Premium Company"}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1 uppercase">
                                            <Badge variant="secondary" className="px-2 py-0 text-[9px] font-bold tracking-wider">
                                                {(job.employmentType || job.jobType || "full_time")
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                            </Badge>
                                            <span className="flex items-center text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                <MapPin className="mr-0.5 h-3 w-3 text-primary/60 shrink-0" />{" "}
                                                {job.location?.city || "Remote"}
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
