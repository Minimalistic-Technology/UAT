"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    Package,
    ShoppingBag,
    Layers,
    Ticket,
    ChevronLeft,
    ChevronRight,
    Mail,
    Folder,
    Settings,
    Activity,
    FileText,
    Calendar,
    Edit,
    Building2,
    LucideIcon,
} from "lucide-react";

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    boldLabel?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
    { href: "/admin", label: "Overview", icon: Layers },
    { href: "/admin/categories", label: "Categories", icon: Folder },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Layers },
    { href: "/admin/quotation-products", label: "Quotation Products", icon: FileText },
    { href: "/admin/create-quotation", label: "Create Quotation", icon: FileText },
    { href: "/admin/saved-quotations", label: "Saved Quotations", icon: FileText },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/users", label: "User & Staff", icon: Users },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/schedule-mail", label: "Schedule Mail", icon: Calendar },
    { href: "/admin/contacts", label: "Contacts", icon: Users },
    { href: "/admin/leads", label: "Lead", icon: Activity },
    { href: "/admin/clients", label: "Client", icon: Users },
    { href: "/admin/company", label: "Company", icon: Building2 },
    { href: "/admin/blogs", label: "Blogs", icon: Edit },
    { href: "/admin/settings", label: "Site Settings", icon: Settings },
    { href: "/admin/dynamic-routes", label: "Dynamic Routes", icon: Activity },
];

// Is this nav item the active one for the given pathname? "/admin" only matches
// exactly (it's the dashboard index); every other item matches its own subtree too.
export function isNavItemActive(href: string, pathname: string | null): boolean {
    if (!pathname) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
}

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapsed: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen pt-24 transition-all duration-300 bg-white border-r border-slate-200 dark:bg-slate-800 dark:border-slate-700 ${collapsed ? "w-20" : "w-64"} -translate-x-full md:translate-x-0`}
            aria-label="Sidebar"
        >
            {/* Toggle Button */}
            <button
                onClick={onToggleCollapsed}
                className="hidden md:block absolute -right-3 top-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-50 text-slate-500 cursor-pointer"
            >
                {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>

            <div className="h-full px-3 py-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-800 scrollbar-hide">
                <ul className="space-y-2 font-medium">
                    {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon, boldLabel }) => {
                        const isActive = isNavItemActive(href, pathname);
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    title={collapsed ? label : undefined}
                                    className={`w-full flex items-center p-2 rounded-lg group cursor-pointer ${isActive
                                            ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                                            : "text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <Icon className="size-5 shrink-0 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                    <span
                                        className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${boldLabel ? "font-semibold" : ""} ${collapsed ? "max-w-0 opacity-0 ms-0" : "max-w-[160px] opacity-100 ms-3"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
