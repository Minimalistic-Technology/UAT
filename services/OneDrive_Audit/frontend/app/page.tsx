"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { fetchFiles, syncFiles, updateDesignation, setAuthToken, downloadExcel, loginEmployee, getEmployees, createEmployee, deleteEmployee, startDeviceLoginAPI, pollDeviceLoginAPI } from '../lib/api';
import LandingPage from '../components/LandingPage';
import DeviceLogin from '../components/DeviceLogin';
import EmployeeLogin from '../components/EmployeeLogin';
// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_FILES = [
  { id: '1', fileName: 'Q3_Financial_Report_2026.xlsx', filePath: '/Finance/Reports', fileSize: 2507000, fileType: 'xlsx', designation: 'CRITICAL', isDuplicate: false, isLargeFile: false, createdAt: new Date('2026-03-01') },
  { id: '2', fileName: 'Employee_Handbook_v4.pdf', filePath: '/HR/Documents', fileSize: 1100000, fileType: 'pdf', designation: 'INTERNAL', isDuplicate: false, isLargeFile: false, createdAt: new Date('2026-01-15') },
  { id: '3', fileName: 'Marketing_Assets_Final.zip', filePath: '/Marketing', fileSize: 130000000, fileType: 'zip', designation: 'UNCLASSIFIED', isDuplicate: false, isLargeFile: true, createdAt: new Date('2026-02-20') },
  { id: '4', fileName: 'Client_List_2025.csv', filePath: '/Sales', fileSize: 4800000, fileType: 'csv', designation: 'HIGH', isDuplicate: true, isLargeFile: false, createdAt: new Date('2026-04-10') },
  { id: '5', fileName: 'Product_Roadmap_2026.pptx', filePath: '/Strategy', fileSize: 8200000, fileType: 'pptx', designation: 'CONFIDENTIAL', isDuplicate: false, isLargeFile: false, createdAt: new Date('2026-04-22') },
  { id: '6', fileName: 'Client_List_2025.csv', filePath: '/Backup/Sales', fileSize: 4800000, fileType: 'csv', designation: 'HIGH', isDuplicate: true, isLargeFile: false, createdAt: new Date('2026-04-10') },
  { id: '7', fileName: 'Server_Backup_Mar.tar.gz', filePath: '/IT/Backups', fileSize: 95000000, fileType: 'gz', designation: 'UNCLASSIFIED', isDuplicate: false, isLargeFile: true, createdAt: new Date('2026-03-31') },
  { id: '8', fileName: 'Brand_Guidelines_2026.pdf', filePath: '/Design', fileSize: 3100000, fileType: 'pdf', designation: 'PUBLIC', isDuplicate: false, isLargeFile: false, createdAt: new Date('2026-01-05') },
];

