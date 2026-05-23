"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, Bell, Shield, Loader2, Save, Eye, EyeOff, Mail, Calendar, CheckCircle } from "lucide-react";

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
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
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setContactNumber((user as any).contactNumber || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await api.patch("/auth/profile", { firstName, lastName, contactNumber });
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Page Header */}
      <div className="mb-10 sm:mb-14 border-b border-theme-accent/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Account <span className="text-theme-action">Settings</span>
          </h1>
          <p className="text-foreground/60 mt-3 text-sm sm:text-base max-w-2xl">
            Manage your personal profile, security preferences, and view your account details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

        {/* LEFT COLUMN: Profile & Account Details */}
        <div className="lg:col-span-7 space-y-8 lg:space-y-10">

          {/* ── Account Info Card ── */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-action/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-theme-action/10 rounded-2xl flex items-center justify-center text-theme-action border border-theme-action/20">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Profile Information</h2>
                <p className="text-sm text-foreground/50 mt-1">Update your name and contact details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">First Name</label>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-theme-element-sec/50 border-2 border-theme-accent/10 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action hover:border-theme-accent/30"
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Last Name</label>
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-theme-element-sec/50 border-2 border-theme-accent/10 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action hover:border-theme-accent/30"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Contact Number</label>
                <input
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3.5 bg-theme-element-sec/50 border-2 border-theme-accent/10 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action hover:border-theme-accent/30"
                  placeholder="+91 98765 43210"
                />
                <p className="text-xs text-foreground/50 pt-1">Include country code, e.g. +91</p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-theme-action text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 hover:-translate-y-1 hover:shadow-lg hover:shadow-theme-action/20 active:translate-y-0"
                >
                  {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* ── Account Details (Read-only) ── */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-theme-accent/5 rounded-xl flex items-center justify-center text-foreground/60 border border-theme-accent/10">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">Account Details</h2>
                <p className="text-xs text-foreground/50 mt-1">Your system identity and status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-theme-element-sec/50 rounded-2xl border border-theme-accent/10 flex items-start gap-4">
                <div className="mt-1 text-theme-action/70"><Mail size={18} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1">Email Address</p>
                  <p className="text-sm font-bold text-foreground/90 break-all">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black rounded-full">
                    <CheckCircle size={10} /> Verified
                  </div>
                </div>
              </div>

              <div className="p-4 bg-theme-element-sec/50 rounded-2xl border border-theme-accent/10 flex items-start gap-4">
                <div className="mt-1 text-foreground/40"><Shield size={18} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1">Account Role</p>
                  <p className="text-sm font-bold text-foreground/90 capitalize">{user?.role}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black rounded-full">
                    Active User
                  </div>
                </div>
              </div>

              <div className="p-4 bg-theme-element-sec/50 rounded-2xl border border-theme-accent/10 flex items-start gap-4 sm:col-span-2">
                <div className="mt-1 text-foreground/40"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1">Member Since</p>
                  <p className="text-sm font-bold text-foreground/90">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Password & Security */}
        <div className="lg:col-span-5 space-y-8 lg:space-y-10">

          {/* ── Change Password Card ── */}
          <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Security</h2>
                <p className="text-sm text-foreground/50 mt-1">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-theme-element-sec/50 border-2 border-theme-accent/10 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-orange-500 hover:border-theme-accent/30"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                    {showCurrentPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 bg-theme-element-sec/50 border-2 border-theme-accent/10 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-orange-500 hover:border-theme-accent/30"
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-theme-element-sec/50 border-2 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background hover:border-theme-accent/30 ${confirmPassword && confirmPassword !== newPassword ? "border-red-500/50 focus:border-red-500" : "border-theme-accent/10 focus:border-orange-500"
                    }`}
                  placeholder="Repeat new password"
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 font-bold mt-2 pl-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span> Passwords do not match
                  </p>
                )}
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 active:translate-y-0"
                >
                  {isSavingPassword ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
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
