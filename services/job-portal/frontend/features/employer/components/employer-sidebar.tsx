"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Building2,
  Settings,
  LogOut,
  PlusCircle,
  Settings2,
  User as UserIcon,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { SidebarNavItem } from "@/components/sidebar-nav-item"
import Logo from "@/components/logo"
import { useGetMyCompanyDetails } from "@/features/employer/hooks/use-company"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/employer-dashboard" },
  { label: "Post a Job / Internship", icon: PlusCircle, href: "/employer-dashboard/jobs/create" },
  { label: "Manage Jobs", icon: Briefcase, href: "/employer-dashboard/jobs/manage" },
  { label: "Manage Internships", icon: Briefcase, href: "/employer-dashboard/internships/manage" },
  { label: "All Applications", icon: FileText, href: "/employer-dashboard/applications" },
  { label: "Manage Team", icon: Users, href: "/employer-dashboard/team" },
  { label: "Settings", icon: Settings2, href: "/employer-dashboard/settings" },
]

export default function EmployerSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const handleLogout = () => signOut({ callbackUrl: "/login" });
  const { data: session } = useSession();

  const userDetails = session?.user;
  const companyRole = userDetails?.companyRole;

  const { data: responseData } = useGetMyCompanyDetails();
  const planName = responseData?.data?.currentPlan?.name || "Free Tier";

  const roleBasedItems = companyRole === "owner" ? menuItems : menuItems.filter(item => item.label !== "Manage Team");

  return (
    <div className={cn("flex flex-col border-r bg-background/80 backdrop-blur-xl shadow-sm", className)}>
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {roleBasedItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            )
          })}
        </nav>
        <div className="px-4 py-4 mt-auto">
          <div className="rounded-xl bg-[#2563eb] p-4 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] space-y-3 relative overflow-hidden transition-all hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5">
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col gap-1">
              <span className="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest drop-shadow-sm">{planName}</span>
              <span className="text-lg font-bold leading-tight font-heading">Upgrade to Pro</span>
            </div>
            <Button variant="secondary" size="sm" asChild className="w-full relative z-10 rounded-lg font-bold text-[#2563eb] bg-white hover:bg-slate-50 shadow-sm cursor-pointer h-9 px-0">
              <Link href="/employer-dashboard/plans">
                Get Access
              </Link>
            </Button>
          </div>
        </div>

      </div>

      {session?.user && (
        <div className="border-t border-border/50 p-4 z-10 bg-background/80 backdrop-blur-md shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors border border-transparent hover:border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-sm ring-2 ring-background">
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "E"}
                  </div>
                  <div className="flex flex-col truncate w-[130px]">
                    <span className="text-sm font-bold text-foreground leading-tight truncate">{session.user.name || "Employer"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider truncate">
                      {companyRole === 'owner' ? 'Owner / Admin' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[230px] ml-4 mb-2 bg-white dark:bg-slate-900 border-border shadow-2xl rounded-xl z-50">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1.5 p-1">
                  <p className="text-sm font-bold leading-none">{session.user.name}</p>
                  <p className="text-muted-foreground text-xs leading-none break-all">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer py-2 text-sm font-medium">
                <Link href="/profile" className="flex items-center text-foreground cursor-pointer w-full">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer py-2 text-sm font-medium">
                <Link href="/employer-dashboard/company-profile" className="flex items-center text-primary cursor-pointer w-full">
                  <Building2 className="mr-2 h-4 w-4 text-primary" /> My Company
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive font-bold focus:bg-destructive/10 flex cursor-pointer items-center py-2"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}