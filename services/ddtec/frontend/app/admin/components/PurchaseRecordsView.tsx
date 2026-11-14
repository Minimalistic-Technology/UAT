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
    ArrowRight
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useScrollLock } from '@/lib/useScrollLock';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';
import Pagination from '@/app/_components/Pagination';

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
    const [selectedProductFilter, setSelectedProductFilter] = useState<string>('All');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Prevent background scrolling when modals are open
    useScrollLock(isAddModalOpen || Boolean(viewingScreenshot));

    // Form State
    const [billScreenshotFile, setBillScreenshotFile] = useState<File | null>(null);
    const [billScreenshotPreview, setBillScreenshotPreview] = useState<string | null>(null);
    const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState<boolean>(false);

    // Clean up local object URL preview on unmount
    useEffect(() => {
        return () => {
            if (billScreenshotPreview) {
                URL.revokeObjectURL(billScreenshotPreview);
            }
        };
    }, [billScreenshotPreview]);

    const formatForDateInput = (date: Date = new Date()): string => {
        const pad = (n: number) => (n < 10 ? '0' + n : String(n));
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    // Backward-compatible alias for any in-flight or cached renders
    const formatForDateTimeInput = formatForDateInput;

    interface RestockFormErrors {
        productId?: string;
        seller?: string;
        sellerContact?: string;
        quantityAdded?: string;
        unitCost?: string;
        purchaseDate?: string;
        invoiceNumber?: string;
        billScreenshot?: string;
        notes?: string;
    }

    const [formErrors, setFormErrors] = useState<RestockFormErrors>({});

    const validateRestockForm = (data: typeof formData): RestockFormErrors => {
        const errors: RestockFormErrors = {};

        // Product selection (when creating new restock)
        if (!editingRecord && !data.productId) {
            errors.productId = 'Please select a product to restock';
        }

        // Seller Name
        const sellerTrimmed = data.seller.trim();
        if (!sellerTrimmed) {
            errors.seller = 'Seller / Supplier name is required';
        } else if (sellerTrimmed.length < 2) {
            errors.seller = 'Seller name must be at least 2 characters';
        } else if (sellerTrimmed.length > 100) {
            errors.seller = 'Seller name must be 100 characters or fewer';
        }

        // Seller Contact (Optional)
        if (data.sellerContact.trim()) {
            const contactTrimmed = data.sellerContact.trim();
            if (contactTrimmed.length > 100) {
                errors.sellerContact = 'Seller contact must be 100 characters or fewer';
            } else {
                const isPhone = /^(\+?[0-9\s\-()]{7,20})$/.test(contactTrimmed);
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactTrimmed);
                if (!isPhone && !isEmail) {
                    errors.sellerContact = 'Please enter a valid phone number (7-15 digits) or email address';
                }
            }
        }

        // Quantity Added (Mandatory, positive integer > 0)
        if (data.quantityAdded === '' || data.quantityAdded === null || data.quantityAdded === undefined) {
            errors.quantityAdded = 'Quantity added is required';
        } else {
            const qty = Number(data.quantityAdded);
            if (isNaN(qty)) {
                errors.quantityAdded = 'Quantity must be a valid number';
            } else if (qty <= 0) {
                errors.quantityAdded = 'Quantity must be greater than 0';
            } else if (!Number.isInteger(qty)) {
                errors.quantityAdded = 'Quantity must be a whole number (no decimals)';
            } else if (qty > 1000000) {
                errors.quantityAdded = 'Quantity cannot exceed 1,000,000 units';
            }
        }

        // Unit Cost (Mandatory, positive number)
        if (data.unitCost === '' || data.unitCost === null || data.unitCost === undefined) {
            errors.unitCost = 'Unit cost price is required';
        } else {
            const cost = Number(data.unitCost);
            if (isNaN(cost)) {
                errors.unitCost = 'Unit cost must be a valid number';
            } else if (cost <= 0) {
                errors.unitCost = 'Unit cost price must be greater than 0';
            } else if (cost > 10000000) {
                errors.unitCost = 'Unit cost cannot exceed ₹10,000,000';
            }
        }

        // Purchase Date (Mandatory & cannot be in the future)
        if (!data.purchaseDate || !data.purchaseDate.trim()) {
            errors.purchaseDate = 'Purchase date is required';
        } else {
            const todayStr = formatForDateInput(new Date());
            if (isNaN(new Date(data.purchaseDate).getTime())) {
                errors.purchaseDate = 'Please enter a valid purchase date';
            } else if (data.purchaseDate.trim() > todayStr) {
                errors.purchaseDate = 'Purchase date cannot be in the future';
            }
        }

        // Invoice Reference (Optional)
        if (data.invoiceNumber.trim() && data.invoiceNumber.trim().length > 50) {
            errors.invoiceNumber = 'Invoice reference must be 50 characters or fewer';
        }

        // Bill Screenshot URL (Optional)
        if (!billScreenshotFile && data.billScreenshot.trim() && !data.billScreenshot.startsWith('/') && !/^https?:\/\/.+/i.test(data.billScreenshot.trim())) {
            errors.billScreenshot = 'Please enter a valid image URL starting with http:// or https://';
        }

        // Batch Notes (Optional)
        if (data.notes.trim() && data.notes.trim().length > 500) {
            errors.notes = 'Batch notes cannot exceed 500 characters';
        }

        return errors;
    };

    const initialFormData = {
        productId: '',
        name: '',
        seller: '',
        sellerContact: '',
        quantityAdded: '10',
        unitCost: '',
        purchaseDate: formatForDateInput(new Date()),
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
        return Array.from(sellersSet).sort((a, b) => a.localeCompare(b));
    }, [records]);

    // Extract unique products list across catalog and purchase history
    const uniqueProducts = useMemo(() => {
        const prodSet = new Set<string>();
        records.forEach(r => {
            if (r.productName) prodSet.add(r.productName);
        });
        productsList.forEach(p => {
            if (p.name) prodSet.add(p.name);
        });
        return Array.from(prodSet).sort((a, b) => a.localeCompare(b));
    }, [records, productsList]);

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

    // Filtered Records (filtered across all records before pagination)
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch =
                r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesSeller =
                selectedSellerFilter === 'All' || r.seller.toLowerCase() === selectedSellerFilter.toLowerCase();

            const matchesProduct =
                selectedProductFilter === 'All' || r.productName.toLowerCase() === selectedProductFilter.toLowerCase();

            return matchesSearch && matchesSeller && matchesProduct;
        });
    }, [records, searchQuery, selectedSellerFilter, selectedProductFilter]);

    // Pagination State (Fixed 25 items per page)
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(25);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedSellerFilter, selectedProductFilter, records.length]);

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
    const pagedRecords = useMemo(() => {
        return filteredRecords.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredRecords, page, pageSize]);

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setFormErrors({});
        if (billScreenshotPreview) {
            URL.revokeObjectURL(billScreenshotPreview);
        }
        setBillScreenshotFile(null);
        setBillScreenshotPreview(null);
    };

    // Open Modal for Create (Restock Product)
    const handleOpenCreateModal = () => {
        setEditingRecord(null);
        setFormErrors({});
        if (billScreenshotPreview) {
            URL.revokeObjectURL(billScreenshotPreview);
        }
        setBillScreenshotFile(null);
        setBillScreenshotPreview(null);
        const defaultProduct = productsList.length > 0 ? productsList[0] : null;
        setFormData({
            ...initialFormData,
            productId: defaultProduct ? defaultProduct._id : '',
            seller: defaultProduct?.seller || '',
            unitCost: defaultProduct?.costPrice ? defaultProduct.costPrice.toString() : '',
            purchaseDate: formatForDateInput(new Date())
        });
        setIsAddModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (record: PurchaseRecord) => {
        setEditingRecord(record);
        setFormErrors({});
        if (billScreenshotPreview) {
            URL.revokeObjectURL(billScreenshotPreview);
        }
        setBillScreenshotFile(null);
        setBillScreenshotPreview(null);

        const prodId = typeof record.product === 'object' && record.product !== null ? record.product._id : record.product;

        setFormData({
            ...initialFormData,
            productId: prodId || '',
            name: record.productName,
            seller: record.seller || '',
            sellerContact: record.sellerContact || '',
            quantityAdded: record.quantityAdded.toString(),
            unitCost: record.unitCost.toString(),
            purchaseDate: record.purchaseDate ? formatForDateInput(new Date(record.purchaseDate)) : formatForDateInput(new Date()),
            billScreenshot: record.billScreenshot || '',
            invoiceNumber: record.invoiceNumber || '',
            notes: record.notes || ''
        });
        setIsAddModalOpen(true);
    };

    // Handle Local File Selection for Bill Screenshot (Stored locally, uploaded on submit)
    const handleBillScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be under 10MB', 'error');
            e.target.value = '';
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
            e.target.value = '';
            return;
        }

        if (billScreenshotPreview) {
            URL.revokeObjectURL(billScreenshotPreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setBillScreenshotFile(file);
        setBillScreenshotPreview(previewUrl);
        // Clear text URL since the selected file takes precedence
        setFormData(prev => ({ ...prev, billScreenshot: '' }));
        if (formErrors.billScreenshot) {
            setFormErrors(prev => ({ ...prev, billScreenshot: undefined }));
        }
        e.target.value = '';
    };

    // Handle Manual URL input change
    const handleBillScreenshotUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (billScreenshotFile || billScreenshotPreview) {
            if (billScreenshotPreview) {
                URL.revokeObjectURL(billScreenshotPreview);
            }
            setBillScreenshotFile(null);
            setBillScreenshotPreview(null);
        }
        setFormData(prev => ({ ...prev, billScreenshot: val }));
        if (formErrors.billScreenshot) {
            setFormErrors(prev => ({ ...prev, billScreenshot: undefined }));
        }
    };

    // Handle Remove for Bill Screenshot
    const handleRemoveBillScreenshot = async () => {
        if (billScreenshotPreview) {
            URL.revokeObjectURL(billScreenshotPreview);
        }
        setBillScreenshotFile(null);
        setBillScreenshotPreview(null);

        const currentUrl = formData.billScreenshot;
        if (currentUrl && currentUrl.includes('res.cloudinary.com')) {
            try {
                await api.post('/purchases/delete-image', { imageUrl: currentUrl });
                showToast('Bill screenshot removed from Cloudinary', 'success');
            } catch (error) {
                console.error('Failed to delete screenshot from Cloudinary', error);
            }
        }
        setFormData(prev => ({ ...prev, billScreenshot: '' }));
        if (formErrors.billScreenshot) setFormErrors(prev => ({ ...prev, billScreenshot: undefined }));
    };

    // Handle Form Submit (Create or Update Restock Record)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateRestockForm(formData);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            const firstError = Object.values(errors)[0];
            showToast(firstError || 'Please fix the errors in the form', 'error');
            return;
        }
        setFormErrors({});

        const qty = Number(formData.quantityAdded);

        setIsSubmitting(true);
        try {
            let finalBillScreenshot = formData.billScreenshot.trim();

            // Upload bill image file or direct external link to Cloudinary upon submission
            if (billScreenshotFile) {
                setIsUploadingToCloudinary(true);
                try {
                    const uploadData = new FormData();
                    uploadData.append('billScreenshot', billScreenshotFile);
                    const { data } = await api.post('/purchases/upload-image?folder=purchases', uploadData);
                    finalBillScreenshot = data.url;
                } finally {
                    setIsUploadingToCloudinary(false);
                }
            } else if (finalBillScreenshot && !finalBillScreenshot.includes('res.cloudinary.com')) {
                setIsUploadingToCloudinary(true);
                try {
                    const { data } = await api.post('/purchases/upload-image?folder=purchases', { imageUrl: finalBillScreenshot });
                    finalBillScreenshot = data.url;
                } finally {
                    setIsUploadingToCloudinary(false);
                }
            }

            if (editingRecord) {
                // Update existing record
                await api.put(`/purchases/${editingRecord._id}`, {
                    seller: formData.seller.trim(),
                    sellerContact: formData.sellerContact.trim() || undefined,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: finalBillScreenshot || undefined,
                    invoiceNumber: formData.invoiceNumber.trim() || undefined,
                    notes: formData.notes.trim() || undefined
                });
                showToast('Purchase record updated & inventory synced!', 'success');
            } else {
                // Create new record (restocking an existing product)
                await api.post('/purchases', {
                    isNewProduct: false,
                    productId: formData.productId,
                    seller: formData.seller.trim(),
                    sellerContact: formData.sellerContact.trim() || undefined,
                    quantityAdded: qty,
                    unitCost: Number(formData.unitCost) || 0,
                    purchaseDate: formData.purchaseDate,
                    billScreenshot: finalBillScreenshot || undefined,
                    invoiceNumber: formData.invoiceNumber.trim() || undefined,
                    notes: formData.notes.trim() || undefined
                });
                showToast('Inventory restocked & purchase recorded successfully!', 'success');
            }

            if (billScreenshotPreview) {
                URL.revokeObjectURL(billScreenshotPreview);
            }
            setBillScreenshotFile(null);
            setBillScreenshotPreview(null);
            setIsAddModalOpen(false);
            setFormErrors({});
            fetchRecords();
            onRefreshProducts?.();
        } catch (error: any) {
            console.error('Error saving purchase record:', error);
            showToast(error.response?.data?.msg || 'Failed to save purchase record', 'error');
        } finally {
            setIsSubmitting(false);
            setIsUploadingToCloudinary(false);
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

                    {/* Filter Product */}
                    <select
                        value={selectedProductFilter}
                        onChange={(e) => setSelectedProductFilter(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        <option value="All">All Products</option>
                        {uniqueProducts.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

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
                        {pagedRecords.map((record) => {
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

                {filteredRecords.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700/60">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={filteredRecords.length}
                            pageSize={pageSize}
                            itemName="records"
                            alwaysShow={true}
                            onPageChange={setPage}
                            variant="admin"
                        />
                    </div>
                )}
            </div>

            {/* Modal: Add or Edit Purchase Record */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] my-auto overscroll-contain animate-in fade-in zoom-in duration-200"
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
                                onClick={handleCloseModal}
                                className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
                            {/* Product Selection (When creating record) */}
                            {!editingRecord ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Select Target Product <span className="text-red-500">*</span>
                                    </label>
                                    {productsList.length === 0 ? (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                                            No products available to restock.{' '}
                                            <button
                                                type="button"
                                                onClick={() => { handleCloseModal(); router.push('/admin/products'); }}
                                                className="underline font-bold"
                                            >
                                                Create a product first on the Products page
                                            </button>.
                                        </div>
                                    ) : (
                                        <select
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
                                                if (formErrors.productId) setFormErrors(prev => ({ ...prev, productId: undefined }));
                                            }}
                                            className={`w-full px-4 py-2.5 text-xs font-medium rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none cursor-pointer transition-colors ${
                                                formErrors.productId ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                            }`}
                                        >
                                            <option value="">Select a product to restock...</option>
                                            {productsList.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} (Current Stock: {p.stock} units)
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formErrors.productId && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.productId}</p>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Need to create a brand-new product? Add it from the{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddModalOpen(false); setFormErrors({}); router.push('/admin/products'); }}
                                            className="cursor-pointer text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                                        >
                                            Products page
                                        </button>{' '}
                                        with complete images, specifications, and highlights.
                                    </p>
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
                                        type="text"
                                        list="sellers-list"
                                        value={formData.seller}
                                        onChange={(e) => {
                                            setFormData({ ...formData, seller: e.target.value });
                                            if (formErrors.seller) setFormErrors(prev => ({ ...prev, seller: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                            formErrors.seller ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                        placeholder="e.g. Hardware Wholesale Corp / Bosch Direct"
                                    />
                                    {formErrors.seller && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.seller}</p>
                                    )}
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
                                        onChange={(e) => {
                                            setFormData({ ...formData, sellerContact: e.target.value });
                                            if (formErrors.sellerContact) setFormErrors(prev => ({ ...prev, sellerContact: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                            formErrors.sellerContact ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                        placeholder="+91 9876543210 / vendor@example.com"
                                    />
                                    {formErrors.sellerContact && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.sellerContact}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quantity & Unit Cost */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Quantity Added <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={formData.quantityAdded}
                                        onChange={(e) => {
                                            setFormData({ ...formData, quantityAdded: e.target.value });
                                            if (formErrors.quantityAdded) setFormErrors(prev => ({ ...prev, quantityAdded: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                            formErrors.quantityAdded ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                        placeholder="50"
                                    />
                                    {formErrors.quantityAdded && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.quantityAdded}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Unit Cost Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={formData.unitCost}
                                        onChange={(e) => {
                                            setFormData({ ...formData, unitCost: e.target.value });
                                            if (formErrors.unitCost) setFormErrors(prev => ({ ...prev, unitCost: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs font-bold rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors ${
                                            formErrors.unitCost ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                        placeholder="1200"
                                    />
                                    {formErrors.unitCost && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.unitCost}</p>
                                    )}
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
                                        Purchase Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        max={formatForDateInput(new Date())}
                                        value={formData.purchaseDate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, purchaseDate: e.target.value });
                                            if (formErrors.purchaseDate) setFormErrors(prev => ({ ...prev, purchaseDate: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none font-mono transition-colors ${
                                            formErrors.purchaseDate ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                    />
                                    {formErrors.purchaseDate && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.purchaseDate}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Invoice / Bill Ref #
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        value={formData.invoiceNumber}
                                        onChange={(e) => {
                                            setFormData({ ...formData, invoiceNumber: e.target.value });
                                            if (formErrors.invoiceNumber) setFormErrors(prev => ({ ...prev, invoiceNumber: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none font-mono transition-colors ${
                                            formErrors.invoiceNumber ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                        placeholder="INV-2026-0042"
                                    />
                                    {formErrors.invoiceNumber && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.invoiceNumber}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bill Screenshot Attachment (Cloudinary Upload on Submit & URL Input) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Bill Screenshot Attachment
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs shrink-0">
                                        <Upload className="size-4 text-teal-600" />
                                        <span>Choose Image File</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            disabled={isSubmitting}
                                            onChange={handleBillScreenshotSelect}
                                            className="hidden"
                                        />
                                    </label>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={formData.billScreenshot}
                                            disabled={isSubmitting || Boolean(billScreenshotFile)}
                                            onChange={handleBillScreenshotUrlChange}
                                            className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60 ${
                                                formErrors.billScreenshot ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                            }`}
                                            placeholder={billScreenshotFile ? `Image file attached (${billScreenshotFile.name}) — remove file to enter URL` : "Or paste screenshot image URL (https://...)"}
                                            title={billScreenshotFile ? "An image file is already attached. Remove it to enter an image link URL." : ""}
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                    Selected image file or direct link will be uploaded to Cloudinary when the form is submitted.
                                </p>
                                {formErrors.billScreenshot && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.billScreenshot}</p>
                                )}

                                {(billScreenshotPreview || formData.billScreenshot) && (
                                    <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="relative group shrink-0">
                                            <img
                                                src={billScreenshotPreview || formData.billScreenshot}
                                                alt="Bill Screenshot Preview"
                                                className="size-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {billScreenshotFile ? (
                                                <>
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        Selected File • Uploads on Submit
                                                    </span>
                                                    <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium truncate">
                                                        {billScreenshotFile.name}
                                                        <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">
                                                            ({(billScreenshotFile.size / (1024 * 1024)).toFixed(2)} MB)
                                                        </span>
                                                    </p>
                                                </>
                                            ) : formData.billScreenshot.includes('res.cloudinary.com') ? (
                                                <>
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                                        Cloudinary Hosted Bill
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 truncate">{formData.billScreenshot}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                        Direct Link • Uploads to Cloudinary on Submit
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 truncate">{formData.billScreenshot}</p>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={handleRemoveBillScreenshot}
                                            className="cursor-pointer px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1 font-semibold shrink-0 disabled:opacity-50"
                                            title="Remove image"
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
                                    maxLength={500}
                                    value={formData.notes}
                                    onChange={(e) => {
                                        setFormData({ ...formData, notes: e.target.value });
                                        if (formErrors.notes) setFormErrors(prev => ({ ...prev, notes: undefined }));
                                    }}
                                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none resize-none transition-colors ${
                                        formErrors.notes ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                    }`}
                                    placeholder="Add any batch notes, warranty terms, or storage instructions..."
                                />
                                {formErrors.notes && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.notes}</p>
                                )}
                            </div>

                            {/* Submit Controls */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
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
                                            <Loader2 className="size-4 animate-spin" />
                                            {isUploadingToCloudinary ? 'Uploading Bill to Cloudinary...' : 'Syncing Inventory...'}
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
