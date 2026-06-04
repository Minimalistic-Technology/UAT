"use client";

import React from 'react';

interface DeviceLoginProps {
    deviceSession: { userCode: string; verificationUri: string } | null;
    setMode: (mode: any) => void;
    setDeviceSession: (session: any) => void;
    devicePolling: boolean;
}

export default function DeviceLogin({ deviceSession, setMode, setDeviceSession, devicePolling }: DeviceLoginProps) {
    if (!deviceSession) return null;

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

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Floating neon glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

                <div className="animate-in fade-in duration-500 max-w-md w-full text-center space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">One-Time Login Code</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            No redirect needed. Just enter this code on Microsoft&apos;s website.
                        </p>
                    </div>

                    {/* Code Display */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-md shadow-[0_0_40px_rgba(59,130,246,0.05)]">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Verification Code</p>
                        <div className="text-4xl font-mono font-black text-white tracking-[0.2em] select-all bg-black/40 py-3 rounded-xl border border-white/5 shadow-inner">
                            {deviceSession.userCode}
                        </div>
                        <p className="text-blue-400 text-xs font-semibold animate-pulse">Code copied to clipboard ✓</p>
                    </div>

                    {/* Step by step */}
                    <div className="text-left space-y-3 border border-white/8 bg-white/3 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="font-bold text-white text-xs uppercase tracking-widest mb-3">Login Steps:</p>
                        {[
                            { step: '1', text: 'Click the button below to open Microsoft' },
                            { step: '2', text: `Enter code: ${deviceSession.userCode}` },
                            { step: '3', text: 'Sign in with your Microsoft account' },
                            { step: '4', text: 'Done! This dashboard will automatically update' },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">{step}</div>
                                <p className="text-xs font-medium text-gray-300">{text}</p>
                            </div>
                        ))}
                    </div>

                    <a
                        href={deviceSession.verificationUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold hover:from-blue-600 hover:to-blue-400 transition-all text-center shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                    >
                        Verify on Microsoft Portal →
                    </a>

                    {devicePolling && (
                        <div className="flex items-center justify-center gap-2.5 text-gray-500 text-xs font-semibold">
                            <svg className="animate-spin h-3.5 w-3.5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Awaiting device authentication…
                        </div>
                    )}

                    <button onClick={() => { setMode('landing'); setDeviceSession(null); }} className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                        ← Cancel Request
                    </button>
                </div>
            </main>
        </div>
    );
}
