"use client";

import { useState } from "react";
import {
  Settings2,
  Newspaper,
  BookOpen,
  Shield,
  Users,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

import {
  SystemTab,
  PermissionsTab,
  UsersTab,
  HomepageTab,
  SubscribersTab,
  TeamTab,
} from "./tabs";

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    "system" | "permissions" | "users" | "homepage" | "subscribers" | "team"
  >("system");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── PANEL HEADER ────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-foreground text-background flex h-10 w-10 items-center justify-center rounded-xl shadow-lg">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-black tracking-tight">
              System & DB Administration
            </h2>
            <p className="text-foreground/50 text-xs font-bold tracking-widest uppercase">
              Admin Dashboard Engine
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/blog-history"
          className="group bg-theme-element border-theme-accent/20 text-foreground hover:bg-theme-element-sec hover:border-theme-accent/40 flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold shadow-sm transition-all"
        >
          <Newspaper
            size={16}
            className="text-foreground/50 group-hover:text-theme-action transition-colors"
          />
          Access Content History
        </Link>
      </div>

      {/* ── TAB BAR NAVIGATION ──────────────────────────────────── */}
      <div className="border-theme-accent/10 mb-8 flex flex-wrap gap-4 border-b pb-3 sm:gap-8">
        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "system" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <Settings2
            size={16}
            className={
              activeTab === "system"
                ? "text-theme-action"
                : "text-foreground/45"
            }
          />
          System Settings & Queue
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "permissions" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <Shield
            size={16}
            className={
              activeTab === "permissions"
                ? "text-theme-action"
                : "text-foreground/45"
            }
          />
          Route & RBAC Control
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("users")}
          onMouseEnter={() => {
            queryClient.prefetchQuery({
              queryKey: ["admin_users"],
              queryFn: async () =>
                (await api.get("/admin/users")).data?.data || [],
            });
          }}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "users" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <Users
            size={16}
            className={
              activeTab === "users" ? "text-theme-action" : "text-foreground/45"
            }
          />
          User Accounts
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("homepage")}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "homepage" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <BookOpen
            size={16}
            className={
              activeTab === "homepage"
                ? "text-theme-action"
                : "text-foreground/45"
            }
          />
          Homepage Layout
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "subscribers" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <Mail
            size={16}
            className={
              activeTab === "subscribers"
                ? "text-theme-action"
                : "text-foreground/45"
            }
          />
          Subscribers
        </Button>

        <Button
          variant="none"
          size="none"
          onClick={() => setActiveTab("team")}
          onMouseEnter={() => {
            queryClient.prefetchQuery({
              queryKey: ["admin_team"],
              queryFn: async () =>
                (await api.get("/public/team")).data?.data || [],
            });
          }}
          className={`flex items-center gap-2 pb-2 text-xs font-black tracking-widest uppercase transition-all sm:text-sm ${activeTab === "team" ? "text-theme-action border-theme-action scale-100 border-b-2" : "text-foreground/50 hover:text-foreground scale-95"}`}
        >
          <UserIcon
            size={16}
            className={
              activeTab === "team" ? "text-theme-action" : "text-foreground/45"
            }
          />
          Team Management
        </Button>
      </div>

      {/* ── TAB CONTENT RENDERING ──────────────────────────────── */}
      {activeTab === "system" && <SystemTab />}
      {activeTab === "permissions" && <PermissionsTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "homepage" && <HomepageTab />}
      {activeTab === "subscribers" && <SubscribersTab />}
      {activeTab === "team" && <TeamTab />}
    </div>
  );
};

export default AdminPanel;
