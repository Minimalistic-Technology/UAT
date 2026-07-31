"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
    setMode: (mode: any) => void;
    deviceError: string;
    onSignInClick: () => void;
    onDemoClick: () => void;
}

export default function LandingPage({ setMode, deviceError, onSignInClick, onDemoClick }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">

            {/* Deep Galaxy Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-700/30 blur-[150px] pointer-events-none mix-blend-screen mix-blend-screen" style={{ animation: 'pulse 8s infinite alternate' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-700/20 blur-[150px] pointer-events-none mix-blend-screen" style={{ animation: 'pulse 12s infinite alternate-reverse' }} />
            <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Starry Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_100%,transparent_100%)] opacity-40 pointer-events-none z-0" />

            {/* Minimalist Glass Navbar */}
            <nav className="relative z-50 w-full border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 md:px-10">
                    <button onClick={() => { window.scrollTo(0, 0); setMode('landing'); }} className="flex items-center gap-3 font-bold hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                        </div>
                        <span className="text-xl tracking-tight text-white">OneDrive Audit Tool</span>
                    </button>
                    <div className="flex flex-1 justify-end hidden md:flex">
                        <nav className="flex items-center gap-8 text-sm font-semibold text-gray-300">
                            <button onClick={() => { window.scrollTo(0, 0); setMode('landing'); }} className="hover:text-white transition-colors duration-300">Home</button>
                            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
                            <a href="#about" className="hover:text-white transition-colors duration-300">About</a>
                            <a href="#why" className="hover:text-white transition-colors duration-300">Why use this</a>
                        </nav>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex items-center justify-center min-h-[90vh] px-6 overflow-hidden">

                {/* ─── Blue Glowing Oval Rings ─── */}
                <div className="pointer-events-none absolute -top-[28%] -left-[18%] w-[75%] h-[75%] rounded-[50%] border-[2px] border-blue-500/20 blur-[1px]"
                    style={{ boxShadow: '0 0 100px 30px rgba(37,99,235,0.2), inset 0 0 100px 30px rgba(37,99,235,0.1)' }} />
                <div className="pointer-events-none absolute -bottom-[28%] -right-[18%] w-[75%] h-[75%] rounded-[50%] border-[2px] border-blue-600/20 blur-[1px]"
                    style={{ boxShadow: '0 0 100px 30px rgba(37,99,235,0.2), inset 0 0 100px 30px rgba(37,99,235,0.1)' }} />

                {/* Center radial blue glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_50%,rgba(37,99,235,0.13),transparent_70%)]" />

                {/* ─── 3D Floating Particle Orbs ─── */}
                {[
                    { size: 'w-3 h-3', top: '18%', left: '10%', delay: '0s', dur: '6s' },
                    { size: 'w-2 h-2', top: '65%', left: '8%', delay: '1s', dur: '8s' },
                    { size: 'w-4 h-4', top: '30%', left: '88%', delay: '2s', dur: '7s' },
                    { size: 'w-2 h-2', top: '72%', left: '85%', delay: '0.5s', dur: '5s' },
                    { size: 'w-3 h-3', top: '50%', left: '5%', delay: '3s', dur: '9s' },
                    { size: 'w-2 h-2', top: '15%', left: '75%', delay: '1.5s', dur: '7s' },
                ].map((p, i) => (
                    <div key={i}
                        className={`pointer-events-none absolute ${p.size} rounded-full bg-blue-400/60 blur-[1px] shadow-[0_0_12px_4px_rgba(59,130,246,0.6)]`}
                        style={{
                            top: p.top, left: p.left,
                            animation: `float-y ${p.dur} ease-in-out infinite alternate`,
                            animationDelay: p.delay
                        }}
                    />
                ))}

                {/* ─── Hero Content ─── */}
                <div className="relative z-10 w-full text-center max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, type: 'spring', bounce: 0.4 }}
                    >
                        {/* 3D Perspective Heading */}
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter text-white mb-6 leading-tight"
                            initial={{ rotateX: 15, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.1, type: 'spring', bounce: 0.35 }}
                            style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
                        >
                            Control your{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                Microsoft cloud.
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.7 }}
                        >
                            The ultimate audit layer for Microsoft 365. Scan for duplicates, classify sensitive data, and export compliant reports—without exposing Admin credentials.
                        </motion.p>

                        {deviceError && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="max-w-md mx-auto mb-8 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md">
                                {deviceError}
                            </motion.div>
                        )}

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.7 }}
                        >
                            {/* Premium Connect Microsoft 365 Button */}
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: '0 0 35px rgba(59, 130, 246, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.2)'
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onSignInClick}
                                className="group relative w-full sm:w-auto inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-650 px-8 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                <svg className="mr-3 h-5 w-5 shrink-0 group-hover:rotate-[360deg] transition-transform duration-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" fill="none">
                                    <path fill="#f3f3f3" d="M11 11H1V1h10v10Z" /><path fill="#f35325" d="M22 11H12V1h10v10Z" />
                                    <path fill="#81bc06" d="M11 22H1V12h10v10Z" /><path fill="#05a6f0" d="M22 22H12V12h10v10Z" />
                                </svg>
                                Connect Microsoft 365
                            </motion.button>

                            {/* Premium Enter Staff Portal Button */}
                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    borderColor: 'rgba(59, 130, 246, 0.5)',
                                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)'
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setMode('employee-login')}
                                className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-8 text-sm font-bold text-white transition-all group"
                            >
                                <svg className="mr-3 h-5 w-5 text-blue-400 shrink-0 group-hover:scale-110 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                                Enter Staff Portal
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Float animation keyframes */}
                <style>{`
                  @keyframes float-y {
                    0%   { transform: translateY(0px) scale(1); opacity: 0.6; }
                    100% { transform: translateY(-22px) scale(1.2); opacity: 1; }
                  }
                `}</style>
            </section>

            {/* Dashboard 3D Floating Mockup */}
            <section className="relative z-10 px-6 pb-40 perspective-[2000px]">
                <motion.div
                    initial={{ opacity: 0, rotateX: 25, y: 80 }}
                    whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                    whileHover={{ rotateX: 4, rotateY: -4, scale: 1.02, y: -15, boxShadow: "0 80px 140px -30px rgba(99, 102, 241, 0.4)" }}
                    onClick={onDemoClick}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                    className="mx-auto max-w-5xl cursor-pointer rounded-2xl relative group/card"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Interactive Badge Info */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-blue-600 border border-blue-400 text-xs font-black text-white tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-30 pointer-events-none">
                        CLICK TO TRY INTERACTIVE DEMO MODE
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10">
                        {/* Browser Header */}
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-sm border border-black/5"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-sm border border-black/5"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-sm border border-black/5"></div>
                            </div>
                            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-md h-7 flex items-center justify-center shadow-sm">
                                <span className="text-[10.5px] text-slate-400 font-mono font-semibold tracking-widest">secure-audit.cloud/dashboard</span>
                            </div>
                            <div className="w-16"></div>
                        </div>

                        {/* Animated Inner Dashboard (Light Theme) */}
                        <div className="aspect-[16/9] bg-slate-50 relative p-6 md:p-8 flex flex-col overflow-hidden">
                            {/* Header inside mockup */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="text-white h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">File Audit Dashboard</h2>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Live Microsoft 365 Sync</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-8 w-24 bg-slate-200 rounded-md"></div>
                                    <div className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200 animate-pulse flex items-center">
                                        Active Sync
                                    </div>
                                </div>
                            </div>

                            {/* Animated Rows / Cards */}
                            <div className="flex gap-6 flex-1 min-h-0">
                                {/* Left Sidebar Mock */}
                                <div className="hidden sm:flex w-1/4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex-col gap-4 relative">
                                    <div className="h-3 w-16 bg-slate-300 rounded mb-2"></div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded border border-slate-100 bg-slate-50"></div>
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded"></div>
                                        </div>
                                    ))}
                                    <div className="absolute bottom-5 left-5 right-5 h-24 rounded-lg bg-blue-50 border border-blue-100 p-3">
                                        <div className="h-2 w-12 bg-blue-300 rounded mb-3"></div>
                                        <div className="h-1.5 w-full bg-blue-200 rounded mb-2"></div>
                                        <div className="h-1.5 w-3/4 bg-blue-200 rounded"></div>
                                    </div>
                                </div>

                                {/* Main Audit List Animated CSS */}
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                        <div className="flex-1">File Path / Name</div>
                                        <div className="w-24">Risk Level</div>
                                        <div className="w-20">Size</div>
                                    </div>

                                    <div className="flex-1 relative">
                                        <svg className="absolute inset-0 w-full h-full text-slate-50 opacity-50" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
                                        <motion.div
                                            initial={{ y: 0 }}
                                            animate={{ y: "-50%" }}
                                            transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                                            className="absolute w-full"
                                        >
                                            {/* Duplicate rows for infinite scroll feeling (video like) */}
                                            {[
                                                { name: "Executive_Q3_Earnings_Final.pdf", sub: "Finance / Reports", risk: "critical", size: "4.2 MB" },
                                                { name: "Employee_Database_Dump.csv", sub: "HR / Confidential", risk: "high", size: "128 MB" },
                                                { name: "Project_Apollo_Specs.docx", sub: "Engineering / R&D", risk: "critical", size: "1.5 MB" },
                                                { name: "Quarterly_Newsletter_Draft.pptx", sub: "Marketing / Public", risk: "low", size: "12 MB" },
                                                { name: "API_Keys_Backup.txt", sub: "DevOps / Secrets", risk: "critical", size: "12 KB" },
                                                { name: "Office_Party_Photos.zip", sub: "General / Media", risk: "low", size: "450 MB" },
                                                { name: "Executive_Q3_Earnings_Final.pdf", sub: "Finance / Reports", risk: "critical", size: "4.2 MB" },
                                                { name: "Employee_Database_Dump.csv", sub: "HR / Confidential", risk: "high", size: "128 MB" },
                                                { name: "Project_Apollo_Specs.docx", sub: "Engineering / R&D", risk: "critical", size: "1.5 MB" },
                                                { name: "Quarterly_Newsletter_Draft.pptx", sub: "Marketing / Public", risk: "low", size: "12 MB" },
                                                { name: "API_Keys_Backup.txt", sub: "DevOps / Secrets", risk: "critical", size: "12 KB" },
                                                { name: "Office_Party_Photos.zip", sub: "General / Media", risk: "low", size: "450 MB" },
                                            ].map((row, i) => (
                                                <div key={i} className="flex gap-4 p-4 border-b border-slate-100 items-center relative z-10 bg-white/40 backdrop-blur-[2px] transition-colors hover:bg-slate-50">
                                                    <div className="flex-1 flex flex-col gap-1">
                                                        <span className="font-bold text-slate-800 text-sm tracking-tight">{row.name}</span>
                                                        <span className="text-xs text-slate-400 font-medium">{row.sub}</span>
                                                    </div>
                                                    <div className="w-24">
                                                        {row.risk === 'critical' ? (
                                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded border border-red-200">CRITICAL</span>
                                                        ) : row.risk === 'high' ? (
                                                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded border border-amber-200">HIGH</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">PUBLIC</span>
                                                        )}
                                                    </div>
                                                    <div className="w-20"><span className="text-xs font-mono text-slate-500">{row.size}</span></div>
                                                </div>
                                            ))}
                                        </motion.div>
                                        {/* Gradient fade at bottom to hide the pop */}
                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Cosmic Grid */}
            <section id="features" className="relative z-10 py-32 bg-black/60 border-y border-white/5 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-lg">Engineering perfection.</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">Built for compliance teams who demand absolute visibility and relentless speed.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Deep Classification", desc: "Tag documents as Critical, High, or Public based on contents.", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />, glow: " shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.3)]", delay: 0 },
                            { title: "Storage Optimization", desc: "Find exact duplicate files with checksum matching and reclaim drives.", icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />, glow: " shadow-[0_0_40px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_60px_rgba(249,115,22,0.3)]", delay: 0.15 },
                            { title: "Enterprise RBAC", desc: "Delegate tasks to custom employees without granting Admin access.", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, glow: " shadow-[0_0_40px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_60px_rgba(16,185,129,0.3)]", delay: 0.3 }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, delay: f.delay, type: 'spring', stiffness: 50 }}
                                className={`group rounded-[2.5rem] border border-white/10 bg-white/5 p-10 backdrop-blur-md transition-all hover:bg-white/10 duration-500 overflow-hidden relative ${f.glow}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 mb-8 border border-white/10 text-white shadow-inner">
                                    <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                                </div>
                                <h3 className="mb-4 text-2xl font-bold text-white">{f.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-medium text-lg">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="relative z-10 py-24 bg-black/40">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto px-6 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Built for absolute security.</h2>
                    <p className="text-lg text-gray-400 leading-relaxed font-medium mb-12">
                        The OneDrive Audit Tool guarantees absolute privacy for your corporate files.
                        Everything runs client-side where possible, and your Microsoft OAuth tokens are NEVER stored persistently on any server.
                    </p>
                </motion.div>
            </section>

            {/* Why Use This Section */}
            <section id="why" className="relative z-10 py-24 bg-gradient-to-b from-black/20 to-black/80">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="md:w-1/2"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Why rely on us?</h2>
                            <p className="text-lg text-gray-400 mb-8 font-medium">Compliance regulations change constantly. Ensuring your files are deduplicated, accurately risk-classified, and accessible solely to authorized personnel is paramount.</p>
                            <ul className="space-y-4 text-gray-300 font-medium">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Zero server-side data retention</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Isolated container environments</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>Military-grade encryption routines</li>
                            </ul>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.25 }}
                            className="md:w-1/2 relative"
                        >
                            <div className="aspect-square rounded-full border border-white/10 bg-white/5 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent animate-pulse"></div>
                                <svg className="w-32 h-32 text-indigo-400/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/80 py-20">
                <div className="max-w-7xl mx-auto px-6 text-center md:flex md:items-center md:justify-between md:text-left">
                    <div className="flex justify-center md:justify-start items-center gap-3 font-bold tracking-tight mb-8 md:mb-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                            <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
                        </div>
                        <span className="text-white text-xl">OneDrive Audit Tool.</span>
                    </div>

                    <div className="flex items-center justify-center gap-8 font-semibold text-gray-500">
                        <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors duration-300">Architecture</a>
                    </div>
                </div>
            </footer>

        </div>
    );
}
