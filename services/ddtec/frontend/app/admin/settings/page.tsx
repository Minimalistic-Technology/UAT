"use client";

import { useEffect, useState } from "react";
import { Loader2, Truck, Image as ImageIcon, Shield, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../../_context/ToastContext";
import { useSettings } from "../../_context/SettingsContext";

export default function SettingsPage() {
    const { showToast } = useToast();
    const { refreshSettings } = useSettings();

    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [quotationLogoUrlDraft, setQuotationLogoUrlDraft] = useState<string>("");

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await api.get('/settings');
            setSiteSettings(res.data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        setQuotationLogoUrlDraft(siteSettings?.quotationLogoUrl || "");
    }, [siteSettings?.quotationLogoUrl]);

    const toggleSettingComponent = async (componentKey: string, currentValue: boolean) => {
        if (!siteSettings) return;
        try {
            const updatedComponents = {
                ...siteSettings.components,
                [componentKey]: !currentValue
            };
            const res = await api.put('/settings', { components: updatedComponents });
            setSiteSettings(res.data);
            refreshSettings();
        } catch (error: any) {
            showToast(error.response?.data?.msg || "Failed to update settings", "error");
        }
    };

    const updateOnboardingSetting = (key: string, value: any) => {
        const updatedOnboarding = {
            ...(siteSettings?.onboarding || { mode: 'open', inviteCode: 'DDTEC-INVITE-2026', closedMessage: 'New user onboarding is currently restricted by administrator.' }),
            [key]: value
        };
        setSiteSettings((prev: any) => ({
            ...prev,
            onboarding: updatedOnboarding
        }));
        saveOnboardingConfig(updatedOnboarding);
    };

    const saveOnboardingConfig = async (onboardingPayload?: any) => {
        try {
            const payload = onboardingPayload || siteSettings?.onboarding;
            const res = await api.put('/settings', { onboarding: payload });
            setSiteSettings(res.data);
            refreshSettings();
            showToast?.("User onboarding restriction settings updated!", "success");
        } catch (error: any) {
            showToast?.("Failed to update onboarding settings", "error");
        }
    };

    const updateDeliverySetting = (key: string, value: any) => {
        const updatedDelivery = {
            ...(siteSettings?.delivery || { freeDeliveryThreshold: 500, flatDeliveryFee: 50, isFreeDeliveryEnabled: true }),
            [key]: value
        };
        setSiteSettings((prev: any) => ({
            ...prev,
            delivery: updatedDelivery
        }));
    };

    const saveDeliveryConfig = async (deliveryPayload?: any) => {
        try {
            const payload = deliveryPayload || siteSettings?.delivery || { freeDeliveryThreshold: 500, flatDeliveryFee: 50, isFreeDeliveryEnabled: true };
            const res = await api.put('/settings', { delivery: payload });
            setSiteSettings(res.data);
            refreshSettings();
            showToast?.("Delivery & shipping settings updated successfully!", "success");
        } catch (error: any) {
            showToast?.("Failed to update delivery settings", "error");
        }
    };

    const saveQuotationLogoUrl = async () => {
        try {
            const res = await api.put('/settings', { quotationLogoUrl: quotationLogoUrlDraft.trim() });
            setSiteSettings(res.data);
            refreshSettings();
            showToast?.("Quotation logo updated successfully!", "success");
        } catch (error: any) {
            showToast?.("Failed to update quotation logo", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">Configure global application states, features, and visibility of homepage sections.</p>
            </div>

            {loadingSettings && !siteSettings ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="animate-spin size-8 text-teal-600" />
                </div>
            ) : (
                siteSettings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Authentication Controls */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authentication & Access</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control login options for the website. The Signup link is shown automatically whenever registration isn't restricted below.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <ToggleSwitch
                                        isOn={siteSettings.components.Login !== false}
                                        onToggle={() => toggleSettingComponent('Login', siteSettings.components.Login !== false)}
                                        label="Allow Public Logins"
                                        description="When disabled, public login is blocked (admins and staff bypass this restriction to avoid lockout)."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Delivery & Shipping Rates Controls */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Truck className="size-5 text-teal-600" /> Delivery & Shipping Rates
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure free delivery threshold and standard shipping fees.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <ToggleSwitch
                                        isOn={siteSettings.delivery?.isFreeDeliveryEnabled !== false}
                                        onToggle={() => {
                                            const currentVal = siteSettings.delivery?.isFreeDeliveryEnabled !== false;
                                            updateDeliverySetting('isFreeDeliveryEnabled', !currentVal);
                                            saveDeliveryConfig({ ...(siteSettings.delivery || {}), isFreeDeliveryEnabled: !currentVal });
                                        }}
                                        label="Enable Free Delivery Tier"
                                        description="Automatically waive delivery fee when cart total exceeds threshold."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                            Free Delivery Threshold (₹)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="10"
                                                value={siteSettings.delivery?.freeDeliveryThreshold ?? 500}
                                                onChange={(e) => updateDeliverySetting('freeDeliveryThreshold', Number(e.target.value))}
                                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Orders at or above this amount get free delivery</p>
                                    </div>

                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                            Standard Shipping Fee (₹)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="5"
                                                value={siteSettings.delivery?.flatDeliveryFee ?? 50}
                                                onChange={(e) => updateDeliverySetting('flatDeliveryFee', Number(e.target.value))}
                                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Applied on orders below free delivery threshold</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => saveDeliveryConfig()}
                                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    Save Delivery Settings
                                </button>
                            </div>
                        </div>

                        {/* Quotation Branding Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 col-span-1 md:col-span-2">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ImageIcon className="size-5 text-teal-600" /> Quotation Logo
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Shown at the top of every generated Quotation PDF. Provide a direct image URL (PNG/JPEG) — no file upload.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                                        Logo Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={quotationLogoUrlDraft}
                                        onChange={(e) => setQuotationLogoUrlDraft(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                {quotationLogoUrlDraft && (
                                    <img
                                        src={quotationLogoUrlDraft}
                                        alt="Quotation logo preview"
                                        className="h-14 max-w-[140px] object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1.5"
                                        onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                                        onLoad={(e) => { (e.target as HTMLImageElement).style.visibility = 'visible'; }}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={saveQuotationLogoUrl}
                                className="w-full sm:w-auto py-2.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                Save Quotation Logo
                            </button>
                        </div>

                        {/* User Onboarding Restrictions Control Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 col-span-1 md:col-span-2">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Shield className="size-5 text-teal-600" /> Restrict New User Onboarding
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Select how new users can register on your platform. Restrict, require invitation code, or demand manual admin approval.
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-lg uppercase">
                                    Mode: {siteSettings.onboarding?.mode || 'open'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Mode 1: Open */}
                                <button
                                    type="button"
                                    onClick={() => updateOnboardingSetting('mode', 'open')}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'open' ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🟢 Open Registration</span>
                                        {siteSettings.onboarding?.mode === 'open' && <CheckCircle2 className="size-4 text-teal-600" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Anyone can sign up freely without restriction.
                                    </p>
                                </button>

                                {/* Mode 2: Closed */}
                                <button
                                    type="button"
                                    onClick={() => updateOnboardingSetting('mode', 'closed')}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'closed' ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🔴 Closed / Paused</span>
                                        {siteSettings.onboarding?.mode === 'closed' && <CheckCircle2 className="size-4 text-rose-600" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Completely block all new user signups.
                                    </p>
                                </button>

                                {/* Mode 3: Invite Only */}
                                <button
                                    type="button"
                                    onClick={() => updateOnboardingSetting('mode', 'invite_only')}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'invite_only' ? 'border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🔑 Invite-Only Code</span>
                                        {siteSettings.onboarding?.mode === 'invite_only' && <CheckCircle2 className="size-4 text-cyan-600" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Requires entering secret invitation code.
                                    </p>
                                </button>

                                {/* Mode 4: Admin Approval */}
                                <button
                                    type="button"
                                    onClick={() => updateOnboardingSetting('mode', 'admin_approval')}
                                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${siteSettings.onboarding?.mode === 'admin_approval' ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-600/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-sm text-slate-900 dark:text-white">🛡️ Admin Approval</span>
                                        {siteSettings.onboarding?.mode === 'admin_approval' && <CheckCircle2 className="size-4 text-amber-600" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        New accounts stay inactive until Admin approves.
                                    </p>
                                </button>
                            </div>

                            {/* Config Inputs */}
                            {siteSettings.onboarding?.mode === 'invite_only' && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                        Secret Invitation Code (Users must provide this code during registration)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteSettings.onboarding?.inviteCode || 'DDTEC-INVITE-2026'}
                                            onChange={(e) => updateOnboardingSetting('inviteCode', e.target.value.toUpperCase())}
                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => saveOnboardingConfig()}
                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                                        >
                                            Save Code
                                        </button>
                                    </div>
                                </div>
                            )}

                            {siteSettings.onboarding?.mode === 'closed' && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                        Custom Registration Closed Message
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={siteSettings.onboarding?.closedMessage || 'New user onboarding is currently restricted by administrator.'}
                                            onChange={(e) => updateOnboardingSetting('closedMessage', e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => saveOnboardingConfig()}
                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
                                        >
                                            Save Message
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Home Page Sections Control */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Homepage Sections Visibility</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dynamically enable or disable major landing page features.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                                {[
                                    { key: 'Hero', label: 'Hero Banner', desc: 'Main intro banner section at the top of the homepage.' },
                                    { key: 'WhoWeAre', label: 'Who We Are', desc: 'About section describing the company and goals.' },
                                    { key: 'WhatWeOffer', label: 'What We Offer', desc: 'Listing of key services or features provided.' },
                                    { key: 'FeaturedProducts', label: 'Featured Products Slider', desc: 'Showcase highlighted products to homepage visitors.' },
                                    { key: 'ShopSection', label: 'Shop/Products Grid', desc: 'Main product list catalog layout.' },
                                    { key: 'Contact', label: 'Contact Form & Location', desc: 'Contact page form and map details.' },
                                    { key: 'Footer', label: 'Footer Bar', desc: 'Bottom navigation links and copyright information.' }
                                ].map((section) => (
                                    <div key={section.key} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                        <ToggleSwitch
                                            isOn={siteSettings.components[section.key] !== false}
                                            onToggle={() => toggleSettingComponent(section.key, siteSettings.components[section.key] !== false)}
                                            label={section.label}
                                            description={section.desc}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
