"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { fetchFiles, syncFiles, updateDesignation, setAuthToken, downloadExcel } from '../lib/api';
import axios from 'axios';

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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type AuthMode = 'landing' | 'device-login' | 'demo' | 'live';

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [mode, setMode] = useState<AuthMode>('landing');
  const [files, setFiles] = useState<any[]>([]);
  const [totalStorageBytes, setTotalStorageBytes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [liveUser, setLiveUser] = useState<{ name: string; email: string } | null>(null);

  // Device Code Flow state
  const [deviceSession, setDeviceSession] = useState<{ sessionId: string; userCode: string; verificationUri: string; message: string } | null>(null);
  const [devicePolling, setDevicePolling] = useState(false);
  const [deviceError, setDeviceError] = useState('');

  // Live session via NextAuth
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const token = (session as any).accessToken;
      setAuthToken(token);
      setLiveUser({ name: session.user?.name || '', email: session.user?.email || '' });
      setMode('live');
      loadLiveFiles();
    }
  }, [status, session]);

  const enterDemoMode = () => {
    setMode('demo');
    setFiles(DEMO_FILES);
    setTotalStorageBytes(DEMO_FILES.reduce((s, f) => s + f.fileSize, 0));
  };

  const startDeviceLogin = async () => {
    setDeviceError('');
    setMode('device-login');
    try {
      const { data } = await axios.post(`${API_URL}/device-auth/start`);
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
      const { data } = await axios.post(`${API_URL}/device-auth/poll`, { sessionId });
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
        } catch (e) {
          console.error("Auto sync failed:", e);
        } finally {
          setSyncing(false);
        }
      }
      setFiles(data.files || []);
      setTotalStorageBytes(Number(data.totalStorageBytes) || 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Real-Time Background Synchronization (Silent Polling every 15s)
  useEffect(() => {
    if (mode === 'live') {
      const intervalId = setInterval(async () => {
        try {
          await syncFiles();
          const data = await fetchFiles();
          setFiles(data.files || []);
          setTotalStorageBytes(Number(data.totalStorageBytes) || 0);
        } catch (e) {
          console.error("Background sync error:", e);
        }
      }, 15000);

      return () => clearInterval(intervalId);
    }
  }, [mode]);

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="text-blue-600" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">One-Time Login Code</h2>
            <p className="text-slate-500 text-sm mt-2">
              No redirect needed. Just enter this code on Microsoft's website.
            </p>
          </div>

          {/* Code Display */}
          <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
            <p className="text-slate-400 text-xs uppercase tracking-widest">Your Code</p>
            <div className="text-5xl font-mono font-bold text-white tracking-[0.3em]">
              {deviceSession.userCode}
            </div>
            <p className="text-slate-400 text-xs">Code copied to clipboard ✓</p>
          </div>

          {/* Step by step */}
          <div className="text-left space-y-3 bg-blue-50 rounded-2xl p-5">
            <p className="font-semibold text-slate-800 text-sm mb-3">Steps:</p>
            {[
              { step: '1', text: 'Click the button below to open Microsoft' },
              { step: '2', text: `Enter the code: ${deviceSession.userCode}` },
              { step: '3', text: 'Sign in with your Microsoft account' },
              { step: '4', text: 'Come back here — app logs in automatically!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>

          <a
            href={deviceSession.verificationUri}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Open microsoft.com/devicelogin →
          </a>

          {devicePolling && (
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Waiting for you to sign in...
            </div>
          )}

          <button onClick={() => { setMode('landing'); setDeviceSession(null); }} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Landing Page ─────────────────────────────────────────────────────────────
  if (mode === 'landing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <svg className="text-blue-600" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">OneDrive Audit Tool</h2>
            <p className="text-slate-500 mt-2 leading-relaxed">
              Classify, analyze, and export your Microsoft 365 OneDrive files effortlessly.
            </p>
          </div>

          {deviceError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {deviceError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* OAuth Sign In */}
            <button
              onClick={() => signIn('azure-ad')}
              className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all duration-200 text-slate-700 text-left shadow-sm hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-white/10 flex items-center justify-center transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none">
                  <path fill="#f3f3f3" d="M11 11H1V1h10v10Z" /><path fill="#f35325" d="M22 11H12V1h10v10Z" />
                  <path fill="#81bc06" d="M11 22H1V12h10v10Z" /><path fill="#05a6f0" d="M22 22H12V12h10v10Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Sign in with Microsoft</p>
                <p className="text-xs opacity-70 mt-0.5">Standard OAuth login (requires redirect URI setup)</p>
              </div>
            </button>

            {/* Demo Mode */}
            <button
              onClick={enterDemoMode}
              className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 text-slate-600 text-left hover:border-slate-300"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <svg className="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><path d="M7 7h.01" /></svg>
              </div>
              <div>
                <p className="font-semibold">Try Demo Mode</p>
                <p className="text-xs opacity-70 mt-0.5">No login needed — explore with 8 sample files</p>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            {['File Classification', 'Duplicate Detection', 'Excel Export'].map(f => (
              <span key={f} className="flex items-center gap-1">
                <svg className="text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
      {/* Mode Banner */}
      {mode === 'demo' && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <strong>Demo Mode</strong> — Sample data only. Use Sign in to access real files.
          </span>
          <button onClick={startDeviceLogin} className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors">
            Connect OneDrive →
          </button>
        </div>
      )}
      {mode === 'live' && liveUser && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <strong>Connected</strong> — {liveUser.name} ({liveUser.email})
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">File Audit Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Review, classify, and export your OneDrive content.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {mode === 'live' && (
            <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50">
              <svg className={syncing ? 'animate-spin' : ''} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
              {syncing ? 'Syncing...' : 'Sync OneDrive'}
            </button>
          )}
          <button
            onClick={mode === 'live' ? downloadExcel : (e) => { e.preventDefault(); alert('Connect your Microsoft account to export real data.'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            Export CSV
          </button>
          <button onClick={() => { setMode('landing'); setFiles([]); setLiveUser(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all">
            ← Back
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Files', value: files.length.toString(), color: 'bg-blue-500' },
          { label: 'Storage Used', value: formatSize(totalStorageBytes), color: 'bg-indigo-500' },
          { label: 'Duplicates', value: duplicates.toString(), color: 'bg-amber-500' },
          { label: 'Large Files (>50MB)', value: largeFiles.toString(), color: 'bg-rose-500' },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </section>

      {/* File Table */}
      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-soft-border/50 bg-white/40">
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search files..." className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-soft-border bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:outline-none transition-all placeholder:text-slate-400" />
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
                <tr className="bg-slate-50/70 border-b border-soft-border/50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">File</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Size</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Classification</th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-xs uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-border/40">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 truncate max-w-[200px]">{file.fileName}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{file.filePath}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatSize(file.fileSize)}</td>
                    <td className="px-4 py-3.5">
                      <select value={file.designation} onChange={e => handleDesignationChange(file.id, e.target.value)} className={`text-xs font-medium rounded-md px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors ${badgeColor(file.designation)}`}>
                        {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${file.isDuplicate ? 'text-rose-600' : file.isLargeFile ? 'text-amber-600' : 'text-emerald-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${file.isDuplicate ? 'bg-rose-500' : file.isLargeFile ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {file.isDuplicate ? 'Duplicate' : file.isLargeFile ? 'Large File' : 'Clean'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFiles.length === 0 && (
              <p className="text-center text-slate-400 py-16 text-sm">No files found.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
