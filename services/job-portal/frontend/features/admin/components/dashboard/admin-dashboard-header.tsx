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
    <div className="mb-6 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h1 className="text-[1.4rem] font-bold text-slate-900 dark:text-white">
        Overview
      </h1>
      <div className="flex flex-1 flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex w-full items-center justify-start gap-4 sm:w-auto sm:justify-end">
          <div className="flex-1 sm:flex-none">
            <GlobalSearch onCreatePlan={() => setCreatePlanOpen(true)} />
          </div>
          {canUseNotifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden size-10 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 sm:flex dark:bg-slate-800 dark:hover:text-white"
                >
                  {hasNotifications && (
                    <div className="absolute top-2 right-2.5 z-10 size-2 animate-pulse rounded-full bg-rose-500" />
                  )}
                  <Bell className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <DropdownMenuLabel className="text-base font-bold">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex max-h-64 flex-col gap-1 overflow-y-auto p-1">
                  {summary.kycPending > 0 && (
                    <DropdownMenuItem
                      className="flex cursor-pointer flex-col items-start p-3"
                      asChild
                    >
                      <Link href="/admin-dashboard/kyc">
                        <span className="text-sm font-semibold text-[#2563eb]">
                          Verification Pending
                        </span>
                        <span className="text-xs text-slate-500">
                          {summary.kycPending} new companies require KYC
                          approval.
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {recentEmployers && recentEmployers.length > 0 && (
                    <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                      <span className="text-sm font-semibold text-[#2563eb]">
                        Recent Registrations
                      </span>
                      <span className="text-xs text-slate-500">
                        {recentEmployers[0].name} just registered recently.
                      </span>
                    </DropdownMenuItem>
                  )}

                  {!hasNotifications && (
                    <span className="p-4 text-center text-sm text-slate-500">
                      No new notifications.
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-full text-xs font-bold text-[#2563eb]"
                >
                  <Link href="/admin-dashboard/users">View Activity Log</Link>
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <CreateCouponDialog>
            <Button
              size="sm"
              className="h-10 flex-1 cursor-pointer rounded-xl px-5 text-sm font-semibold shadow-sm shadow-blue-500/20 sm:flex-none"
            >
              Create Coupon
            </Button>
          </CreateCouponDialog>
          <CreatePlanDialog
            open={createPlanOpen}
            onOpenChange={setCreatePlanOpen}
          >
            <Button
              size="sm"
              className="h-10 flex-1 cursor-pointer rounded-xl px-5 text-sm font-semibold shadow-sm shadow-blue-500/20 sm:flex-none"
            >
              Create Plan
            </Button>
          </CreatePlanDialog>
        </div>
      </div>
    </div>
  );
}
