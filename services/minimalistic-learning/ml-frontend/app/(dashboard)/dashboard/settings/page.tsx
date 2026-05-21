"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Lock, Bell, Shield, Loader2, Save, Eye, EyeOff } from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto px-[5%] py-24 sm:py-32">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Account <span className="text-theme-action">Settings</span>
        </h1>
        <p className="text-foreground/70 mt-2">Manage your profile, security, and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* ── Account Info Card ── */}
        <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-theme-action/10 rounded-xl flex items-center justify-center text-theme-action border border-theme-action/20">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Profile Information</h2>
              <p className="text-xs text-foreground/50">Update your name and contact details</p>
            </div>
          </div>

          {/* Read-only info */}
          <div className="mb-6 p-4 bg-theme-element-sec rounded-2xl border border-theme-accent/20">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="text-xs font-black text-foreground/50 uppercase tracking-widest sm:w-32">Email</span>
              <span className="text-sm font-bold text-foreground/80">{user?.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-3">
              <span className="text-xs font-black text-foreground/50 uppercase tracking-widest sm:w-32">Role</span>
              <span className="text-sm font-bold text-foreground/80 capitalize">{user?.role}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-3">
              <span className="text-xs font-black text-foreground/50 uppercase tracking-widest sm:w-32">Member since</span>
              <span className="text-sm font-bold text-foreground/80">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-theme-element-sec border-2 border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-theme-element-sec border-2 border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Contact Number</label>
              <input
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-4 py-3.5 bg-theme-element-sec border-2 border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-theme-action"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-foreground/50 mt-1.5 pl-1">Include country code, e.g. +91</p>
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-6 py-3.5 bg-theme-action text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 hover:scale-105 active:scale-95 shadow-md shadow-theme-action/20"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Change Password</h2>
              <p className="text-xs text-foreground/50">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-theme-element-sec border-2 border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-orange-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground">
                  {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-theme-element-sec border-2 border-theme-accent/20 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background focus:border-orange-500"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground">
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3.5 bg-theme-element-sec border-2 rounded-2xl text-sm font-bold text-foreground outline-none transition-all focus:bg-background ${confirmPassword && confirmPassword !== newPassword ? "border-red-500/50 focus:border-red-500" : "border-theme-accent/20 focus:border-orange-500"
                  }`}
                placeholder="Repeat new password"
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500 font-bold mt-1.5 pl-1">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSavingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 hover:scale-105 active:scale-95 shadow-md shadow-orange-500/20"
            >
              {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Update Password
            </button>
          </form>
        </div>

        {/* ── Danger Zone ── */}
        <div className="bg-theme-element border border-theme-accent/20 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">Account Details</h2>
              <p className="text-xs text-foreground/50">Your account information at a glance</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-theme-element-sec border border-theme-accent/10 rounded-2xl">
              <span className="text-sm font-bold text-foreground/80">Account Status</span>
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black rounded-full">Active & Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-theme-element-sec border border-theme-accent/10 rounded-2xl">
              <span className="text-sm font-bold text-foreground/80">Email Verified</span>
              <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black rounded-full">✓ Yes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
