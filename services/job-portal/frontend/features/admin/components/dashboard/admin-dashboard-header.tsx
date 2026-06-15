import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearch } from "@/features/admin/components/global-search";
import { CreatePlanDialog } from "@/features/admin/components/create-plan-dialog";
import { CreateCouponDialog } from "@/features/admin/components/create-coupon-dialog";
import { useNavSession } from "@/hooks/use-nav-session";
import { useGetUserDetails } from "@/hooks/use-user";

interface AdminDashboardHeaderProps {
    hasNotifications: boolean;
    summary: { kycPending: number };
    recentEmployers: any[];
}

export function AdminDashboardHeader({
    hasNotifications,
    summary,
    recentEmployers,
}: AdminDashboardHeaderProps) {
    const [createPlanOpen, setCreatePlanOpen] = React.useState(false);
    const { isAuthenticated } = useNavSession();
    const { data: userProfileData } = useGetUserDetails(isAuthenticated);

    // Feature Check identical to Dark Mode
    const allowedFeatures = userProfileData?.data?.allowedFeatures || [];
    const canUseNotifications = allowedFeatures.includes("notification-system");

    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <h1 className="text-[1.4rem] font-bold text-slate-900 dark:text-white">
                Overview
            </h1>
            <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center justify-end gap-3 sm:gap-4">
                <div className="flex items-center justify-start sm:justify-end w-full sm:w-auto gap-4">
                    <div className="flex-1 sm:flex-none">
                        <GlobalSearch onCreatePlan={() => setCreatePlanOpen(true)} />
                    </div>
                    {canUseNotifications && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full size-10 bg-slate-100 dark:bg-slate-800 hidden sm:flex text-slate-500 hover:text-slate-900 dark:hover:text-white relative"
                            >
                                {hasNotifications && (
                                    <div className="absolute top-2 right-2.5 size-2 bg-rose-500 rounded-full animate-pulse z-10" />
                                )}
                                <Bell className="size-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px]">
                            <DropdownMenuLabel className="font-bold text-base">
                                Notifications
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="flex flex-col gap-1 p-1 max-h-64 overflow-y-auto">
                                {summary.kycPending > 0 && (
                                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer" asChild>
                                        <Link href="/admin-dashboard/kyc">
                                            <span className="font-semibold text-sm text-[#2563eb]">
                                                Verification Pending
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {summary.kycPending} new companies require KYC approval.
                                            </span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                {recentEmployers && recentEmployers.length > 0 && (
                                    <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                                        <span className="font-semibold text-sm text-[#2563eb]">
                                            Recent Registrations
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {recentEmployers[0].name} just registered recently.
                                        </span>
                                    </DropdownMenuItem>
                                )}

                                {!hasNotifications && (
                                    <span className="text-sm p-4 text-slate-500 text-center">
                                        No new notifications.
                                    </span>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="w-full h-8 text-xs text-[#2563eb] font-bold"
                            >
                                <Link href="/admin-dashboard/users">View Activity Log</Link>
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <CreateCouponDialog>
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-none rounded-xl h-10 px-5 text-sm font-semibold shadow-sm shadow-blue-500/20 cursor-pointer"
                        >
                            Create Coupon
                        </Button>
                    </CreateCouponDialog>
                    <CreatePlanDialog open={createPlanOpen} onOpenChange={setCreatePlanOpen}>
                        <Button
                            size="sm"
                            className="flex-1 sm:flex-none rounded-xl h-10 px-5 text-sm font-semibold shadow-sm shadow-blue-500/20 cursor-pointer"
                        >
                            Create Plan
                        </Button>
                    </CreatePlanDialog>
                </div>
            </div>
        </div>
    );
}
