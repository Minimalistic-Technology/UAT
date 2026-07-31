"use client";

import { useState } from "react";
import {
    Settings,
    BellRing,
    RefreshCw,
    Database,
    Save,
    Activity,
    CheckCircle,
    UserCheck
} from "lucide-react";

interface SettingsViewProps {
    user: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    showToast: (msg: string, type: "success" | "error") => void;
}

export default function SettingsView({
    user,
    showToast
}: SettingsViewProps) {
    const [threshold, setThreshold] = useState("25");
    const [intervalMode, setIntervalMode] = useState("10");
    const [dbChecking, setDbChecking] = useState(false);
    const [dbStatus, setDbStatus] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSaveSettings = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            showToast("Warehouse threshold and settings updated!", "success");
        }, 1200);
    };

    const handleVerifyConnection = () => {
        setDbChecking(true);
        setTimeout(() => {
            setDbChecking(false);
            setDbStatus("Connected (Latency: 2ms)");
            showToast("Facility database status online!", "success");
        }, 1000);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="size-5 text-teal-650" />
                        Logistics & Facility Configurations
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Customize real-time active system monitoring, threshold metrics, credentials checks.</p>
                </div>

                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-teal-600 dark:bg-teal-700 hover:bg-teal-750 dark:hover:bg-teal-650 text-white rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-xs leading-none"
                >
                    {saving ? (
                        <Activity className="size-3.5 animate-spin" />
                    ) : (
                        <Save className="size-3.5" />
                    )}
                    Save Thresholds
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* System Notifications Configuration Panel */}
                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col gap-4">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <BellRing className="size-4.5 text-teal-600" /> Notifications & Safe Buffers
                    </h4>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                                Low Stock Alert Safeguard Threshold
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                    className="w-20 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg py-1.5 text-xs font-black text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono shadow-inner"
                                />
                                <span className="text-[11px] text-slate-450 dark:text-slate-500 font-bold">Units (Alert fires if product falls below this count)</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                                Autocutoff Order Dispatch Checks
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="accent-teal-600 size-3.5" /> Enforce Courier Limits
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="accent-teal-600 size-3.5" /> Auto Print Invoice Slip
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Connectivity and Sync Configurations */}
                <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                            <RefreshCw className="size-4 text-teal-600 animate-spin" /> Synchronize & Network Latency
                        </h4>

                        <div className="space-y-4 mt-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                                    Silent Background Polling Sync Interval
                                </label>
                                <select
                                    value={intervalMode}
                                    onChange={(e) => setIntervalMode(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 text-xs font-black text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-inner"
                                >
                                    <option value="10">High Frequency (Every 10 Seconds)</option>
                                    <option value="30">Medium Frequency (Every 30 Seconds)</option>
                                    <option value="60">Low Frequency (Every 60 Seconds)</option>
                                    <option value="0">Complete Manual Sync Only</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between border-t border-slate-202 dark:border-slate-800/80 pt-3">
                        <div className="text-left">
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Connection State</span>
                            <span className="text-[10px] font-extrabold text-emerald-600 mt-1 block">
                                {dbStatus ? dbStatus : "Online, ready to verify"}
                            </span>
                        </div>

                        <button
                            onClick={handleVerifyConnection}
                            disabled={dbChecking}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/20 text-[10px] font-black uppercase text-slate-655 dark:text-slate-350"
                        >
                            <Database className="size-3" /> {dbChecking ? "Testing..." : "Verify Network"}
                        </button>
                    </div>
                </div>
            </div>

            {/* General Operator Account clearance info card */}
            <div className="border border-slate-200 dark:border-slate-850 rounded-2xl p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-955">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-teal-500/10 text-teal-605 dark:text-teal-400 rounded-full flex items-center justify-center shrink-0">
                        <UserCheck className="size-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">Active Operator Facility Clearance Info</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium mt-0.5">Clearing level verified for warehouse accounts: {user.email || "warehouse@ddtec.com"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
