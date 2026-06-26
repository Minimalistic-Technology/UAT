"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function UsersTab() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get('/admin/users').then((res) => {
            if (!isMounted) return;
            setUsers(res.data.data || []);
            setIsLoading(false);
        }).catch(() => {
            if (!isMounted) return;
            toast.error('Failed to load users data');
            setIsLoading(false);
        });
        return () => { isMounted = false; };
    }, []);

    const handleRoleChange = async (userId: string, targetRole: string) => {
        const previousUsers = users;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
        toast.success('User role changed successfully!');
        try {
            await api.put(`/admin/users/${userId}`, { role: targetRole });
        } catch {
            setUsers(previousUsers);
            toast.error('Failed to change user role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('De-register this user? This removes all active profiles from DB.')) return;
        const previousUsers = users;
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('User account removed');
        try {
            await api.delete(`/admin/users/${userId}`);
        } catch (err: any) {
            setUsers(previousUsers);
            toast.error(err.response?.data?.message || 'Access Denied: cannot execute accounts action');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-theme-action border-t-transparent animate-spin" /></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-theme-element border border-theme-accent/20 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-theme-accent/10 bg-theme-element-sec/50">
                    <h3 className="text-xl font-black text-foreground tracking-tight">System Users & Access Levels</h3>
                    <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Active Accounts Grid</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-theme-accent/10 bg-theme-element-sec/20 text-xs font-black uppercase tracking-wider text-foreground/60">
                                <th className="py-4 px-6">Name</th><th className="py-4 px-6">Email Address</th><th className="py-4 px-6">User Role</th><th className="py-4 px-6 text-center">Auth Status</th><th className="py-4 px-6 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-accent/5">
                            {users.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm font-semibold text-foreground/50">No user accounts registered.</td></tr>
                            ) : (
                                users.map((item) => (
                                    <tr key={item.id} className="hover:bg-theme-element-sec/20 transition-colors text-sm font-semibold text-foreground/80">
                                        <td className="py-4 px-6">{item.firstName} {item.lastName}</td>
                                        <td className="py-4 px-6 font-mono text-xs">{item.email}</td>
                                        <td className="py-4 px-6">
                                            <select value={item.role} onChange={(e) => handleRoleChange(item.id, e.target.value)} className="bg-theme-element-sec border border-theme-accent/25 text-foreground font-black uppercase tracking-wider text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-theme-action">
                                                <option value="user">User</option><option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.isVerified ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.isVerified ? 'bg-green-500' : 'bg-orange-500'}`} />{item.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button variant="none" size="none" onClick={() => handleDeleteUser(item.id)} className="p-2.5 bg-theme-element text-foreground/45 border border-theme-accent/20 rounded-xl hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all shadow-sm" title="Delete User Account"><Trash2 size={16} /></Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
