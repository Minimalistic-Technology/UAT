"use client";

import React from 'react';

interface EmployeeLoginProps {
    empEmail: string;
    setEmpEmail: (email: string) => void;
    empPassword: string;
    setEmpPassword: (pass: string) => void;
    authError: string;
    handleEmployeeLogin: (e: React.FormEvent) => Promise<void>;
    setMode: (mode: any) => void;
}

export default function EmployeeLogin({
    empEmail,
    setEmpEmail,
    empPassword,
    setEmpPassword,
    authError,
    handleEmployeeLogin,
    setMode
}: EmployeeLoginProps) {
    return (
        <div className="flex flex-col min-h-screen bg-[#030014] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                        </div>
                        <span className="text-white text-lg tracking-tight">OneDrive Audit Tool</span>
                    </h1>
                </div>
            </header>

            {/* Main content with modern floating elements */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-[70vh] relative overflow-hidden">
                {/* Floating neon glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

                <div className="max-w-md w-full animate-in fade-in duration-500 relative z-10">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_80px_rgba(59,130,246,0.1)]">
                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Employee Login</h2>
                        <p className="text-gray-500 text-sm mt-2 mb-8 font-medium">
                            Access files securely shared by your administrator.
                        </p>

                        {authError && (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleEmployeeLogin} className="space-y-5 text-left">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    value={empEmail}
                                    onChange={e => setEmpEmail(e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-widest">Password</label>
                                <input
                                    type="password"
                                    value={empPassword}
                                    onChange={e => setEmpPassword(e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold hover:from-blue-600 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)]">
                                Sign In →
                            </button>
                        </form>

                        <button onClick={() => setMode('landing')} className="mt-8 text-sm font-bold text-gray-500 hover:text-white transition-colors">
                            ← Back to Admin Login
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
