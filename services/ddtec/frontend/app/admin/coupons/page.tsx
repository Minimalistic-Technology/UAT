"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Plus, Tag, Edit, X, Save, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";
import { countWords, limitWords } from "@/lib/utils";

const COUPON_DESCRIPTION_MAX_WORDS = 100;

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    type: 'product' | 'cart' | 'shipping';
    minOrderValue: number;
    usageLimit: number | null;
    usedCount: number;
    isActive: boolean;
    expiresAt?: string;
    applicableProducts?: { _id: string, name: string }[];
}

interface ProductOption {
    _id: string;
    name: string;
}

const EMPTY_COUPON_FORM = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    type: "cart",
    minOrderValue: "",
    applicableProducts: [] as string[],
    usageLimit: "",
    expiresAt: ""
};

const CouponsPage = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Coupon Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [formData, setFormData] = useState(EMPTY_COUPON_FORM);

    useEffect(() => {
        fetchCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error("Failed to fetch coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const openCreateModal = () => {
        setFormData(EMPTY_COUPON_FORM);
        setIsCreateModalOpen(true);
        fetchProducts();
    };

    const generateCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const toggleProduct = (productId: string) => {
        setFormData(prev => {
            const current = prev.applicableProducts;
            if (current.includes(productId)) {
                return { ...prev, applicableProducts: current.filter(id => id !== productId) };
            } else {
                return { ...prev, applicableProducts: [...current, productId] };
            }
        });
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderValue: Number(formData.minOrderValue) || 0,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
            };

            await api.post('/coupons', payload);
            showToast("Coupon created successfully!", "success");
            setIsCreateModalOpen(false);
            fetchCoupons();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || error.response?.data?.msg || "Failed to create coupon", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this coupon?", variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCoupons(coupons.filter(c => c._id !== id));
            showToast("Coupon deleted successfully", "success");
        } catch (error) {
            console.error("Failed to delete coupon", error);
            showToast("Failed to delete coupon", "error");
        }
    };

    const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
        try {
            // Check if endpoint exists, if not we might need to create it or use update
            // Assuming a patch/put endpoint for status or generic update
            // For now, let's assume we can update the coupon with the new status
            await api.put(`/coupons/${id}`, { isActive: !currentStatus });
            setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (error: any) {
            console.error("Failed to update coupon status", error);
            showToast(error.response?.data?.msg || "Failed to update status", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Tag className="size-8 text-teal-600" />
                        Manage Coupons
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Create and manage discount codes for your store.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20"
                >
                    <Plus className="size-4" /> Create Coupon
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Coupons</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="p-4">Code</th>
                                <th className="p-4">Products</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Min Spend</th>
                                <th className="p-4">Usage</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {coupons.length > 0 ? (
                                coupons.map(coupon => (
                                    <tr key={coupon._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded w-fit">
                                                    {coupon.code}
                                                </span>
                                                <span className="text-xs text-slate-500 mt-1 capitalize">{coupon.type}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            {coupon.type === 'product' && coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {coupon.applicableProducts.map(p => (
                                                        <span key={p._id} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                                            {p.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-900 dark:text-white font-medium">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : '-'}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {coupon.usedCount} / {coupon.usageLimit === null ? '∞' : coupon.usageLimit}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right flex justify-end items-center gap-2">
                                            <ToggleSwitch isOn={coupon.isActive} onToggle={() => toggleCouponStatus(coupon._id, coupon.isActive)} title={coupon.isActive ? "Deactivate Coupon" : "Activate Coupon"} />
                                            <button
                                                onClick={() => router.push(`/admin/coupons/${coupon._id}`)}
                                                className="cursor-pointer text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit Coupon"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                className="cursor-pointer text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        No coupons found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsCreateModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Coupon</h3>
                                <button onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors">
                                    <X className="size-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSubmit} className="flex flex-col max-h-[80vh]">
                                <div className="p-6 space-y-5 overflow-y-auto">
                                    {/* Code & Generation */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coupon Code <span className="text-red-500">*</span></label>
                                        <div className="flex gap-2">
                                            <input
                                                required
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono tracking-wider"
                                                placeholder="e.g. SUMMER2024"
                                                maxLength={10}
                                            />
                                            <button
                                                type="button"
                                                onClick={generateCode}
                                                className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                                            >
                                                <RefreshCw className="size-4" /> Generate
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">10-character alphanumeric code.</p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: limitWords(e.target.value, COUPON_DESCRIPTION_MAX_WORDS) })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none resize-none h-20"
                                            placeholder="Internal note or description..."
                                        />
                                        <p className={`text-xs mt-1 text-right ${countWords(formData.description) >= COUPON_DESCRIPTION_MAX_WORDS ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                                            {countWords(formData.description)}/{COUPON_DESCRIPTION_MAX_WORDS} words
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Coupon Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                                className="cursor-pointer w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            >
                                                <option value="cart">Cart Wide</option>
                                                <option value="product">Product Specific</option>
                                                <option value="shipping">Free Shipping</option>
                                            </select>
                                        </div>

                                        {/* Discount Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Discount Type</label>
                                            <select
                                                disabled={formData.type === 'shipping'}
                                                value={formData.discountType}
                                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                                                className="cursor-pointer w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Value & Min Order */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Discount Value {formData.type !== 'shipping' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                disabled={formData.type === 'shipping'}
                                                required={formData.type !== 'shipping'}
                                                type="number"
                                                min="0"
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50"
                                                placeholder={formData.discountType === 'percentage' ? "10" : "100"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Order Value</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.minOrderValue}
                                                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Selection (Conditional) */}
                                    {formData.type === 'product' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Applicable Products</label>
                                            <div className="border border-slate-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900">
                                                {loadingProducts ? (
                                                    <div className="text-center p-4 text-sm text-slate-500">Loading products...</div>
                                                ) : products.length === 0 ? (
                                                    <div className="text-center p-4 text-sm text-slate-500">No products found.</div>
                                                ) : (
                                                    products.map(product => (
                                                        <div key={product._id} className="cursor-pointer flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" onClick={() => toggleProduct(product._id)}>
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.applicableProducts.includes(product._id)}
                                                                onChange={() => { }}
                                                                className="cursor-pointer rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                            />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300">{product.name}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Select products this coupon applies to.</p>
                                        </div>
                                    )}

                                    {/* Limits */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Usage Limit</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.usageLimit}
                                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Unlimited"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                                            <input
                                                type="datetime-local"
                                                value={formData.expiresAt}
                                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                                className="cursor-pointer w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="cursor-pointer px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="cursor-pointer px-6 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin size-4" /> : (
                                            <>
                                                <Save className="size-4" /> Create Coupon
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CouponsPage;
