"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ModernSwitch } from "./ModernSwitch";

export default function PermissionsTab() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewPermLoading, setIsNewPermLoading] = useState(false);
    const [newPath, setNewPath] = useState('');
    const [newMethod, setNewMethod] = useState('');
    const [newRole, setNewRole] = useState('user');
    const [newDescription, setNewDescription] = useState('');
    const [permPage, setPermPage] = useState(1);
    const [permSearch, setPermSearch] = useState('');

    useEffect(() => {
        let isMounted = true;
        api.get('/admin/permissions').then((res) => {
            if (!isMounted) return;
            setPermissions(res.data.data || []);
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            toast.error('Failed to load permissions data');
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        setPermPage(1);
    }, [permSearch]);

    const filteredPermissions = useMemo(() => {
        return permissions.filter(perm => {
            const searchVal = permSearch.toLowerCase().trim();
            if (!searchVal) return true;
            return (
                perm.path.toLowerCase().includes(searchVal) ||
                perm.role.toLowerCase().includes(searchVal) ||
                (perm.description && perm.description.toLowerCase().includes(searchVal)) ||
                (perm.method && perm.method.toLowerCase().includes(searchVal))
            );
        });
    }, [permissions, permSearch]);

    const itemsPerPage = 10;
    const totalPermPages = Math.ceil(filteredPermissions.length / itemsPerPage);
    const displayedPermissions = filteredPermissions.slice((permPage - 1) * itemsPerPage, permPage * itemsPerPage);

    const handleAddPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPath) return toast.error('Rule access path is required');
        setIsNewPermLoading(true);
        try {
            const res = await api.post('/admin/permissions', {
                path: newPath, method: newMethod || null, role: newRole, isActive: true, description: newDescription || null
            });
            toast.success('Rule pattern registered in DB!');
            setPermissions(prev => [...prev, res.data.data].sort((a: any, b: any) => a.role.localeCompare(b.role) || a.path.localeCompare(b.path)));
            setNewPath(''); setNewMethod(''); setNewDescription('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add rule permission');
        } finally {
            setIsNewPermLoading(false);
        }
    };

    const handleTogglePermission = async (id: string, currentStatus: boolean) => {
        setPermissions(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
        toast.success('Permission status changed globally');
        try {
            await api.patch(`/admin/permissions/${id}/toggle`);
        } catch {
            setPermissions(prev => prev.map(p => p.id === id ? { ...p, isActive: currentStatus } : p));
            toast.error('Failed to modify permission state');
        }
    };

    const handleDeletePermission = async (id: string) => {
        if (!confirm('Are you sure you want to delete this route permission pattern?')) return;
        const previousPermissions = permissions;
        setPermissions(prev => prev.filter(p => p.id !== id));
        toast.success('Route access pattern removed from DB');
        try {
            await api.delete(`/admin/permissions/${id}`);
        } catch {
            setPermissions(previousPermissions);
            toast.error('Failed to remove permissions path');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" /></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-theme-element border border-theme-accent/20 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2"><Plus size={20} className="text-theme-action" />Register Route Access Rule</h3>
                <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-6">Database Pattern Creation</p>
                <form onSubmit={handleAddPermission} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Route Path (Exact / Template)</label>
                        <Input type="text" placeholder="e.g. /api/v1/posts/:blogId" value={newPath} onChange={e => setNewPath(e.target.value)} className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/30" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Rule Name / Description</label>
                        <Input type="text" placeholder="e.g. Create Blog Post" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/30" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Method</label>
                        <select value={newMethod} onChange={e => setNewMethod(e.target.value)} className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold">
                            <option value="">ALL Methods</option><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground/75">Role Class</label>
                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-theme-element-sec border border-theme-accent/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-theme-action text-foreground font-semibold">
                            <option value="user">User</option><option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <Button type="submit" disabled={isNewPermLoading} className="w-full bg-theme-action hover:bg-theme-action/90 text-white font-black text-sm uppercase py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                            {isNewPermLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Add Rule
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-theme-accent/10 bg-theme-element-sec/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">Active Route Permission matrix</h3>
                        <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">PostgreSQL Real-Time Guard Rules</p>
                    </div>
                    <div className="w-full sm:w-72">
                        <Input type="text" placeholder="Search rules path or role..." value={permSearch} onChange={e => setPermSearch(e.target.value)} className="w-full bg-theme-element border border-theme-accent/20 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-theme-action text-foreground font-semibold placeholder:text-foreground/45 shadow-sm" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-theme-accent/10 bg-theme-element-sec/20 text-xs font-black uppercase tracking-wider text-foreground/60">
                                <th className="py-4 px-6 w-24">Role</th><th className="py-4 px-6">Allowed Access Rule & Details</th><th className="py-4 px-6 text-center w-24">Status</th><th className="py-4 px-6 text-right w-20">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-accent/5">
                            {displayedPermissions.length === 0 ? (
                                <tr><td colSpan={4} className="py-12 text-center text-sm font-semibold text-foreground/50">No custom route permission definitions matching filter.</td></tr>
                            ) : (
                                displayedPermissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-theme-element-sec/20 transition-colors text-sm font-semibold text-foreground/80">
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${perm.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                <Shield size={12} />{perm.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5 text-left">
                                                <span className="text-sm font-bold text-foreground">{perm.description || 'Custom Dynamic Route Access'}</span>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs text-foreground/50 select-all">{perm.path}</span>
                                                    <span className="bg-theme-element border border-theme-accent/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-theme-action whitespace-nowrap">{perm.method || 'ANY'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center align-middle">
                                            <div className="flex justify-center"><ModernSwitch checked={perm.isActive} onChange={() => handleTogglePermission(perm.id, perm.isActive)} loading={false} colorClass="bg-green-500" /></div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button variant="none" size="none" onClick={() => handleDeletePermission(perm.id)} className="p-2.5 bg-theme-element text-foreground/45 border border-theme-accent/20 rounded-xl hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all shadow-sm " title="Delete Permission Rule"><Trash2 size={16} /></Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPermPages > 1 && (
                    <div className="p-6 border-t border-theme-accent/10 bg-theme-element-sec/20 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-xs font-bold text-foreground/45 uppercase tracking-widest">Showing {(permPage - 1) * itemsPerPage + 1} - {Math.min(permPage * itemsPerPage, filteredPermissions.length)} of {filteredPermissions.length} rules</p>
                        <div className="flex gap-2">
                            <Button variant="none" disabled={permPage === 1} onClick={() => setPermPage(prev => Math.max(prev - 1, 1))} className="px-4 py-2 bg-theme-element border border-theme-accent/20 text-foreground text-xs font-black rounded-lg transition-all hover:bg-theme-element-sec disabled:opacity-50 disabled:cursor-not-allowed">Previous</Button>
                            <span className="px-4 py-2 bg-theme-element-sec border border-theme-accent/10 text-foreground text-xs font-black rounded-lg select-none">Page {permPage} of {totalPermPages}</span>
                            <Button variant="none" disabled={permPage === totalPermPages} onClick={() => setPermPage(prev => Math.min(prev + 1, totalPermPages))} className="px-4 py-2 bg-theme-element border border-theme-accent/20 text-foreground text-xs font-black rounded-lg transition-all hover:bg-theme-element-sec disabled:opacity-50 disabled:cursor-not-allowed">Next</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
