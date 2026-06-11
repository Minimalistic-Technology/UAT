"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ApplicationStatus } from "@/types/enums";
import { Briefcase, MapPin, Clock, Trash2, Eye, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { useWithdrawJobApplication } from "@/features/user/hooks/use-job-application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApplicationCardProps {
    application: any;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
    const { mutate: withdrawApplication } = useWithdrawJobApplication();
    const appStatus = application.status?.toLowerCase();
    const isActionDisabled = [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED].includes(appStatus as any);

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
                    "border px-3 py-1 text-[11px] font-bold capitalize tracking-wide shadow-none",
                    variants[status] || variants.pending
                )}
            >
                {status}
            </Badge>
        );
    };

    return (
        <div className="group bg-card hover:border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-5 transition-all shadow-sm hover:shadow-md gap-4">
            <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 rounded-lg border bg-muted/50 hidden sm:block">
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
                        <h4 className="group-hover:text-primary font-bold text-slate-900 transition-colors text-lg line-clamp-1">
                            {application.listing?.title}
                        </h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0 text-[10px] font-bold uppercase">
                            {application.listing?.listingType || "Job"}
                        </Badge>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
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
                            {application.listing?.workMode === 'remote' && (
                                <Badge variant="outline" className="ml-1 h-4 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-600">
                                    Remote
                                </Badge>
                            )}
                        </span>

                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            Applied {format(new Date(application.createdAt), "dd MMM yyyy")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0">
                <StatusBadge status={appStatus} />

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full cursor-pointer bg-slate-50 hover:bg-primary/10 hover:text-primary transition-colors border-secondary/20"
                        asChild
                    >
                        <Link href={`/user-dashboard/applications/${application._id}`}>
                            <Eye className="h-4 w-4 text-slate-600" />
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isActionDisabled || appStatus === 'withdrawn'}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 rounded-full px-3 cursor-pointer disabled:cursor-not-allowed font-semibold"
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Withdraw
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently withdraw your application for the <strong>{application.listing?.title}</strong> role.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => withdrawApplication(application._id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer font-bold"
                                >
                                    Withdraw Application
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
