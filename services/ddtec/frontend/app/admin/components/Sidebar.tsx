"use client";

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

export type AdminView =
    | "dashboard"
    | "products"
    | "users"
    | "orders"
    | "inventory"
    | "messages"
    | "coupons"
    | "blogs"
    | "categories"
    | "settings"
    | "dynamic_routes"
    | "quotation_products"
    | "create_quotation"
    | "saved_quotations"
    | "schedule_mail"
    | "contacts"
    | "leads"
    | "clients"
    | "company";

export interface NavItem {
    view: AdminView;
    label: string;
    icon: LucideIcon;
    // Other views that should also light up this nav item (e.g. sub-views)
    matches?: AdminView[];
    boldLabel?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
    { view: "dashboard", label: "Overview", icon: Layers },
    { view: "categories", label: "Categories", icon: Folder },
    { view: "products", label: "Products", icon: Package },
    { view: "inventory", label: "Inventory", icon: Layers },
    {
        view: "saved_quotations",
        label: "Quotation",
        icon: FileText,
        matches: ["saved_quotations", "create_quotation", "quotation_products"],
        boldLabel: true,
    },
    { view: "orders", label: "Orders", icon: ShoppingBag },
    { view: "users", label: "User & Staff", icon: Users },
    { view: "messages", label: "Messages", icon: Mail },
    { view: "coupons", label: "Coupons", icon: Ticket },
    { view: "schedule_mail", label: "Schedule Mail", icon: Calendar },
    { view: "contacts", label: "Contacts", icon: Users },
    { view: "leads", label: "Lead", icon: Activity },
    { view: "clients", label: "Client", icon: Users },
    { view: "company", label: "Company", icon: Building2 },
    { view: "blogs", label: "Blogs", icon: Edit },
    { view: "settings", label: "Site Settings", icon: Settings },
    { view: "dynamic_routes", label: "Dynamic Routes", icon: Activity },
];

interface SidebarProps {
    activeView: AdminView;
    onViewChange: (view: AdminView) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
}

export default function Sidebar({ activeView, onViewChange, collapsed, onToggleCollapsed }: SidebarProps) {
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
                    {ADMIN_NAV_ITEMS.map(({ view, label, icon: Icon, matches, boldLabel }) => {
                        const isActive = matches ? matches.includes(activeView) : activeView === view;
                        return (
                            <li key={view}>
                                <button
                                    onClick={() => onViewChange(view)}
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
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}
