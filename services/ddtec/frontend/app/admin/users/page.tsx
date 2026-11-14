"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, Plus, Coins, Edit, Trash2, Loader2, X } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";
import Pagination from "@/app/_components/Pagination";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const MAX_NAME_LEN = 50;
const MAX_EMAIL_LEN = 100;
const MAX_PHONE_LEN = 20;

interface AddUserFormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
}

interface EditUserFormErrors {
    firstName?: string;
    lastName?: string;
}

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

    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);

    const filteredUsers = useMemo(() => {
        return usersList.filter(u => userTabMode === 'customers' ? u.role === 'user' : u.role !== 'user');
    }, [usersList, userTabMode]);

    useEffect(() => {
        setPage(1);
    }, [userTabMode, usersList.length]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    const pagedUsers = useMemo(() => {
        return filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredUsers, page, pageSize]);

    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });
    const [addUserErrors, setAddUserErrors] = useState<AddUserFormErrors>({});

    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editUserErrors, setEditUserErrors] = useState<EditUserFormErrors>({});

    const validateAddUser = (): boolean => {
        const errors: AddUserFormErrors = {};
        const fName = newUser.firstName.trim();
        const lName = newUser.lastName.trim();
        const email = newUser.email.trim();
        const phone = newUser.phone.trim();
        const pwd = newUser.password;

        if (!fName) {
            errors.firstName = 'First name is required and cannot be empty';
        } else if (fName.length > MAX_NAME_LEN) {
            errors.firstName = `First name must be under ${MAX_NAME_LEN} characters`;
        }

        if (!lName) {
            errors.lastName = 'Last name is required and cannot be empty';
        } else if (lName.length > MAX_NAME_LEN) {
            errors.lastName = `Last name must be under ${MAX_NAME_LEN} characters`;
        }

        if (!email) {
            errors.email = 'Email is required and cannot be empty';
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Enter a valid email address';
        } else if (email.length > MAX_EMAIL_LEN) {
            errors.email = `Email must be under ${MAX_EMAIL_LEN} characters`;
        }

        if (phone) {
            if (!PHONE_REGEX.test(phone)) {
                errors.phone = 'Enter a valid phone number (7-20 digits)';
            } else if (phone.length > MAX_PHONE_LEN) {
                errors.phone = `Phone number must be under ${MAX_PHONE_LEN} characters`;
            }
        }

        if (!pwd) {
            errors.password = 'Password is required';
        } else if (pwd.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } else if (pwd.length > 128) {
            errors.password = 'Password must be under 128 characters';
        }

        setAddUserErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateEditUser = (): boolean => {
        const errors: EditUserFormErrors = {};
        const fName = (editingUser?.firstName || '').trim();
        const lName = (editingUser?.lastName || '').trim();

        if (!fName) {
            errors.firstName = 'First name is required and cannot be empty';
        } else if (fName.length > MAX_NAME_LEN) {
            errors.firstName = `First name must be under ${MAX_NAME_LEN} characters`;
        }

        if (!lName) {
            errors.lastName = 'Last name is required and cannot be empty';
        } else if (lName.length > MAX_NAME_LEN) {
            errors.lastName = `Last name must be under ${MAX_NAME_LEN} characters`;
        }

        setEditUserErrors(errors);
        return Object.keys(errors).length === 0;
    };

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
        if (!validateAddUser()) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                firstName: newUser.firstName.trim(),
                lastName: newUser.lastName.trim(),
                email: newUser.email.trim(),
                phone: newUser.phone.trim() || undefined,
                password: newUser.password,
                role: newUser.role,
            };
            await api.post('/auth/create-user', payload);
            fetchUsers();
            setIsAddUserModalOpen(false);
            setNewUser({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "user" });
            setAddUserErrors({});
            showToast("User created successfully", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to create user", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUserClick = (user: User) => {
        setEditingUser({
            _id: user._id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
        });
        setEditUserErrors({});
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEditUser()) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                firstName: editingUser.firstName.trim(),
                lastName: editingUser.lastName.trim(),
            };

            await api.put(`/auth/users/${editingUser._id}`, payload);
            fetchUsers();
            setIsEditUserModalOpen(false);
            setEditingUser(null);
            setEditUserErrors({});
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
                                className={`cursor-pointer px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'customers'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Users className="size-4" /> Customers
                            </button>
                            <button
                                onClick={() => setUserTabMode('staff')}
                                className={`cursor-pointer px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${userTabMode === 'staff'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Shield className="size-4" /> Staff Members
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setNewUser({ firstName: "", lastName: "", email: "", phone: "", password: "", role: userTabMode === 'customers' ? 'user' : 'admin' });
                            setAddUserErrors({});
                            setIsAddUserModalOpen(true);
                        }}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shrink-0"
                    >
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
                                pagedUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4 font-medium text-slate-900 dark:text-white">{u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || u.email.split('@')[0])}</td>
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
                                            <ToggleSwitch isOn={u.isActive} onToggle={() => toggleUserStatus(u._id, u.isActive)} title={u.isActive ? "Deactivate User" : "Activate User"} />
                                            <button onClick={() => handleEditUserClick(u)} className="cursor-pointer text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit User">
                                                <Edit className="size-4" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(u._id)} className="cursor-pointer text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete User">
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={filteredUsers.length}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            variant="admin"
                        />
                    </div>
                )}
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
                                <button onClick={() => setIsAddUserModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} noValidate className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <span className={`text-[11px] ${newUser.firstName.length >= MAX_NAME_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                    {newUser.firstName.length}/{MAX_NAME_LEN}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={MAX_NAME_LEN}
                                                value={newUser.firstName}
                                                onChange={(e) => {
                                                    setNewUser({ ...newUser, firstName: e.target.value });
                                                    setAddUserErrors(prev => ({ ...prev, firstName: undefined }));
                                                }}
                                                placeholder="First name"
                                                className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                    addUserErrors.firstName ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                                }`}
                                            />
                                            {addUserErrors.firstName && <p className="text-xs text-red-500 mt-1">{addUserErrors.firstName}</p>}
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <span className={`text-[11px] ${newUser.lastName.length >= MAX_NAME_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                    {newUser.lastName.length}/{MAX_NAME_LEN}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={MAX_NAME_LEN}
                                                value={newUser.lastName}
                                                onChange={(e) => {
                                                    setNewUser({ ...newUser, lastName: e.target.value });
                                                    setAddUserErrors(prev => ({ ...prev, lastName: undefined }));
                                                }}
                                                placeholder="Last name"
                                                className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                    addUserErrors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                                }`}
                                            />
                                            {addUserErrors.lastName && <p className="text-xs text-red-500 mt-1">{addUserErrors.lastName}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <span className={`text-[11px] ${newUser.email.length >= MAX_EMAIL_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                {newUser.email.length}/{MAX_EMAIL_LEN}
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            maxLength={MAX_EMAIL_LEN}
                                            value={newUser.email}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, email: e.target.value });
                                                setAddUserErrors(prev => ({ ...prev, email: undefined }));
                                            }}
                                            placeholder="user@example.com"
                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                addUserErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                            }`}
                                        />
                                        {addUserErrors.email && <p className="text-xs text-red-500 mt-1">{addUserErrors.email}</p>}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Phone <span className="text-xs font-normal text-slate-400">(optional)</span>
                                            </label>
                                            <span className={`text-[11px] ${newUser.phone.length >= MAX_PHONE_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                {newUser.phone.length}/{MAX_PHONE_LEN}
                                            </span>
                                        </div>
                                        <input
                                            type="tel"
                                            maxLength={MAX_PHONE_LEN}
                                            value={newUser.phone}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, phone: e.target.value });
                                                setAddUserErrors(prev => ({ ...prev, phone: undefined }));
                                            }}
                                            placeholder="+91 9876543210"
                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                addUserErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                            }`}
                                        />
                                        {addUserErrors.phone && <p className="text-xs text-red-500 mt-1">{addUserErrors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => {
                                                setNewUser({ ...newUser, password: e.target.value });
                                                setAddUserErrors(prev => ({ ...prev, password: undefined }));
                                            }}
                                            placeholder="At least 6 characters"
                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                addUserErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                            }`}
                                        />
                                        {addUserErrors.password && <p className="text-xs text-red-500 mt-1">{addUserErrors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="cursor-pointer w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
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
                                        className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update user name details</p>
                                </div>
                                <button onClick={() => setIsEditUserModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateUser} noValidate className="flex flex-col max-h-[90vh]">
                                <div className="p-6 space-y-4 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <span className={`text-[11px] ${(editingUser.firstName || '').length >= MAX_NAME_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                    {(editingUser.firstName || '').length}/{MAX_NAME_LEN}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={MAX_NAME_LEN}
                                                value={editingUser.firstName || ''}
                                                onChange={(e) => {
                                                    setEditingUser({ ...editingUser, firstName: e.target.value });
                                                    setEditUserErrors(prev => ({ ...prev, firstName: undefined }));
                                                }}
                                                placeholder="First name"
                                                className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                    editUserErrors.firstName ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                                }`}
                                            />
                                            {editUserErrors.firstName && <p className="text-xs text-red-500 mt-1">{editUserErrors.firstName}</p>}
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <span className={`text-[11px] ${(editingUser.lastName || '').length >= MAX_NAME_LEN ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                                    {(editingUser.lastName || '').length}/{MAX_NAME_LEN}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                maxLength={MAX_NAME_LEN}
                                                value={editingUser.lastName || ''}
                                                onChange={(e) => {
                                                    setEditingUser({ ...editingUser, lastName: e.target.value });
                                                    setEditUserErrors(prev => ({ ...prev, lastName: undefined }));
                                                }}
                                                placeholder="Last name"
                                                className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                                    editUserErrors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'
                                                }`}
                                            />
                                            {editUserErrors.lastName && <p className="text-xs text-red-500 mt-1">{editUserErrors.lastName}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Email Address
                                            </label>
                                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                                Cannot be changed
                                            </span>
                                        </div>
                                        <input
                                            type="email"
                                            value={editingUser.email || ''}
                                            disabled
                                            readOnly
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none select-none"
                                        />
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            The email address is permanently associated with this user account and cannot be modified.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditUserModalOpen(false)}
                                        className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
