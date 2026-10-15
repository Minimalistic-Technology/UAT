"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    PackageCheck,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    DollarSign,
    Building2,
    FileText,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    Boxes,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';

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
    const confirm = useConfirm();
    const router = useRouter();
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
    const [isUploadingProductImage, setIsUploadingProductImage] = useState<boolean>(false);
    const [isUploadingBillScreenshot, setIsUploadingBillScreenshot] = useState<boolean>(false);

    const initialFormData = {
        productId: '',
        name: '',
        price: '',
        category: '',
        description: '',
        image: '',
        cgst: '9',
        sgst: '9',
        packQuantity: '10',
        packUnit: 'Box',
        unitSize: '',
        unitMeasure: 'Liter',
        seller: '',
        sellerContact: '',
        quantityAdded: '10',
        unitCost: '',
        purchaseDate: new Date().toISOString().slice(0, 16),
        billScreenshot: '',
        invoiceNumber: '',
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormData);

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

    // Live stock straight from the product catalog — a product can carry stock (e.g. set
    // directly on the product form, or seeded) without ever having a logged purchase record,
    // so this must NOT be derived from `records` or it misleadingly reads as 0.
    const totalCurrentStock = useMemo(() => {
        return productsList.reduce((sum, p) => sum + (p.stock || 0), 0);
    }, [productsList]);

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
            ...initialFormData,
            productId: productsList.length > 0 ? productsList[0]._id : '',
            category: categoriesList.length > 0 ? categoriesList[0]._id : '',
            purchaseDate: new Date().toISOString().slice(0, 16)
        });
        setIsAddModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (record: PurchaseRecord) => {
        setEditingRecord(record);
        setIsNewProductMode(false);

        const prodId = typeof record.product === 'object' && record.product !== null ? record.product._id : record.product;

        setFormData({
            ...initialFormData,
            productId: prodId || '',
            name: record.productName,
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

    // Handle Upload for Product Image
    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be under 10MB', 'error');
            e.target.value = '';
            return;
        }

        setIsUploadingProductImage(true);
        try {
            const uploadData = new FormData();
            uploadData.append('image', file);
            const { data } = await api.post('/purchases/upload-image?folder=products', uploadData);
            setFormData(prev => ({ ...prev, image: data.url }));
            showToast('Product image uploaded to Cloudinary successfully', 'success');
        } catch (error: any) {
            console.error('Failed to upload product image to Cloudinary', error);
            showToast(error.response?.data?.msg || 'Failed to upload product image', 'error');
        } finally {
            setIsUploadingProductImage(false);
            e.target.value = '';
        }
    };

    // Handle Remove for Product Image (cleans up from Cloudinary if hosted there)
    const handleRemoveProductImage = async () => {
        const currentUrl = formData.image;
        if (!currentUrl) return;

        if (currentUrl.includes('res.cloudinary.com')) {
            try {
                await api.post('/purchases/delete-image', { imageUrl: currentUrl });
                showToast('Product image removed from Cloudinary', 'success');
            } catch (error) {
                console.error('Failed to delete image from Cloudinary', error);
            }
        }
        setFormData(prev => ({ ...prev, image: '' }));
    };

    // Handle Upload for Bill Screenshot
    const handleBillScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be under 10MB', 'error');
            e.target.value = '';
            return;
        }

        setIsUploadingBillScreenshot(true);
        try {
            const uploadData = new FormData();
            uploadData.append('billScreenshot', file);
            const { data } = await api.post('/purchases/upload-image?folder=purchases', uploadData);
            setFormData(prev => ({ ...prev, billScreenshot: data.url }));
            showToast('Bill screenshot uploaded to Cloudinary successfully', 'success');
        } catch (error: any) {
            console.error('Failed to upload bill screenshot to Cloudinary', error);
            showToast(error.response?.data?.msg || 'Failed to upload bill screenshot', 'error');
        } finally {
            setIsUploadingBillScreenshot(false);
            e.target.value = '';
        }
    };

    // Handle Remove for Bill Screenshot (cleans up from Cloudinary if hosted there)
    const handleRemoveBillScreenshot = async () => {
        const currentUrl = formData.billScreenshot;
        if (!currentUrl) return;

        if (currentUrl.includes('res.cloudinary.com')) {
            try {
                await api.post('/purchases/delete-image', { imageUrl: currentUrl });
                showToast('Bill screenshot removed from Cloudinary', 'success');
            } catch (error) {
                console.error('Failed to delete screenshot from Cloudinary', error);
            }
        }
        setFormData(prev => ({ ...prev, billScreenshot: '' }));
    };

    // Handle Form Submit (Create or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isNewProductMode && !formData.name.trim()) {
            showToast('Product name is required for new product creation', 'error');
            return;
        }

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
            } else if (isNewProductMode) {
                // Create a new product and purchase record
                const parsedPackQty = Number(formData.packQuantity);
                const parsedUnitSize = Number(formData.unitSize);
                const hasValidUnitSize = !isNaN(parsedUnitSize) && parsedUnitSize > 0;

                await api.post('/purchases', {
                    isNewProduct: true,
                    name: formData.name.trim(),
                    price: Number(formData.price) || 0,
                    category: formData.category || undefined,
                    description: formData.description,
                    image: formData.image,
                    cgst: Number(formData.cgst) || 0,
                    sgst: Number(formData.sgst) || 0,
                    packQuantity: (!isNaN(parsedPackQty) && parsedPackQty > 0) ? parsedPackQty : 1,
                    packUnit: formData.packUnit?.trim() || 'Piece',
                    unitSize: hasValidUnitSize ? parsedUnitSize : 0,
                    unitMeasure: hasValidUnitSize ? (formData.unitMeasure?.trim() || '') : '',
                    seller: formData.seller,
                    sellerContact: formData.sellerContact,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: formData.billScreenshot,
                    invoiceNumber: formData.invoiceNumber,
                    notes: formData.notes
                });
                showToast('New product created & inventory record saved!', 'success');
            } else {
                // Create new record (restocking an existing product)
                await api.post('/purchases', {
                    isNewProduct: false,
                    productId: formData.productId,
                    seller: formData.seller,
                    sellerContact: formData.sellerContact,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: formData.billScreenshot,
                    invoiceNumber: formData.invoiceNumber,
                    notes: formData.notes
                });
                showToast('Inventory restocked & purchase recorded successfully!', 'success');
            }

            setIsAddModalOpen(false);
            fetchRecords();
            onRefreshProducts?.();
        } catch (error: any) {
            console.error('Error saving purchase record:', error);
            showToast(error.response?.data?.msg || 'Failed to save purchase record', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Record
    const handleDeleteRecord = async (id: string, productName: string) => {
        const ok = await confirm({
            message: `Are you sure you want to delete the purchase record for "${productName}"? This will adjust product inventory accordingly and remove any attached bill screenshot from Cloudinary.`,
            variant: 'danger'
        });
        if (!ok) return;

        try {
            await api.delete(`/purchases/${id}`);
            showToast('Purchase record deleted and inventory stock adjusted', 'success');
            fetchRecords();
            onRefreshProducts?.();
        } catch (error: any) {
            console.error('Failed to delete purchase record', error);
            showToast(error.response?.data?.msg || 'Failed to delete record', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <PackageCheck className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Stock (All Products)</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                {totalCurrentStock.toLocaleString()} units
                            </h4>
                        </div>
                    </div>
                </div>

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
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Units Restocked (Logged)</p>
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

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleOpenCreateModal}
                        className="cursor-pointer w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="size-4" /> Restock Product
                    </button>
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="cursor-pointer w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                        title="New products (with images, highlights, etc.) are created on the Products page"
                    >
                        Create New Product <ArrowRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* Purchase Records Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="size-5 text-teal-600" /> Inventory Update & Purchase History Log
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">New records here add to product stock automatically</span>
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
                        <p className="text-xs text-slate-500 mt-1 max-w-md">
                            This log only tracks restocking done through "Restock Product" — it doesn't affect
                            or reflect stock set directly on a product. Current live stock across all products is{' '}
                            <strong>{totalCurrentStock.toLocaleString()} units</strong> (see the Products tab for per-item stock).
                        </p>
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
                                            {formatDate(record.purchaseDate)}
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
                                                className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold text-[11px] hover:bg-teal-100 transition-colors border border-teal-200/40"
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
                                                className="cursor-pointer p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit record"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRecord(record._id, record.productName)}
                                                className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <PackageCheck className="size-5 text-teal-600" />
                                    {editingRecord ? 'Edit Purchase Record' : 'Restock Product'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Recorded details will update product stock and seller records automatically.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Product Mode Selection (When creating record) */}
                            {!editingRecord && (
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">Product Mode:</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewProductMode(false)}
                                        className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${!isNewProductMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                    >
                                        Restock Existing Product
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewProductMode(true)}
                                        className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${isNewProductMode ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                    >
                                        + Create New Product
                                    </button>
                                </div>
                            )}

                            {/* Product Selection vs New Product Creation */}
                            {!isNewProductMode && !editingRecord ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Select Target Product <span className="text-red-500">*</span>
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
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Need to create a brand-new product? Click the <button type="button" onClick={() => setIsNewProductMode(true)} className="cursor-pointer text-teal-600 hover:underline font-semibold">+ Create New Product</button> tab above.
                                    </p>
                                </div>
                            ) : isNewProductMode && !editingRecord ? (
                                <div className="space-y-3.5 p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                                            <Sparkles className="size-3.5" /> New Product Details
                                        </span>
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400">
                                            Auto-creates catalog product with packaging &amp; stock
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
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
                                                min="0"
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
                                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                                            >
                                                {categoriesList.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Product Image Upload with Cloudinary Support */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Product Image
                                        </label>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                            <label className="cursor-pointer bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-dashed border-teal-500/50 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs hover:border-teal-600 shrink-0">
                                                {isUploadingProductImage ? (
                                                    <>
                                                        <Loader2 className="size-4 animate-spin text-teal-600" />
                                                        <span>Uploading to Cloudinary...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="size-4 text-teal-600" />
                                                        <span>Upload Image File</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={isUploadingProductImage}
                                                    onChange={handleProductImageUpload}
                                                    className="hidden"
                                                />
                                            </label>

                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="https://example.com/product.jpg"
                                                />
                                            </div>
                                        </div>

                                        {formData.image && (
                                            <div className="mt-2.5 flex items-center gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="relative group shrink-0">
                                                    <img
                                                        src={formData.image}
                                                        alt="Product Image Preview"
                                                        className="size-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 ${formData.image.includes('res.cloudinary.com') ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                        {formData.image.includes('res.cloudinary.com') ? 'Cloudinary Hosted Image' : 'External Image URL'}
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 truncate">{formData.image}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveProductImage}
                                                    className="cursor-pointer px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold shrink-0"
                                                    title="Remove and delete image from Cloudinary"
                                                >
                                                    <Trash2 className="size-3.5" /> Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* CGST & SGST */}
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

                                    {/* Packaging / Unit Size */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Packaging / Unit Size</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.packQuantity}
                                                onChange={(e) => setFormData({ ...formData, packQuantity: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="10"
                                                title="Pack Quantity"
                                            />
                                            <input
                                                type="text"
                                                value={formData.packUnit}
                                                onChange={(e) => setFormData({ ...formData, packUnit: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Box"
                                                list="pack-unit-list"
                                                title="Pack Unit"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.unitSize}
                                                onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="0.10"
                                                title="Unit Size"
                                            />
                                            <input
                                                type="text"
                                                value={formData.unitMeasure}
                                                onChange={(e) => setFormData({ ...formData, unitMeasure: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Liter"
                                                list="unit-measure-list"
                                                title="Unit Measure"
                                            />
                                        </div>
                                        <datalist id="pack-unit-list">
                                            <option value="Box" /><option value="Carton" /><option value="Piece" /><option value="Packet" /><option value="Bottle" /><option value="Pouch" />
                                        </datalist>
                                        <datalist id="unit-measure-list">
                                            <option value="Liter" /><option value="ml" /><option value="Kg" /><option value="gram" /><option value="Piece" />
                                        </datalist>
                                        <p className="text-[10px] text-slate-400 mt-1">e.g. 10 Box &times; 0.10 Liter</p>
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
                                        Seller / Supplier Name <span className="text-red-500">*</span>
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
                                        Quantity Added <span className="text-red-500">*</span>
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

                            {/* Bill Screenshot Attachment (Cloudinary Upload & URL Input) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Bill Screenshot Attachment
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs shrink-0">
                                        {isUploadingBillScreenshot ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin text-teal-600" />
                                                <span>Uploading to Cloudinary...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="size-4 text-teal-600" />
                                                <span>Upload Image File</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={isUploadingBillScreenshot}
                                            onChange={handleBillScreenshotUpload}
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
                                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="relative group shrink-0">
                                            <img
                                                src={formData.billScreenshot}
                                                alt="Bill Screenshot Preview"
                                                className="size-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 ${formData.billScreenshot.includes('res.cloudinary.com') ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                {formData.billScreenshot.includes('res.cloudinary.com') ? 'Cloudinary Hosted Bill' : 'Screenshot Image URL'}
                                            </span>
                                            <p className="text-[11px] text-slate-400 truncate">{formData.billScreenshot}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveBillScreenshot}
                                            className="cursor-pointer px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold shrink-0"
                                            title="Remove and delete screenshot from Cloudinary"
                                        >
                                            <Trash2 className="size-3.5" /> Remove
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
                                    className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setViewingScreenshot(null)}
                >
                    <div
                        className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                                <Eye className="size-4 text-teal-400" /> Bill Screenshot Preview
                            </h4>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingScreenshot}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="cursor-pointer text-xs text-teal-400 hover:underline mr-2"
                                >
                                    Open original link
                                </a>
                                <button
                                    onClick={() => setViewingScreenshot(null)}
                                    className="cursor-pointer p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
