"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    PackageCheck,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Calendar,
    DollarSign,
    Building2,
    FileText,
    Upload,
    X,
    Check,
    Loader2,
    Tag,
    Clock,
    Sparkles,
    AlertCircle,
    Boxes
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';

export interface ProductItem {
    _id: string;
    name: string;
    stock: number;
    price: number;
    costPrice?: number;
    seller?: string;
    image?: string;
    category?: any;
}

export interface PurchaseRecord {
    _id: string;
    product: ProductItem | string;
    productName: string;
    seller: string;
    sellerContact?: string;
    quantityAdded: number;
    unitCost: number;
    totalCost: number;
    purchaseDate: string;
    billScreenshot?: string;
    invoiceNumber?: string;
    notes?: string;
    createdBy?: any;
    createdAt: string;
    updatedAt: string;
}

interface PurchaseRecordsViewProps {
    productsList: ProductItem[];
    categoriesList: any[];
    onRefreshProducts: () => void;
}

export default function PurchaseRecordsView({
    productsList,
    categoriesList,
    onRefreshProducts
}: PurchaseRecordsViewProps) {
    const { showToast } = useToast();
    const [records, setRecords] = useState<PurchaseRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedSellerFilter, setSelectedSellerFilter] = useState<string>('All');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form State
    const [isNewProductMode, setIsNewProductMode] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        productId: '',
        name: '',
        price: '',
        category: '',
        description: '',
        image: '',
        cgst: '',
        sgst: '',
        seller: '',
        sellerContact: '',
        quantityAdded: '',
        unitCost: '',
        purchaseDate: new Date().toISOString().slice(0, 16),
        billScreenshot: '',
        invoiceNumber: '',
        notes: ''
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/purchases');
            setRecords(data);
        } catch (error: any) {
            console.error('Failed to fetch purchase records', error);
            showToast('Failed to load purchase records', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Extract unique sellers list
    const uniqueSellers = useMemo(() => {
        const sellersSet = new Set<string>();
        records.forEach(r => {
            if (r.seller) sellersSet.add(r.seller);
        });
        return Array.from(sellersSet);
    }, [records]);

    // Computed Metrics
    const totalPurchasesValuation = useMemo(() => {
        return records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    }, [records]);

    const totalUnitsRestocked = useMemo(() => {
        return records.reduce((sum, r) => sum + (r.quantityAdded || 0), 0);
    }, [records]);

    // Filtered Records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch =
                r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesSeller =
                selectedSellerFilter === 'All' || r.seller.toLowerCase() === selectedSellerFilter.toLowerCase();

            return matchesSearch && matchesSeller;
        });
    }, [records, searchQuery, selectedSellerFilter]);

    // Open Modal for Create
    const handleOpenCreateModal = () => {
        setEditingRecord(null);
        setIsNewProductMode(false);
        setFormData({
            productId: productsList.length > 0 ? productsList[0]._id : '',
            name: '',
            price: '',
            category: categoriesList.length > 0 ? categoriesList[0]._id : '',
            description: '',
            image: '',
            cgst: '',
            sgst: '',
            seller: '',
            sellerContact: '',
            quantityAdded: '10',
            unitCost: '0',
            purchaseDate: new Date().toISOString().slice(0, 16),
            billScreenshot: '',
            invoiceNumber: '',
            notes: ''
        });
        setIsAddModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (record: PurchaseRecord) => {
        setEditingRecord(record);
        setIsNewProductMode(false);

        const prodId = typeof record.product === 'object' && record.product !== null ? record.product._id : record.product;

        setFormData({
            productId: prodId || '',
            name: record.productName,
            price: '',
            category: '',
            description: '',
            image: '',
            cgst: '',
            sgst: '',
            seller: record.seller || '',
            sellerContact: record.sellerContact || '',
            quantityAdded: record.quantityAdded.toString(),
            unitCost: record.unitCost.toString(),
            purchaseDate: record.purchaseDate ? new Date(record.purchaseDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            billScreenshot: record.billScreenshot || '',
            invoiceNumber: record.invoiceNumber || '',
            notes: record.notes || ''
        });
        setIsAddModalOpen(true);
    };

    // Handle File Upload to Base64 Data URL
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be under 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setFormData(prev => ({ ...prev, billScreenshot: reader.result as string }));
                showToast('Bill screenshot uploaded successfully', 'success');
            }
        };
        reader.readAsDataURL(file);
    };

    // Handle Form Submit (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.seller.trim()) {
            showToast('Seller name is required', 'error');
            return;
        }

        const qty = Number(formData.quantityAdded);
        if (isNaN(qty) || qty === 0) {
            showToast('Please enter a valid quantity', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                // Update existing record
                await api.put(`/purchases/${editingRecord._id}`, {
                    seller: formData.seller,
                    sellerContact: formData.sellerContact,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: formData.billScreenshot,
                    invoiceNumber: formData.invoiceNumber,
                    notes: formData.notes
                });
                showToast('Purchase record updated & inventory synced!', 'success');
            } else {
                // Create new record
                await api.post('/purchases', {
                    isNewProduct: isNewProductMode,
                    productId: isNewProductMode ? undefined : formData.productId,
                    name: formData.name,
                    price: Number(formData.price) || 0,
                    category: formData.category,
                    description: formData.description,
                    image: formData.image,
                    cgst: Number(formData.cgst) || 0,
                    sgst: Number(formData.sgst) || 0,
                    seller: formData.seller,
                    sellerContact: formData.sellerContact,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: formData.billScreenshot,
                    invoiceNumber: formData.invoiceNumber,
                    notes: formData.notes
                });
                showToast('Purchase record created & inventory synced!', 'success');
            }

            setIsAddModalOpen(false);
            fetchRecords();
            onRefreshProducts();
        } catch (error: any) {
            console.error('Error saving purchase record:', error);
            showToast(error.response?.data?.msg || 'Failed to save purchase record', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Record
    const handleDeleteRecord = async (id: string, productName: string) => {
        if (!confirm(`Are you sure you want to delete the purchase record for "${productName}"? This will adjust product inventory accordingly.`)) {
            return;
        }

        try {
            await api.delete(`/purchases/${id}`);
            showToast('Purchase record deleted and inventory stock adjusted', 'success');
            fetchRecords();
            onRefreshProducts();
        } catch (error: any) {
            console.error('Failed to delete purchase record', error);
            showToast(error.response?.data?.msg || 'Failed to delete record', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                            <DollarSign className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Purchase Cost</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                ₹{totalPurchasesValuation.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Boxes className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Units Restocked</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                {totalUnitsRestocked.toLocaleString()} units
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                            <Building2 className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Sellers</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                {uniqueSellers.length} Vendors
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                            <PackageCheck className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Purchase Logs</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                {records.length} Entries
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                        <input
                            type="text"
                            placeholder="Search product, seller, invoice..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Filter Seller */}
                    <select
                        value={selectedSellerFilter}
                        onChange={(e) => setSelectedSellerFilter(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        <option value="All">All Sellers / Suppliers</option>
                        {uniqueSellers.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleOpenCreateModal}
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="size-4" /> Add Inventory Record / Purchase
                </button>
            </div>

            {/* Purchase Records Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="size-5 text-teal-600" /> Inventory Update & Purchase History Log
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">Synced with product inventory</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <Loader2 className="size-8 text-teal-600 animate-spin" />
                        <span className="text-slate-500 text-xs font-bold">Loading purchase records...</span>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <PackageCheck className="size-14 text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">No Purchase Records Found</p>
                        <p className="text-xs text-slate-500 mt-1">Click "+ Add Inventory Record / Purchase" to log new stock updates with seller info and bill screenshots.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        {filteredRecords.map((record) => {
                            const pImg = typeof record.product === 'object' && record.product?.image ? record.product.image : null;

                            return (
                                <div key={record._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-all">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
                                        <div className="flex items-center gap-2.5 min-w-[180px]">
                                            {pImg && (
                                                <img
                                                    src={pImg}
                                                    alt={record.productName}
                                                    className="size-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 shrink-0"
                                                />
                                            )}
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    {record.productName}
                                                </span>
                                                {typeof record.product === 'object' && record.product?.stock !== undefined && (
                                                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                                                        Current Stock: {record.product.stock} units
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                            {new Date(record.purchaseDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            <span className="block text-[10px] text-slate-400">
                                                {new Date(record.purchaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="text-slate-800 dark:text-slate-200 min-w-[140px]">
                                            <div className="font-semibold flex items-center gap-1.5">
                                                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                                {record.seller}
                                            </div>
                                            {record.sellerContact && (
                                                <span className="text-[10px] text-slate-400 block font-mono pl-5">
                                                    {record.sellerContact}
                                                </span>
                                            )}
                                        </div>

                                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
                                            +{record.quantityAdded} qty
                                        </span>

                                        <div className="font-mono text-slate-700 dark:text-slate-300">
                                            <span className="text-[10px] text-slate-400 block">Unit Cost</span>
                                            <span className="font-semibold">₹{record.unitCost.toLocaleString()}</span>
                                        </div>

                                        <div className="font-mono text-slate-900 dark:text-white">
                                            <span className="text-[10px] text-slate-400 block">Total Cost</span>
                                            <span className="font-bold">₹{record.totalCost.toLocaleString()}</span>
                                        </div>

                                        {record.billScreenshot ? (
                                            <button
                                                onClick={() => setViewingScreenshot(record.billScreenshot!)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold text-[11px] hover:bg-teal-100 transition-colors border border-teal-200/40"
                                            >
                                                <Eye className="size-3.5" /> View Bill
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-slate-400 italic">No bill</span>
                                        )}

                                        <span className="text-slate-500 font-mono text-[11px]">
                                            Inv# {record.invoiceNumber || '—'}
                                        </span>

                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <button
                                                onClick={() => handleOpenEditModal(record)}
                                                className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit record"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRecord(record._id, record.productName)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                title="Delete record"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {record.notes && (
                                        <div className="mt-2.5 flex items-start gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2">
                                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                            <span>{record.notes}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Add or Edit Purchase Record */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <PackageCheck className="size-5 text-teal-600" />
                                    {editingRecord ? 'Edit Purchase Record' : 'Add Inventory Update & Purchase'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Recorded details will update product stock and seller records automatically.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {!editingRecord && (
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 mb-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Product Mode:</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewProductMode(false)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!isNewProductMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                    >
                                        Restock Existing Product
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewProductMode(true)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${isNewProductMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                    >
                                        + Create New Product
                                    </button>
                                </div>
                            )}

                            {/* Product Selection vs New Product Creation */}
                            {!isNewProductMode && !editingRecord ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Select Target Product *
                                    </label>
                                    <select
                                        required
                                        value={formData.productId}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const prod = productsList.find(p => p._id === selectedId);
                                            setFormData(prev => ({
                                                ...prev,
                                                productId: selectedId,
                                                seller: prod?.seller || prev.seller,
                                                unitCost: prod?.costPrice ? prod.costPrice.toString() : prev.unitCost
                                            }));
                                        }}
                                        className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                    >
                                        {productsList.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (Current Stock: {p.stock} units)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : isNewProductMode && !editingRecord ? (
                                <div className="space-y-3 p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 block mb-2">New Product Details</span>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="e.g. Bosch Heavy Duty Angle Grinder 800W"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="2499"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            >
                                                {categoriesList.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="https://example.com/product.jpg"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CGST (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.cgst}
                                                onChange={(e) => setFormData({ ...formData, cgst: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="9"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.sgst}
                                                onChange={(e) => setFormData({ ...formData, sgst: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                    <input
                                        disabled
                                        type="text"
                                        value={formData.name}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            )}

                            {/* Seller & Contact Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Seller / Supplier Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        list="sellers-list"
                                        value={formData.seller}
                                        onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="e.g. Hardware Wholesale Corp / Bosch Direct"
                                    />
                                    <datalist id="sellers-list">
                                        {uniqueSellers.map(s => <option key={s} value={s} />)}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Seller Contact (Phone / Email)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sellerContact}
                                        onChange={(e) => setFormData({ ...formData, sellerContact: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="+91 9876543210 / vendor@example.com"
                                    />
                                </div>
                            </div>

                            {/* Quantity & Unit Cost */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Quantity Added *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.quantityAdded}
                                        onChange={(e) => setFormData({ ...formData, quantityAdded: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Unit Cost Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.unitCost}
                                        onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        placeholder="1200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Total Purchase Valuation
                                    </label>
                                    <input
                                        disabled
                                        type="text"
                                        value={`₹${(Number(formData.quantityAdded || 0) * Number(formData.unitCost || 0)).toLocaleString()}`}
                                        className="w-full px-3.5 py-2 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/70 text-teal-600 dark:text-teal-400 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Date & Invoice Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Inventory Update / Purchase Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.purchaseDate}
                                        onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Invoice / Bill Ref #
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                                        placeholder="INV-2026-0042"
                                    />
                                </div>
                            </div>

                            {/* Bill Screenshot Attachment (File Upload & URL Input) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Bill Screenshot Attachment
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                        <Upload className="size-4 text-teal-600" /> Upload Image File
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={formData.billScreenshot}
                                            onChange={(e) => setFormData({ ...formData, billScreenshot: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="Or paste screenshot image URL (https://...)"
                                        />
                                    </div>
                                </div>

                                {formData.billScreenshot && (
                                    <div className="mt-2 relative inline-block group">
                                        <img
                                            src={formData.billScreenshot}
                                            alt="Bill Screenshot Preview"
                                            className="h-24 max-w-full rounded-xl border border-slate-200 dark:border-slate-700 object-cover shadow-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, billScreenshot: '' })}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            title="Remove screenshot"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Batch Notes / Reminders
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                    placeholder="Add any batch notes, warranty terms, or storage instructions..."
                                />
                            </div>

                            {/* Submit Controls */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" /> Syncing Inventory...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="size-4" /> {editingRecord ? 'Update & Sync' : 'Save & Sync Inventory'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bill Screenshot Lightbox Modal */}
            {viewingScreenshot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                                <Eye className="size-4 text-teal-400" /> Bill Screenshot Preview
                            </h4>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingScreenshot}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-teal-400 hover:underline mr-2"
                                >
                                    Open original link
                                </a>
                                <button
                                    onClick={() => setViewingScreenshot(null)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-center bg-slate-950 max-h-[75vh] overflow-auto">
                            <img
                                src={viewingScreenshot}
                                alt="Bill Screenshot"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
