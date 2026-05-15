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
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Account <span className="text-[#1877F2]">Settings</span>
        </h1>
        <p className="text-gray-500 mt-2">Manage your profile, security, and preferences.</p>
      </div>

      <div className="space-y-8">
        {/* ── Account Info Card ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-[#1877F2]">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Profile Information</h2>
              <p className="text-xs text-gray-500">Update your name and contact details</p>
            </div>
          </div>

          {/* Read-only info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:w-32">Email</span>
              <span className="text-sm font-bold text-gray-700">{user?.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:w-32">Role</span>
              <span className="text-sm font-bold text-gray-700 capitalize">{user?.role}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:w-32">Member since</span>
              <span className="text-sm font-bold text-gray-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#1877F2] outline-none transition-all"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#1877F2] outline-none transition-all"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Contact Number</label>
              <input
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-[#1877F2] outline-none transition-all"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-gray-400 mt-1.5 pl-1">Include country code, e.g. +91</p>
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#1877F2] hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 shadow-md shadow-blue-200"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Lock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-500">Update your account password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-orange-400 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-orange-400 outline-none transition-all"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white outline-none transition-all ${
                  confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400" : "border-gray-100 focus:border-orange-400"
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
              className="flex items-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-2xl transition-all disabled:opacity-60 shadow-md shadow-orange-100"
            >
              {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Update Password
            </button>
          </form>
        </div>

        {/* ── Danger Zone ── */}
        <div className="bg-white border border-red-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Account Details</h2>
              <p className="text-xs text-gray-500">Your account information at a glance</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-700">Account Status</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-black rounded-full">Active & Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-700">Email Verified</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-black rounded-full">✓ Yes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
