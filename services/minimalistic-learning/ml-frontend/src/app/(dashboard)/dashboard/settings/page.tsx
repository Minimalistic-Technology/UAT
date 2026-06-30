"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Lock,
  Bell,
  Shield,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Mail,
  Calendar,
  CheckCircle,
} from "lucide-react";

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Prefill on load
  useEffect(() => {
    if (user) {
      setFirstName((user as any).firstName || "");
      setLastName((user as any).lastName || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.patch("/auth/profile", { firstName, lastName });
      toast.success("Profile updated successfully!");
      refreshUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsSavingPassword(true);
    try {
      await api.patch("/auth/profile", { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="border-theme-accent/10 mb-10 flex flex-col justify-between gap-4 border-b pb-8 sm:mb-14 md:flex-row md:items-end">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
            Account <span className="text-theme-action">Settings</span>
          </h1>
          <p className="text-foreground/60 mt-3 max-w-2xl text-sm sm:text-base">
            Manage your personal profile, security preferences, and view your
            account details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Profile & Account Details */}
        <div className="space-y-8 lg:col-span-7 lg:space-y-10">
          {/* ── Account Info Card ── */}
          <div className="bg-theme-element border-theme-accent/20 group relative overflow-hidden rounded-3xl border p-6 shadow-sm sm:p-8">
            <div className="bg-theme-action/5 absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>

            <div className="relative z-10 mb-8 flex items-center gap-4">
              <div className="bg-theme-action/10 text-theme-action border-theme-action/20 flex h-12 w-12 items-center justify-center rounded-2xl border">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-foreground text-xl font-black">
                  Profile Information
                </h2>
                <p className="text-foreground/50 mt-1 text-sm">
                  Update your name details
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="relative z-10 space-y-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-theme-element-sec/50 border-theme-accent/10 text-foreground focus:bg-background focus:border-theme-action hover:border-theme-accent/30 w-full rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all outline-none"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-theme-element-sec/50 border-theme-accent/10 text-foreground focus:bg-background focus:border-theme-action hover:border-theme-accent/30 w-full rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all outline-none"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-theme-action hover:shadow-theme-action/20 flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-black text-white transition-all hover:shadow-lg disabled:opacity-60 sm:w-auto"
                >
                  {isSavingProfile ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* ── Account Details (Read-only) ── */}
          <div className="bg-theme-element border-theme-accent/20 rounded-3xl border p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-theme-accent/5 text-foreground/60 border-theme-accent/10 flex h-10 w-10 items-center justify-center rounded-xl border">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-foreground text-lg font-black">
                  Account Details
                </h2>
                <p className="text-foreground/50 mt-1 text-xs">
                  Your system identity and status
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-theme-element-sec/50 border-theme-accent/10 flex items-start gap-4 rounded-2xl border p-4">
                <div className="text-theme-action/70 mt-1">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-foreground/50 mb-1 text-[10px] font-black tracking-widest uppercase">
                    Email Address
                  </p>
                  <p className="text-foreground/90 text-sm font-bold break-all">
                    {user?.email}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] font-black text-green-500">
                    <CheckCircle size={10} /> Verified
                  </div>
                </div>
              </div>

              <div className="bg-theme-element-sec/50 border-theme-accent/10 flex items-start gap-4 rounded-2xl border p-4">
                <div className="text-foreground/40 mt-1">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-foreground/50 mb-1 text-[10px] font-black tracking-widest uppercase">
                    Account Role
                  </p>
                  <p className="text-foreground/90 text-sm font-bold capitalize">
                    {user?.role}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-black text-blue-500">
                    Active User
                  </div>
                </div>
              </div>

              <div className="bg-theme-element-sec/50 border-theme-accent/10 flex items-start gap-4 rounded-2xl border p-4 sm:col-span-2">
                <div className="text-foreground/40 mt-1">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-foreground/50 mb-1 text-[10px] font-black tracking-widest uppercase">
                    Member Since
                  </p>
                  <p className="text-foreground/90 text-sm font-bold">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Password & Security */}
        <div className="space-y-8 lg:col-span-5 lg:space-y-10">
          {/* ── Change Password Card ── */}
          <div className="bg-theme-element border-theme-accent/20 group relative overflow-hidden rounded-3xl border p-6 shadow-sm sm:p-8">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-orange-500/5 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>

            <div className="relative z-10 mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-foreground text-xl font-black">Security</h2>
                <p className="text-foreground/50 mt-1 text-sm">
                  Update your account password
                </p>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="relative z-10 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-theme-element-sec/50 border-theme-accent/10 text-foreground focus:bg-background hover:border-theme-accent/30 w-full rounded-2xl border-2 px-4 py-3.5 pr-12 text-sm font-bold transition-all outline-none focus:border-orange-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="text-foreground/40 hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                  >
                    {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-theme-element-sec/50 border-theme-accent/10 text-foreground focus:bg-background hover:border-theme-accent/30 w-full rounded-2xl border-2 px-4 py-3.5 pr-12 text-sm font-bold transition-all outline-none focus:border-orange-500"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="text-foreground/40 hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transition-colors"
                  >
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-foreground/60 block text-xs font-bold tracking-widest uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-theme-element-sec/50 text-foreground focus:bg-background hover:border-theme-accent/30 w-full rounded-2xl border-2 px-4 py-3.5 text-sm font-bold transition-all outline-none ${confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-theme-accent/10 focus:border-orange-500"
                    }`}
                  placeholder="Repeat new password"
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-2 flex items-center gap-1 pl-1 text-xs font-bold text-red-500">
                    <span className="h-1 w-1 rounded-full bg-red-500"></span>{" "}
                    Passwords do not match
                  </p>
                )}
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    isSavingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-60"
                >
                  {isSavingPassword ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Shield size={18} />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
