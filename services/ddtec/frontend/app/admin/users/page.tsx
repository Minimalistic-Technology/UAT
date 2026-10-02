"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Plus, Coins, CheckCircle2, Edit, Trash2, Loader2, X } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    creditBalance?: number;
}

export default function UsersPage() {
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [usersList, setUsersList] = useState<User[]>([]);
    const [userTabMode, setUserTabMode] = useState<'customers' | 'staff'>('customers');
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });

    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const fetchUsers = async () => {
        setLoadingData(true);
        try {
            const res = await api.get('/admin/users');
            setUsersList(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/auth/users/${id}/status`);
            setUsersList(prev => prev.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error(error);
            showToast("Failed to update user status", "error");
        }
    };

    const handleDeleteUser = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this user?", variant: "danger" });
        if (!ok) return;
        await api.delete(`/admin/users/${id}`);
        showToast("User deleted successfully", "success");
        fetchUsers();
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/create-user', newUser);
            fetchUsers();
            setIsAddUserModalOpen(false);
            setNewUser({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });
            showToast("User created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create user", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUserClick = (user: User) => {
        const { password, ...rest } = user as any;
        setEditingUser(rest);
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...editingUser };
            if (!payload.password) delete payload.password;

            await api.put(`/auth/users/${editingUser._id}`, payload);
            fetchUsers();
            setIsEditUserModalOpen(false);
            setEditingUser(null);
            showToast("User updated successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to update user", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                            <button
                                onClick={() => setUserTabMode('customers')}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'customers'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Users className="size-4" /> Customers
                            </button>
                            <button
                                onClick={() => setUserTabMode('staff')}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'staff'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Shield className="size-4" /> Staff Members
                            </button>
                        </div>
                    </div>
                    <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shrink-0">
                        <Plus className="size-4" /> Add {userTabMode === 'customers' ? 'User' : 'Staff'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                {userTabMode === 'customers' && <th className="p-4">Credit</th>}
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loadingData ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <Loader2 className="animate-spin text-teal-600 size-8 mx-auto" />
                                    </td>
                                </tr>
                            ) : (
                                usersList
                                    .filter(u => userTabMode === 'customers' ? u.role === 'user' : u.role !== 'user')
                                    .map(u => (
                                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="p-4 font-medium text-slate-900 dark:text-white">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.name || u.email.split('@')[0])}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            {userTabMode === 'customers' && (
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                        <Coins className="size-3.5 text-amber-500" />
                                                        {u.creditBalance || 0}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-4 text-right flex justify-end items-center gap-2">
                                                {!u.isActive && (
                                                    <button
                                                        onClick={() => toggleUserStatus(u._id, u.isActive)}
                                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                                        title="Approve User Account"
                                                    >
                                                        <CheckCircle2 className="size-3.5" /> Approve Account
                                                    </button>
                                                )}
                                                <ToggleSwitch isOn={u.isActive} onToggle={() => toggleUserStatus(u._id, u.isActive)} />
                                                <button onClick={() => handleEditUserClick(u)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit User">
                                                    <Edit className="size-4" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete User">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddUserModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsAddUserModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h3>
                                <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.firstName}
                                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={newUser.lastName}
                                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                        <input
                                            required
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddUserModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isEditUserModalOpen && editingUser && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsEditUserModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                                <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateUser} className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                            <input
                                                type="text"
                                                value={editingUser.firstName || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                            <input
                                                type="text"
                                                value={editingUser.lastName || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editingUser.email || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={editingUser.phone || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            value={editingUser.password || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditUserModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
