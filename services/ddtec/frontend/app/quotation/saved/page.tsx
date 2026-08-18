"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    FileText,
    Plus,
    Search,
    Download,
    Trash2,
    Copy,
    Loader2,
    Calendar,
    User,
    Building,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    AlertTriangle,
    X
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "../../_context/ToastContext";

interface SavedQuotationItem {
    itemId?: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    cgst: number;
    sgst: number;
    hsnCode?: string;
}

interface SavedQuotation {
    _id: string;
    title?: string;
    quotationNumber: string;
    buyer: {
        name: string;
        address?: string;
        gstin?: string;
        stateName?: string;
    };
    items: SavedQuotationItem[];
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    notes?: string;
    createdAt: string;
}

export default function SavedQuotationsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const isAdminView = pathname?.startsWith('/admin');
    const { showToast } = useToast();

    const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchSavedQuotations();
    }, []);

    const fetchSavedQuotations = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/quotation/saved");
            setQuotations(data);
        } catch (error: any) {
            console.error("Failed to fetch saved quotations", error);
            showToast(error.response?.data?.msg || "Failed to load saved quotations.", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreateSimilar = (id: string) => {
        router.push(`/admin?view=create_quotation&load=${id}`);
    };

    const handleDuplicate = async (id: string) => {
        setDuplicatingId(id);
        try {
            const { data } = await api.post(`/quotation/saved/${id}/duplicate`);
            showToast(data.msg || "Quotation duplicated successfully!", "success");
            fetchSavedQuotations();
        } catch (error: any) {
            console.error("Failed to duplicate quotation", error);
            showToast(error.response?.data?.msg || "Failed to duplicate quotation.", "error");
        } finally {
            setDuplicatingId(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal) return;
        const { id } = deleteModal;
        setDeletingId(id);
        try {
            await api.delete(`/quotation/saved/${id}`);
            setQuotations(prev => prev.filter(q => q._id !== id));
            showToast("Quotation deleted successfully", "success");
        } catch (error: any) {
            console.error("Failed to delete quotation", error);
            showToast(error.response?.data?.msg || "Failed to delete quotation.", "error");
        } finally {
            setDeletingId(null);
            setDeleteModal(null);
        }
    };

    const handleDownloadPdf = async (quotation: SavedQuotation) => {
        setDownloadingId(quotation._id);
        try {
            const response = await api.post(
                "/quotation/generate",
                {
                    items: quotation.items,
                    buyer: quotation.buyer
                },
                { responseType: "blob" }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${quotation.quotationNumber}-${(quotation.buyer.name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast("Quotation PDF downloaded successfully!", "success");
        } catch (error: any) {
            console.error("PDF generation error", error);
            showToast("Failed to download PDF.", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredQuotations = quotations
        .filter(q => {
            const query = search.toLowerCase();
            return (
                (q.title && q.title.toLowerCase().includes(query)) ||
                (q.quotationNumber && q.quotationNumber.toLowerCase().includes(query)) ||
                (q.buyer?.name && q.buyer.name.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            if (sortBy === "date_desc") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === "date_asc") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === "amount_desc") {
                return (b.grandTotal || 0) - (a.grandTotal || 0);
            } else if (sortBy === "amount_asc") {
                return (a.grandTotal || 0) - (b.grandTotal || 0);
            }
            return 0;
        });

    const handleCreateNewClick = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push("/admin?view=create_quotation");
    };

    return (
        <div className={isAdminView ? "w-full py-2" : "min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4"}>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Top Header & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText className="size-7 text-teal-600" />
                            Saved Quotations
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                            Access all your saved quotations, create similar ones for new clients, or download official PDF invoices.
                        </p>
                    </div>

                    {/* Primary Action Button to Create New Quotation */}
                    <div className="shrink-0">
                        <button
                            onClick={handleCreateNewClick}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 text-sm cursor-pointer"
                        >
                            <Plus className="size-5" />
                            Create New Quotation
                        </button>
                    </div>
                </div>


                {/* Search & Sort Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, quotation #, or company name..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-xs"
                        />
                    </div>

                    <div className="relative shrink-0 w-full sm:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none shadow-xs font-medium cursor-pointer"
                        >
                            <option value="date_desc">Sort by Date: Newest First</option>
                            <option value="date_asc">Sort by Date: Oldest First</option>
                            <option value="amount_desc">Sort by Amount: High to Low</option>
                            <option value="amount_asc">Sort by Amount: Low to High</option>
                        </select>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <Loader2 className="animate-spin text-teal-600 size-10 mb-2" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading saved quotations...</p>
                    </div>
                ) : filteredQuotations.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <FileText className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            {search ? "No quotations found matching search" : "No saved quotations yet"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
                            {search
                                ? "Try searching with a different term or clear the filter."
                                : "Create your first quotation and save it so you can easily reuse it whenever similar requirements arise."}
                        </p>
                        {!search && (
                            <button
                                onClick={handleCreateNewClick}
                                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md text-sm cursor-pointer"
                            >
                                <Plus className="size-5" />
                                Create New Quotation
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredQuotations.map(quotation => {
                            const isExpanded = !!expandedIds[quotation._id];
                            const previewItems = isExpanded ? quotation.items : quotation.items.slice(0, 2);
                            const remainingCount = quotation.items.length - 2;

                            return (
                                <div
                                    key={quotation._id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                                >
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                                    {quotation.quotationNumber}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar className="size-3.5" />
                                                    {new Date(quotation.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                                                {quotation.title || `Quotation for ${quotation.buyer?.name}`}
                                            </h3>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-xs text-slate-400 uppercase font-semibold">Grand Total</span>
                                            <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                                                ₹{quotation.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Company Details & Summary */}
                                    <div className="p-5 space-y-4 flex-1">
                                        <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl space-y-1 text-xs">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                                                <Building className="size-3.5 text-teal-600" />
                                                <span>Company: {quotation.buyer?.name}</span>
                                            </div>
                                            {quotation.buyer?.address && (
                                                <p className="text-slate-500 dark:text-slate-400 line-clamp-1 pl-5">
                                                    {quotation.buyer.address}
                                                </p>
                                            )}
                                            {(quotation.buyer?.gstin || quotation.buyer?.stateName) && (
                                                <p className="text-slate-400 dark:text-slate-500 pl-5">
                                                    {quotation.buyer.gstin ? `GSTIN: ${quotation.buyer.gstin}` : ""}
                                                    {quotation.buyer.gstin && quotation.buyer.stateName ? " | " : ""}
                                                    {quotation.buyer.stateName ? `State: ${quotation.buyer.stateName}` : ""}
                                                </p>
                                            )}
                                        </div>

                                        {/* Items breakdown */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <span>Included Products ({quotation.items.length})</span>
                                                {quotation.items.length > 2 && (
                                                    <button
                                                        onClick={() => toggleExpand(quotation._id)}
                                                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-bold"
                                                    >
                                                        {isExpanded ? (
                                                            <>Show Less <ChevronUp className="size-3" /></>
                                                        ) : (
                                                            <>Show All ({quotation.items.length}) <ChevronDown className="size-3" /></>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-1.5 border border-slate-100 dark:border-slate-700 rounded-xl p-3 bg-white dark:bg-slate-800">
                                                {previewItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-[240px]">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                                                            {item.quantity} {item.unit || "Nos"} × ₹{item.price.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                                {!isExpanded && remainingCount > 0 && (
                                                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-50 dark:border-slate-700">
                                                        + {remainingCount} more item{remainingCount > 1 ? "s" : ""}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 grid grid-cols-2 gap-2">
                                        {/* Button to Create Similar / Load into Builder */}
                                        <button
                                            onClick={() => handleCreateSimilar(quotation._id)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            title="Load details into creation page to generate a similar quotation"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            Use Template
                                        </button>

                                        {/* Download PDF Button */}
                                        <button
                                            onClick={() => handleDownloadPdf(quotation)}
                                            disabled={downloadingId === quotation._id}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {downloadingId === quotation._id ? (
                                                <Loader2 className="animate-spin size-3.5" />
                                            ) : (
                                                <Download className="size-3.5 text-teal-400" />
                                            )}
                                            Download PDF
                                        </button>

                                        {/* Duplicate Button */}
                                        <button
                                            onClick={() => handleDuplicate(quotation._id)}
                                            disabled={duplicatingId === quotation._id}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {duplicatingId === quotation._id ? (
                                                <Loader2 className="animate-spin size-3.5" />
                                            ) : (
                                                <Copy className="size-3.5 text-teal-600" />
                                            )}
                                            Duplicate
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => setDeleteModal({ id: quotation._id, title: quotation.title || quotation.quotationNumber })}
                                            disabled={deletingId === quotation._id}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === quotation._id ? (
                                                <Loader2 className="animate-spin size-3.5" />
                                            ) : (
                                                <Trash2 className="size-3.5" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom Confirmation Alert Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between pb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Saved Quotation</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Confirm permanent deletion</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 py-3 border-y border-slate-100 dark:border-slate-700">
                            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteModal.title}"</span>? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={!!deletingId}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {deletingId ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                Delete Quotation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