const DESIGNATIONS = ['UNCLASSIFIED', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET'];

type AuthMode = 'landing' | 'device-login' | 'employee-login' | 'demo' | 'live';

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [mode, setMode] = useState<AuthMode>('landing');
  const [files, setFiles] = useState<any[]>([]);
  const [totalStorageBytes, setTotalStorageBytes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [liveUser, setLiveUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Employee Auth State
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Admin Manage Employees State
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [empMessage, setEmpMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // File Explorer State
  const [currentFolder, setCurrentFolder] = useState<string>('/');

  // Device Code Flow state
  const [deviceSession, setDeviceSession] = useState<{ sessionId: string; userCode: string; verificationUri: string; message: string } | null>(null);
  const [devicePolling, setDevicePolling] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  // Live session via NextAuth
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = (session as any).accessToken;
      setAuthToken(token);
      // NextAuth users are Admins by default
      setLiveUser({ name: session.user?.name || '', email: session.user?.email || '', role: 'admin' });
      setMode('live');
      loadLiveFiles();
    }
  }, [status, session]);

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await loginEmployee({ email: empEmail, password: empPassword });
      setAuthToken(data.token);
      setLiveUser({ name: data.user.name, email: data.user.email, role: data.user.role });
      setMode('live');
      loadLiveFiles();
    } catch (e: any) {
      setAuthError(e?.response?.data?.error || 'Invalid credentials');
    }
  };

  const handleFetchEmployees = async () => {
    try {
      const emps = await getEmployees();
      setEmployees(emps);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmpMessage(null);
    try {
      await createEmployee({ email: newEmpEmail, name: newEmpName, password: newEmpPassword });
      setNewEmpEmail(''); setNewEmpName(''); setNewEmpPassword('');
      handleFetchEmployees();
      setEmpMessage({ type: 'success', text: 'Employee portal created successfully!' });
      setTimeout(() => setEmpMessage(null), 3500);
    } catch (e: any) {
      setEmpMessage({ type: 'error', text: e?.response?.data?.error || 'Failed to create employee' });
      setTimeout(() => setEmpMessage(null), 3500);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteEmployee(id);
      handleFetchEmployees();
    } catch (e) {
      alert('Failed to delete employee');
    }
  };

  const enterDemoMode = () => {
    setMode('demo');
    setFiles(DEMO_FILES);
    setTotalStorageBytes(DEMO_FILES.reduce((s, f) => s + f.fileSize, 0));
  };

  const startDeviceLogin = async () => {
    setDeviceError('');
    setMode('device-login');
    try {
      const data = await startDeviceLoginAPI();
      setDeviceSession(data);
      // Auto-copy code to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.userCode);
      }
      startPolling(data.sessionId);
    } catch (e) {
      setDeviceError('Failed to start device login. Is the backend running?');
      setMode('landing');
    }
  };

  const startPolling = useCallback(async (sessionId: string) => {
    setDevicePolling(true);
    try {
      const data = await pollDeviceLoginAPI(sessionId);
      if (data.status === 'success') {
        setAuthToken(data.accessToken);
        setLiveUser(data.user);
        setMode('live');
        setDevicePolling(false);
        setDeviceSession(null);
        loadLiveFilesWithToken(data.accessToken);
      }
    } catch (e: any) {
      setDeviceError(e?.response?.data?.error || 'Authentication failed.');
      setDevicePolling(false);
      setMode('landing');
    }
  }, []);

  const loadLiveFiles = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      let data = await fetchFiles();
      // Auto-sync on first login if database is empty
      if (!data.files || data.files.length === 0) {
        setSyncing(true);
        try {
          await syncFiles();
          data = await fetchFiles();
        } catch (e: any) {
          console.error("Auto sync failed:", e);
          if (e?.response?.status === 401 || e?.status === 401) {
            throw e; // Pass to outer catch block to trigger logout
          }
        } finally {
          setSyncing(false);
        }
      }
      setFiles(data.files || []);
      setTotalStorageBytes(Number(data.totalStorageBytes) || 0);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401 || err?.status === 401) {
        setLiveUser(null);
        setMode('landing');
        signOut({ redirect: false });
        alert("Your session has expired. Please sign in again.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Real-Time Background Synchronization (Silent Polling every 15s)
  useEffect(() => {
    if (mode === 'live' && liveUser?.role === 'admin') {
      const intervalId = setInterval(async () => {
        try {
          await syncFiles();
          const data = await fetchFiles();
          setFiles(data.files || []);
          setTotalStorageBytes(Number(data.totalStorageBytes) || 0);
        } catch (e: any) {
          if (e.response && e.response.status === 401) {
            console.warn("Token expired. Stopping auto-sync."); // Using warn instead of error to prevent Next.js dev overlay
            setMode('landing');
            setFiles([]);
            setLiveUser(null);
            signOut({ redirect: false });
            alert("Your Microsoft session has expired. Please sign in again.");
          }
        }
      }, 15000);

      return () => clearInterval(intervalId);
    }
  }, [mode, liveUser]);

  const loadLiveFilesWithToken = async (token: string) => {
    setAuthToken(token);
    await loadLiveFiles();
  };

  const handleSync = async () => {
    if (mode === 'demo') return;
    setSyncing(true);
    try {
      await syncFiles();
      await loadLiveFiles();
    } catch (e) {
      alert('Sync failed. Backend must be running.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDesignationChange = async (id: string, newDesignation: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, designation: newDesignation } : f));
    if (mode === 'live') {
      try { await updateDesignation(Number(id), newDesignation); } catch { }
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f =>
    f.fileName.toLowerCase().includes(search.toLowerCase()) ||
    f.filePath.toLowerCase().includes(search.toLowerCase())
  );

  const displayItems = React.useMemo(() => {
    const items: any[] = [];
    const folderSet = new Set<string>();

    filteredFiles.forEach(f => {
      let p = f.filePath.replace(/^\/drive\/root:?/, '');
      if (!p || p === '') p = '/';

      const isSearchMode = search.length > 0;

      if (isSearchMode) {
        items.push({ type: 'file', data: f, normalizedPath: p });
      } else {
        if (p === currentFolder || p + '/' === currentFolder) {
          items.push({ type: 'file', data: f, normalizedPath: p });
        } else if (p.startsWith(currentFolder === '/' ? '/' : currentFolder + '/')) {
          const remainingPath = p.slice(currentFolder === '/' ? 1 : currentFolder.length + 1);
          const childFolderName = remainingPath.split('/')[0];

          if (childFolderName && !folderSet.has(childFolderName)) {
            folderSet.add(childFolderName);
            items.push({
              type: 'folder',
              name: childFolderName,
              fullPath: currentFolder === '/' ? '/' + childFolderName : currentFolder + '/' + childFolderName
            });
          }
        }
      }
    });

    return items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      const nameA = a.type === 'folder' ? a.name : a.data.fileName;
      const nameB = b.type === 'folder' ? b.name : b.data.fileName;
      return nameA.localeCompare(nameB);
    });
  }, [filteredFiles, currentFolder, search]);

  const duplicates = files.filter(f => f.isDuplicate).length;
  const largeFiles = files.filter(f => f.isLargeFile).length;

  const badgeColor = (d: string) => {
    if (d === 'CRITICAL') return 'bg-red-50 text-red-700 border-red-200';
    if (d === 'HIGH') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (d === 'CONFIDENTIAL' || d === 'SECRET') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (d === 'INTERNAL') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (d === 'PUBLIC') return 'bg-green-50 text-green-700 border-green-200';
    if (d === 'MEDIUM') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (d === 'LOW') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  // ─── Device Login Screen ─────────────────────────────────────────────────────
  if (mode === 'device-login' && deviceSession) {
    return <DeviceLogin deviceSession={deviceSession} setMode={setMode} setDeviceSession={setDeviceSession} devicePolling={devicePolling} />;
  }

  // ─── Hyper-Neon Dark Mode Premium Landing Page ──────────────────────────────────
  if (mode === 'landing') {
    return <LandingPage setMode={setMode} deviceError={deviceError} onSignInClick={() => signIn('azure-ad')} onDemoClick={enterDemoMode} />;
  }

  // ─── Employee Login Screen ───────────────────────────────────────────────────
  if (mode === 'employee-login') {
    return (
      <EmployeeLogin
        empEmail={empEmail}
        setEmpEmail={setEmpEmail}
        empPassword={empPassword}
        setEmpPassword={setEmpPassword}
        authError={authError}
        handleEmployeeLogin={handleEmployeeLogin}
        setMode={setMode}
      />
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#030014] text-white">

      {/* ─── Desktop Left Sidebar ─── */}
      <aside className="w-64 border-r border-white/8 bg-black/60 backdrop-blur-xl flex flex-col fixed inset-y-0 left-0 z-40 hidden lg:flex">
        {/* Branding */}
        <div className="h-16 px-6 flex items-center border-b border-white/8 gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-650 shadow-[0_0_15px_rgba(59,130,246,0.5)] shrink-0">
            <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
          </div>
          <span className="text-white font-extrabold text-sm tracking-widest uppercase">AUDIT CONSOLE</span>
        </div>

        {/* Navigation Actions */}
        <div className="flex-1 px-4 py-8 space-y-7">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Navigation</p>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
              Audit Dashboard
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Auditing Actions</p>
            {mode === 'live' && liveUser?.role === 'admin' && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs transition-all disabled:opacity-40"
              >
                <svg className={`h-4.5 w-4.5 text-blue-400 ${syncing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                {syncing ? 'Syncing OneDrive…' : 'Sync OneDrive'}
              </button>
            )}

            {mode === 'live' && liveUser?.role === 'admin' && (
              <button
                onClick={() => { setShowEmpModal(true); handleFetchEmployees(); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs transition-all"
              >
                <svg className="h-4.5 w-4.5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                Manage Employees
              </button>
            )}

            <button
              onClick={() => { mode === 'live' ? downloadExcel(currentFolder) : alert('Connect your Microsoft account to export real data.'); }}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs transition-all"
            >
              <svg className="h-4.5 w-4.5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              Export CSV Report
            </button>
          </div>
        </div>

        {/* User Workspace Info & Logout Card */}
        {liveUser && (
          <div className="p-4 border-t border-white/8 bg-white/3 flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black uppercase shrink-0">
                {liveUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">{liveUser.name}</p>
                <div className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
                  {liveUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={() => { setMode('landing'); setFiles([]); setLiveUser(null); setAuthToken(''); signOut({ redirect: false }); }}
              className="flex w-full items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold border border-white/8 bg-white/3 text-gray-400 hover:bg-rose-500/20 hover:text-rose-450 hover:border-rose-500/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              Logout Session
            </button>
          </div>
        )}
      </aside>

      {/* ─── Right Content Platform ─── */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">

        {/* Mobile Header / Navbar */}
        <header className="sticky top-0 z-30 w-full border-b border-white/8 bg-black/40 backdrop-blur-xl h-16 flex items-center justify-between px-6 lg:hidden shrink-0">
          <div className="flex items-center gap-3 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-650 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <svg className="text-white h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
            </div>
            <span className="text-white text-xs tracking-widest uppercase">AUDIT</span>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'live' && liveUser?.role === 'admin' && (
              <button onClick={handleSync} disabled={syncing}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-40">
                <svg className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
              </button>
            )}
            {mode === 'live' && liveUser?.role === 'admin' && (
              <button onClick={() => { setShowEmpModal(true); handleFetchEmployees(); }}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              </button>
            )}
            <button
              onClick={() => { setMode('landing'); setFiles([]); setLiveUser(null); setAuthToken(''); signOut({ redirect: false }); }}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-455 hover:bg-rose-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            </button>
          </div>
        </header>

        {/* Global Workspace Banner / Topbar */}
        <div className="h-16 border-b border-white/8 bg-[#030014]/50 backdrop-blur-md hidden lg:flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Workspace:</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
              {liveUser?.role === 'admin' ? 'Global Admin Core' : 'Staff Managed Scope'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/2 text-gray-400 text-xs font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-450 animate-pulse" />
              Connected: {liveUser?.email}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <div className="flex flex-col gap-6">

            {/* Demo Banner */}
            {mode === 'demo' && (
              <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                <span className="flex items-center gap-3 font-medium">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                  <span><strong className="font-extrabold mr-1">Demo Mode</strong> — Sample data. Connect for live sync.</span>
                </span>
                <button onClick={startDeviceLogin} className="px-5 py-2 rounded-full bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors">
                  Connect Microsoft 365 →
                </button>
              </div>
            )}

            {/* ─── Dashboard Title Row ─── */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">File Audit Dashboard</h2>
                <p className="text-sm text-gray-500 mt-0.5 font-medium">Review, classify, and export your OneDrive content.</p>
              </div>
              {/* Mobile Manage Employees */}
              {mode === 'live' && liveUser?.role === 'admin' && (
                <button onClick={() => { setShowEmpModal(true); handleFetchEmployees(); }}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  Manage Employees
                </button>
              )}
            </section>

            {/* ─── Stat Cards ─── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Files', value: files.length.toString(), color: 'from-blue-500/20 to-blue-600/5', dot: 'bg-blue-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
                { label: 'Storage Used', value: formatSize(totalStorageBytes), color: 'from-indigo-500/20 to-indigo-600/5', dot: 'bg-indigo-400', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' },
                { label: 'Duplicates', value: duplicates.toString(), color: 'from-amber-500/20 to-amber-600/5', dot: 'bg-amber-400', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]' },
                { label: 'Large Files (>50MB)', value: largeFiles.toString(), color: 'from-rose-500/20 to-rose-600/5', dot: 'bg-rose-400', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]' },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl p-5 border border-white/8 bg-gradient-to-br ${s.color} ${s.glow} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-200`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                  <p className="text-3xl font-black text-white">{s.value}</p>
                </div>
              ))}
            </section>

            {/* ─── File Table ─── */}
            <section className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-white/8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-400 overflow-x-auto w-full">
                  <button onClick={() => { setCurrentFolder('/'); setSearch(''); }} className="hover:text-blue-400 transition-colors shrink-0 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Home
                  </button>
                  {search.length === 0 && currentFolder !== '/' && currentFolder.split('/').filter(Boolean).map((part, index, arr) => {
                    const path = '/' + arr.slice(0, index + 1).join('/');
                    return (
                      <React.Fragment key={path}>
                        <span className="text-gray-600">/</span>
                        <button onClick={() => setCurrentFolder(path)} className="hover:text-blue-400 transition-colors shrink-0">{part}</button>
                      </React.Fragment>
                    );
                  })}
                  {search.length > 0 && (<><span className="text-gray-600">/</span><span className="text-gray-500 italic">Search Results</span></>)}
                </div>
                <div className="relative w-full sm:max-w-xs shrink-0">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search everywhere..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:outline-none transition-all" />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-left">
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest">Size</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest">Classification</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {displayItems.map((item, idx) => {
                        if (item.type === 'folder') {
                          return (
                            <tr key={`folder-${item.fullPath}`} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => setCurrentFolder(item.fullPath)}>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.22-1.8A2 2 0 0 0 7.53 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
                                  </div>
                                  <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-gray-600">—</td>
                              <td className="px-4 py-3.5 text-gray-600">—</td>
                              <td className="px-4 py-3.5 text-gray-600">—</td>
                            </tr>
                          );
                        }
                        const file = item.data;
                        return (
                          <tr key={file.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-200 truncate max-w-[200px]">{file.fileName}</p>
                                  {search.length > 0 && <p className="text-xs text-gray-600 truncate max-w-[200px]">{item.normalizedPath}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{formatSize(file.fileSize)}</td>
                            <td className="px-4 py-3.5">
                              <select value={file.designation} onChange={e => handleDesignationChange(file.id, e.target.value)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer focus:outline-none transition-colors bg-transparent ${badgeColor(file.designation)}`}>
                                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${file.isDuplicate ? 'text-rose-400' : file.isLargeFile ? 'text-amber-400' : 'text-emerald-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${file.isDuplicate ? 'bg-rose-400' : file.isLargeFile ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                {file.isDuplicate ? 'Duplicate' : file.isLargeFile ? 'Large File' : 'Clean'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {displayItems.length === 0 && (
                    <div className="text-center text-gray-600 py-20 flex flex-col items-center justify-center gap-3">
                      <svg className="w-12 h-12 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                      <p className="text-sm">This folder is empty.</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ─── Employee Management Modal ─── */}
            {showEmpModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
                <div className="bg-[#0a0a1a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(59,130,246,0.15)]">
                  <div className="flex items-center justify-between p-6 border-b border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                      </div>
                      <h2 className="text-xl font-black text-white tracking-tight">Manage Employees</h2>
                    </div>
                    <button onClick={() => setShowEmpModal(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 flex flex-col sm:flex-row gap-8">
                    {/* Add Employee Form */}
                    <div className="sm:w-1/2">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Add New Employee</h3>

                      {empMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mb-4 px-4 py-3 rounded-xl border text-sm font-bold shadow-lg ${empMessage.type === 'success'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-450 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {empMessage.type === 'success' ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                            {empMessage.text}
                          </div>
                        </motion.div>
                      )}

                      <form onSubmit={handleCreateEmployee} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Name</label>
                          <input type="text" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" placeholder="John Doe" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Email</label>
                          <input type="email" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} required className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" placeholder="john@company.com" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">Password</label>
                          <input type="password" value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" placeholder="••••••••" />
                        </div>
                        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-bold hover:from-blue-600 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)]">
                          Create Employee
                        </button>
                      </form>
                    </div>

                    {/* Employee List */}
                    <div className="sm:w-1/2">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Active Employees ({employees.length})</h3>
                      <div className="space-y-3">
                        {employees.length === 0 ? (
                          <p className="text-sm text-gray-600 italic">No employees added yet.</p>
                        ) : employees.map(emp => (
                          <div key={emp._id} className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/5 hover:bg-white/8 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{emp.name}</p>
                                <p className="text-xs text-gray-600">{emp.email}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteEmployee(emp._id)} className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

