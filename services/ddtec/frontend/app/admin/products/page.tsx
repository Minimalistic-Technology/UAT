"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Tag, Ticket, Eye, ExternalLink, Edit, Trash2, Calendar, Clock, DollarSign, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import api from "@/lib/api";
import ToggleSwitch from "../components/ToggleSwitch";
import { useToast } from "../../_context/ToastContext";
import { useConfirm } from "../../_context/ConfirmContext";
import { useProducts, Product } from "../hooks/useProducts";

export default function ProductsPage() {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const { productsList, setProductsList, categoriesList, fetchProducts, fetchCategories } = useProducts();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
    const [viewingCoupons, setViewingCoupons] = useState<{ productName: string, coupons: any[] } | null>(null);

    // Add/Edit Product Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        description: "",
        image: "",
        imagesInput: "",
        category: "",
        stock: "",
        brand: "",
        modelName: "",
        rating: "",
        lastMonthSales: "",
        couponCode: "",
        discountPercentage: "",
        cgst: "",
        sgst: "",
        weightKg: "",
        lengthCm: "",
        widthCm: "",
        heightCm: "",
        packQuantity: "",
        packUnit: "Box",
        unitSize: "",
        unitMeasure: "Liter",
        showAddToCart: true,
        showBuyNow: true,
        codAvailable: true,
        productType: "physical",
        isReturnable: true,
        showDeliveryChecker: true,
        allowedCourierPartners: ["BLUEDART", "DTDC"] as string[],
        customDeliveryEstimate: ""
    });

    interface NewProductFormErrors {
        name?: string;
        price?: string;
        stock?: string;
        category?: string;
        cgst?: string;
        sgst?: string;
        discountPercentage?: string;
        rating?: string;
        lastMonthSales?: string;
        couponCode?: string;
    }
    const [newProductErrors, setNewProductErrors] = useState<NewProductFormErrors>({});

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [newProductImageDraft, setNewProductImageDraft] = useState("");
    const [editProductImageDraft, setEditProductImageDraft] = useState("");
    const [newProductImageFiles, setNewProductImageFiles] = useState<File[]>([]);
    const [editProductImageFiles, setEditProductImageFiles] = useState<File[]>([]);

    const toggleProductStatus = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/products/${id}/status`);
            setProductsList(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
        } catch (error) {
            console.error(error);
            showToast("Failed to update product status", "error");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const ok = await confirm({ message: "Are you sure you want to delete this product?", variant: "danger" });
        if (!ok) return;
        await api.delete(`/products/${id}`);
        showToast("Product deleted successfully", "success");
        fetchProducts();
    };

    // Parses the comma-separated `imagesInput` string into a clean list of URLs
    const parseImageUrlList = (imagesInput: string): string[] =>
        imagesInput.split(',').map(u => u.trim()).filter(Boolean);

    // Validates that a string is a well-formed, absolute http(s) image URL
    const validateImageUrl = (rawUrl: string): string | null => {
        const url = rawUrl.trim();
        if (!url) return null;

        let parsed: URL;
        try {
            parsed = new URL(url);
        } catch {
            return 'Enter a valid URL (must start with http:// or https://)';
        }

        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return 'Only http:// or https:// URLs are allowed';
        }

        return null;
    };

    // Adds one or more URLs as tags to the given form's image list in a single state update,
    // running validation + dedup checks against both existing tags and each other.
    const addImageUrlTags = (rawUrls: string[], target: 'new' | 'edit') => {
        const currentInput = target === 'new' ? newProduct.imagesInput : editingProduct.imagesInput;
        const existing = parseImageUrlList(currentInput);
        const combined = [...existing];
        let addedCount = 0;

        for (const rawUrl of rawUrls) {
            const url = rawUrl.trim().replace(/,$/, '').trim();
            if (!url) continue;

            const error = validateImageUrl(url);
            if (error) {
                showToast(error, 'error');
                continue;
            }

            if (combined.some(u => u.toLowerCase() === url.toLowerCase())) {
                showToast('This image URL has already been added', 'error');
                continue;
            }

            combined.push(url);
            addedCount++;
        }

        if (addedCount === 0) return;

        const updated = combined.join(', ');
        if (target === 'new') {
            setNewProduct(prev => ({ ...prev, imagesInput: updated }));
        } else {
            setEditingProduct((prev: any) => ({ ...prev, imagesInput: updated }));
        }
    };

    // Adds a single URL as a tag and clears the draft input (used for Enter key / blur)
    const addImageUrlTag = (rawUrl: string, target: 'new' | 'edit') => {
        if (!rawUrl.trim()) return;
        addImageUrlTags([rawUrl], target);
        if (target === 'new') setNewProductImageDraft("");
        else setEditProductImageDraft("");
    };

    // Removes a single URL tag from the given form's image list
    const removeImageUrlTag = (urlToRemove: string, target: 'new' | 'edit') => {
        const currentInput = target === 'new' ? newProduct.imagesInput : editingProduct.imagesInput;
        const updated = parseImageUrlList(currentInput).filter(u => u !== urlToRemove).join(', ');
        if (target === 'new') {
            setNewProduct(prev => ({ ...prev, imagesInput: updated }));
        } else {
            setEditingProduct((prev: any) => ({ ...prev, imagesInput: updated }));
        }
    };

    // Handles typing in the image URL input: adds a tag on Enter, ignores stray commas here
    // (commas are handled in the onChange handler so pasted lists split correctly)
    const handleImageUrlInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, target: 'new' | 'edit') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addImageUrlTag(target === 'new' ? newProductImageDraft : editProductImageDraft, target);
        }
    };

    // Handles changes to the image URL draft input: splits on comma so both typing "url,"
    // and pasting "url1, url2, url3" add tags immediately, keeping only the trailing
    // (possibly incomplete) segment in the input.
    const handleImageUrlInputChange = (value: string, target: 'new' | 'edit') => {
        if (value.includes(',')) {
            const parts = value.split(',');
            const toAdd = parts.slice(0, -1);
            addImageUrlTags(toAdd, target);
            const remainder = parts[parts.length - 1];
            if (target === 'new') setNewProductImageDraft(remainder);
            else setEditProductImageDraft(remainder);
        } else {
            if (target === 'new') setNewProductImageDraft(value);
            else setEditProductImageDraft(value);
        }
    };

    // Queues selected image files locally — they are only uploaded to Cloudinary
    // when the product form is actually submitted (create/update), not on selection.
    const queueProductImageFiles = (files: FileList | null, target: 'new' | 'edit') => {
        if (!files || files.length === 0) return;
        const filesArray = Array.from(files);
        if (target === 'new') {
            setNewProductImageFiles(prev => [...prev, ...filesArray]);
        } else {
            setEditProductImageFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeQueuedProductImageFile = (index: number, target: 'new' | 'edit') => {
        if (target === 'new') {
            setNewProductImageFiles(prev => prev.filter((_, i) => i !== index));
        } else {
            setEditProductImageFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    const COUPON_CODE_REGEX = /^[A-Za-z0-9_-]{3,20}$/;

    const validateNewProduct = (data: typeof newProduct): NewProductFormErrors => {
        const errors: NewProductFormErrors = {};

        if (!data.name.trim()) {
            errors.name = 'Product name is required';
        } else if (data.name.trim().length > 150) {
            errors.name = 'Product name must be 150 characters or fewer';
        }

        if (data.price === "" || data.price === null) {
            errors.price = 'Price is required';
        } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
            errors.price = 'Price must be a number greater than 0';
        }

        if (data.stock === "" || data.stock === null) {
            errors.stock = 'Stock is required';
        } else if (isNaN(Number(data.stock)) || Number(data.stock) < 0 || !Number.isInteger(Number(data.stock))) {
            errors.stock = 'Stock must be a whole number of 0 or more';
        }

        if (!data.category) {
            errors.category = 'Category is required';
        }

        if (data.cgst !== "" && (isNaN(Number(data.cgst)) || Number(data.cgst) < 0 || Number(data.cgst) > 100)) {
            errors.cgst = 'CGST must be between 0 and 100';
        }

        if (data.sgst !== "" && (isNaN(Number(data.sgst)) || Number(data.sgst) < 0 || Number(data.sgst) > 100)) {
            errors.sgst = 'SGST must be between 0 and 100';
        }

        if (data.discountPercentage !== "" && (isNaN(Number(data.discountPercentage)) || Number(data.discountPercentage) < 0 || Number(data.discountPercentage) > 100)) {
            errors.discountPercentage = 'Discount must be between 0 and 100';
        }

        if (data.rating !== "" && (isNaN(Number(data.rating)) || Number(data.rating) < 0 || Number(data.rating) > 5)) {
            errors.rating = 'Rating must be between 0 and 5';
        }

        if (data.lastMonthSales !== "" && (isNaN(Number(data.lastMonthSales)) || Number(data.lastMonthSales) < 0 || !Number.isInteger(Number(data.lastMonthSales)))) {
            errors.lastMonthSales = 'Last month sales must be a whole number of 0 or more';
        }

        if (data.couponCode.trim() && !COUPON_CODE_REGEX.test(data.couponCode.trim())) {
            errors.couponCode = 'Coupon code must be 3-20 letters, numbers, hyphens or underscores';
        }

        return errors;
    };

    const hasNewProductErrors = (errors: NewProductFormErrors): boolean => Object.values(errors).some(Boolean);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateNewProduct(newProduct);
        setNewProductErrors(errors);
        if (hasNewProductErrors(errors)) {
            showToast("Please fix the highlighted fields", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = parseImageUrlList(newProduct.imagesInput);

            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('price', String(Number(newProduct.price)));
            formData.append('stock', String(Number(newProduct.stock)));
            formData.append('description', newProduct.description);
            formData.append('category', newProduct.category);
            formData.append('brand', newProduct.brand);
            formData.append('modelName', newProduct.modelName);
            formData.append('rating', String(Number(newProduct.rating) || 0));
            formData.append('lastMonthSales', String(Number(newProduct.lastMonthSales) || 0));
            if (newProduct.couponCode) formData.append('couponCode', newProduct.couponCode);
            formData.append('discountPercentage', String(Number(newProduct.discountPercentage) || 0));
            formData.append('cgst', String(Number(newProduct.cgst) || 0));
            formData.append('sgst', String(Number(newProduct.sgst) || 0));
            formData.append('weightKg', String(Number(newProduct.weightKg) || 0.5));
            formData.append('lengthCm', String(Number(newProduct.lengthCm) || 10));
            formData.append('widthCm', String(Number(newProduct.widthCm) || 10));
            formData.append('heightCm', String(Number(newProduct.heightCm) || 10));
            formData.append('packQuantity', String(Number(newProduct.packQuantity) || 1));
            formData.append('packUnit', newProduct.packUnit);
            formData.append('unitSize', String(Number(newProduct.unitSize) || 0));
            formData.append('unitMeasure', newProduct.unitMeasure);
            formData.append('showAddToCart', String(newProduct.showAddToCart));
            formData.append('showBuyNow', String(newProduct.showBuyNow));
            formData.append('codAvailable', String(newProduct.codAvailable));
            formData.append('productType', newProduct.productType);
            formData.append('isReturnable', String(newProduct.isReturnable));
            formData.append('showDeliveryChecker', String(newProduct.showDeliveryChecker));
            formData.append('customDeliveryEstimate', newProduct.customDeliveryEstimate);
            newProduct.allowedCourierPartners.forEach(code => formData.append('allowedCourierPartners', code));
            imageUrls.forEach(url => formData.append('imageUrls', url));
            newProductImageFiles.forEach(file => formData.append('images', file));

            const res = await api.post('/products', formData);

            if (res.status === 200 || res.status === 201) {
                fetchProducts();
                setIsAddModalOpen(false);
                setNewProduct({
                    name: "", price: "", description: "", image: "", imagesInput: "", category: "", stock: "", brand: "",
                    modelName: "", rating: "", lastMonthSales: "", couponCode: "", discountPercentage: "", cgst: "", sgst: "",
                    weightKg: "", lengthCm: "", widthCm: "", heightCm: "",
                    packQuantity: "", packUnit: "Box", unitSize: "", unitMeasure: "Liter",
                    showAddToCart: true, showBuyNow: true, codAvailable: true,
                    productType: "physical", isReturnable: true, showDeliveryChecker: true,
                    allowedCourierPartners: ["BLUEDART", "DTDC"], customDeliveryEstimate: ""
                });
                setNewProductImageDraft("");
                setNewProductImageFiles([]);
                setNewProductErrors({});
                showToast("Product Added Successfully", "success");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to add product', "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (product: Product) => {
        const images = (product as any).images || [];
        const imagesInput = images.length > 0 ? images.join(', ') : (product as any).image;

        setEditingProduct({
            ...product,
            price: String(product.price),
            stock: String(product.stock),
            description: (product as any).description || "",
            image: (product as any).image || "",
            imagesInput: imagesInput || "",
            category: (typeof product.category === 'object' && product.category !== null) ? (product.category as any)._id : product.category,
            brand: (product as any).brand || "",
            modelName: (product as any).modelName || "",
            rating: String((product as any).rating || 0),
            lastMonthSales: String((product as any).lastMonthSales || 0),
            couponCode: (product as any).couponCode || "",
            discountPercentage: String((product as any).discountPercentage || 0),
            cgst: String((product as any).cgst || 0),
            sgst: String((product as any).sgst || 0),
            weightKg: String((product as any).weightKg ?? 0.5),
            lengthCm: String((product as any).lengthCm ?? 10),
            widthCm: String((product as any).widthCm ?? 10),
            heightCm: String((product as any).heightCm ?? 10),
            packQuantity: String((product as any).packQuantity ?? 1),
            packUnit: (product as any).packUnit || "Box",
            unitSize: String((product as any).unitSize ?? ''),
            unitMeasure: (product as any).unitMeasure || "Liter",
            showAddToCart: (product as any).showAddToCart !== false,
            showBuyNow: (product as any).showBuyNow !== false,
            codAvailable: (product as any).codAvailable !== false,
            productType: (product as any).productType === 'digital' ? 'digital' : 'physical',
            isReturnable: (product as any).isReturnable !== false,
            showDeliveryChecker: (product as any).showDeliveryChecker !== false,
            allowedCourierPartners: (product as any).allowedCourierPartners?.length ? (product as any).allowedCourierPartners : ["BLUEDART", "DTDC"],
            customDeliveryEstimate: (product as any).customDeliveryEstimate || ""
        });
        setEditProductImageDraft("");
        setEditProductImageFiles([]);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if ([editingProduct.price, editingProduct.stock, editingProduct.discountPercentage, editingProduct.cgst, editingProduct.sgst, editingProduct.weightKg, editingProduct.lengthCm, editingProduct.widthCm, editingProduct.heightCm]
            .some((v: string) => v !== "" && Number(v) < 0)) {
            showToast("Price, stock, discount, CGST, SGST, weight and dimensions cannot be negative", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = parseImageUrlList(editingProduct.imagesInput);

            const formData = new FormData();
            formData.append('name', editingProduct.name);
            formData.append('price', String(Number(editingProduct.price)));
            formData.append('stock', String(Number(editingProduct.stock)));
            formData.append('description', editingProduct.description || '');
            formData.append('category', editingProduct.category || '');
            formData.append('brand', editingProduct.brand || '');
            formData.append('modelName', editingProduct.modelName || '');
            formData.append('rating', String(Number(editingProduct.rating) || 0));
            formData.append('lastMonthSales', String(Number(editingProduct.lastMonthSales) || 0));
            if (editingProduct.couponCode) formData.append('couponCode', editingProduct.couponCode);
            formData.append('discountPercentage', String(Number(editingProduct.discountPercentage) || 0));
            formData.append('cgst', String(Number(editingProduct.cgst) || 0));
            formData.append('sgst', String(Number(editingProduct.sgst) || 0));
            formData.append('weightKg', String(Number(editingProduct.weightKg) || 0.5));
            formData.append('lengthCm', String(Number(editingProduct.lengthCm) || 10));
            formData.append('widthCm', String(Number(editingProduct.widthCm) || 10));
            formData.append('heightCm', String(Number(editingProduct.heightCm) || 10));
            formData.append('packQuantity', String(Number(editingProduct.packQuantity) || 1));
            formData.append('packUnit', editingProduct.packUnit || 'Piece');
            formData.append('unitSize', String(Number(editingProduct.unitSize) || 0));
            formData.append('unitMeasure', editingProduct.unitMeasure || '');
            formData.append('showAddToCart', String(editingProduct.showAddToCart !== false));
            formData.append('showBuyNow', String(editingProduct.showBuyNow !== false));
            formData.append('codAvailable', String(editingProduct.codAvailable !== false));
            formData.append('productType', editingProduct.productType === 'digital' ? 'digital' : 'physical');
            formData.append('isReturnable', String(editingProduct.isReturnable !== false));
            formData.append('showDeliveryChecker', String(editingProduct.showDeliveryChecker !== false));
            formData.append('customDeliveryEstimate', editingProduct.customDeliveryEstimate || '');
            (editingProduct.allowedCourierPartners?.length ? editingProduct.allowedCourierPartners : ["BLUEDART", "DTDC"]).forEach((code: string) => formData.append('allowedCourierPartners', code));
            formData.append('imagesFieldPresent', 'true');
            imageUrls.forEach((url: string) => formData.append('imageUrls', url));
            editProductImageFiles.forEach(file => formData.append('images', file));

            const res = await api.put(`/products/${editingProduct._id}`, formData);

            if (res.status === 200) {
                fetchProducts();
                setIsEditModalOpen(false);
                setEditingProduct(null);
                setEditProductImageFiles([]);
                showToast("Product Updated Successfully", "success");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || 'Failed to update product', "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-end items-center">
                                <button onClick={() => { setNewProductErrors({}); setNewProductImageFiles([]); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors">
                                    <Plus className="size-4" /> Add Product
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Coupons</th>
                                            <th className="p-4">Stock</th>
                                            <th className="p-4">Last Updated</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {productsList.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="p-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {(typeof p.category === 'object' && p.category !== null) ? (p.category as any).name : p.category}
                                                </td>
                                                <td className="p-4 text-slate-900 dark:text-white font-medium">₹{p.price}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {p.couponCode && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold">
                                                                <Tag className="size-3" /> {p.couponCode}
                                                            </span>
                                                        )}
                                                        {(p as any).couponDetails && (p as any).couponDetails.length > 0 && (
                                                            <button
                                                                onClick={() => setViewingCoupons({ productName: p.name, coupons: (p as any).couponDetails })}
                                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <Ticket className="size-3" />
                                                                {(p as any).couponDetails.length} Linked Coupon{(p as any).couponDetails.length !== 1 ? 's' : ''}
                                                            </button>
                                                        )}
                                                        {!p.couponCode && (!(p as any).couponDetails || (p as any).couponDetails.length === 0) && (
                                                            <span className="text-xs text-slate-400 italic">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {p.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right flex justify-end items-center gap-1">
                                                    <button onClick={() => setViewingProductDetails(p)} className="text-teal-600 hover:text-teal-800 p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors" title="View Full Product Details & Timestamps">
                                                        <Eye className="size-4" />
                                                    </button>
                                                    <a href={`/product/${p._id}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-600 p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-full transition-colors" title="Preview Public Storefront">
                                                        <ExternalLink className="size-4" />
                                                    </a>
                                                    <ToggleSwitch isOn={p.isActive} onToggle={() => toggleProductStatus(p._id, p.isActive)} />
                                                    <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="Edit Product">
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors" title="Delete Product">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                {/* View Coupons Modal */}
                <AnimatePresence>
                    {viewingCoupons && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Coupons for {viewingCoupons.productName}</h3>
                                    <button onClick={() => setViewingCoupons(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="size-6" />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        {viewingCoupons.coupons.length > 0 ? (
                                            viewingCoupons.coupons.map((coupon: any) => (
                                                <div key={coupon._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 block">{coupon.code}</span>
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                Discount: {coupon.discountType === 'fixed' ? '₹' : ''}{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ''} off
                                                            </span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    {coupon.expiresAt && (
                                                        <div className="text-xs text-slate-400">
                                                            Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {coupon.usageLimit && (
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            Usage: {coupon.usedCount} / {coupon.usageLimit}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-slate-500 py-8">No active coupons found for this product.</div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => setViewingCoupons(null)}
                                        className="w-full px-4 py-2 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                    {/* Add Product Modal */}
                    <AnimatePresence>
                        {
                            isAddModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h3>
                                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleAddProduct} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={newProduct.name}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, name: e.target.value });
                                                                if (newProductErrors.name) setNewProductErrors(prev => ({ ...prev, name: undefined }));
                                                            }}
                                                            className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.name ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="e.g. Cordless Drill"
                                                        />
                                                    </div>
                                                    {newProductErrors.name && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.name}</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                            <input
                                                                required
                                                                type="number"
                                                                min="0"
                                                                value={newProduct.price}
                                                                onChange={(e) => {
                                                                    setNewProduct({ ...newProduct, price: e.target.value });
                                                                    if (newProductErrors.price) setNewProductErrors(prev => ({ ...prev, price: undefined }));
                                                                }}
                                                                className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.price ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        {newProductErrors.price && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.price}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock <span className="text-red-500">*</span></label>
                                                        <input
                                                            required
                                                            type="number"
                                                            min="0"
                                                            value={newProduct.stock}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, stock: e.target.value });
                                                                if (newProductErrors.stock) setNewProductErrors(prev => ({ ...prev, stock: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.stock ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="100"
                                                        />
                                                        {newProductErrors.stock && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.stock}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={newProduct.cgst}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, cgst: e.target.value });
                                                                if (newProductErrors.cgst) setNewProductErrors(prev => ({ ...prev, cgst: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.cgst ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="9"
                                                        />
                                                        {newProductErrors.cgst && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.cgst}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={newProduct.sgst}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, sgst: e.target.value });
                                                                if (newProductErrors.sgst) setNewProductErrors(prev => ({ ...prev, sgst: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.sgst ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="9"
                                                        />
                                                        {newProductErrors.sgst && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.sgst}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                                                        <input
                                                            type="number"
                                                            min="0.05"
                                                            step="0.01"
                                                            value={newProduct.weightKg}
                                                            onChange={(e) => setNewProduct({ ...newProduct, weightKg: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Length (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.lengthCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, lengthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.widthCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, widthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={newProduct.heightCm}
                                                            onChange={(e) => setNewProduct({ ...newProduct, heightCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 -mt-2">Packed weight and dimensions are used to calculate Blue Dart / DTDC freight rates at checkout.</p>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pack Quantity</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={newProduct.packQuantity}
                                                            onChange={(e) => setNewProduct({ ...newProduct, packQuantity: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pack Unit</label>
                                                        <input
                                                            type="text"
                                                            list="pack-unit-options"
                                                            value={newProduct.packUnit}
                                                            onChange={(e) => setNewProduct({ ...newProduct, packUnit: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Box"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Size</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={newProduct.unitSize}
                                                            onChange={(e) => setNewProduct({ ...newProduct, unitSize: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Measure</label>
                                                        <input
                                                            type="text"
                                                            list="unit-measure-options"
                                                            value={newProduct.unitMeasure}
                                                            onChange={(e) => setNewProduct({ ...newProduct, unitMeasure: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Liter"
                                                        />
                                                    </div>
                                                </div>
                                                <datalist id="pack-unit-options">
                                                    <option value="Box" /><option value="Carton" /><option value="Piece" /><option value="Packet" /><option value="Bottle" /><option value="Pouch" />
                                                </datalist>
                                                <datalist id="unit-measure-options">
                                                    <option value="Liter" /><option value="ml" /><option value="Kg" /><option value="gram" /><option value="Piece" />
                                                </datalist>
                                                <p className="text-xs text-slate-400 -mt-2">e.g. 10 Box &times; 0.10 Liter each</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="newProductCodAvailable"
                                                        checked={newProduct.codAvailable}
                                                        onChange={(e) => setNewProduct({ ...newProduct, codAvailable: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="newProductCodAvailable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash on Delivery (COD) available</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="newProductShowAddToCart"
                                                        checked={newProduct.showAddToCart}
                                                        onChange={(e) => setNewProduct({ ...newProduct, showAddToCart: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="newProductShowAddToCart" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show "Add to Cart" button</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="newProductShowBuyNow"
                                                        checked={newProduct.showBuyNow}
                                                        onChange={(e) => setNewProduct({ ...newProduct, showBuyNow: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="newProductShowBuyNow" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show "Buy Now" button</label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Type</label>
                                                        <select
                                                            value={newProduct.productType}
                                                            onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        >
                                                            <option value="physical">Physical (shipped)</option>
                                                            <option value="digital">Digital (no shipping/delivery)</option>
                                                        </select>
                                                        <p className="text-xs text-slate-400 mt-1">Digital products hide shipping, delivery &amp; courier info on the product page.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-6">
                                                        <input
                                                            type="checkbox"
                                                            id="newProductIsReturnable"
                                                            checked={newProduct.isReturnable}
                                                            onChange={(e) => setNewProduct({ ...newProduct, isReturnable: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="newProductIsReturnable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Returnable / refundable</label>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="newProductShowDeliveryChecker"
                                                            checked={newProduct.showDeliveryChecker}
                                                            onChange={(e) => setNewProduct({ ...newProduct, showDeliveryChecker: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="newProductShowDeliveryChecker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show delivery / pincode checker on product page</label>
                                                    </div>

                                                    {newProduct.showDeliveryChecker && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed courier partners</label>
                                                                <div className="flex items-center gap-4">
                                                                    {["BLUEDART", "DTDC"].map(code => (
                                                                        <label key={code} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={newProduct.allowedCourierPartners.includes(code)}
                                                                                onChange={(e) => {
                                                                                    const current = newProduct.allowedCourierPartners;
                                                                                    if (!e.target.checked && current.length === 1) return; // keep at least one selected
                                                                                    const next = e.target.checked
                                                                                        ? [...current, code]
                                                                                        : current.filter(c => c !== code);
                                                                                    setNewProduct({ ...newProduct, allowedCourierPartners: next });
                                                                                }}
                                                                                className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                                            />
                                                                            {code === "BLUEDART" ? "Blue Dart" : "DTDC"}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-1">Restrict to one carrier for oversized, hazardous or high-value items only that carrier handles.</p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom delivery estimate (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={newProduct.customDeliveryEstimate}
                                                                    onChange={(e) => setNewProduct({ ...newProduct, customDeliveryEstimate: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                    placeholder="e.g. Made to order — ships in 7-10 business days"
                                                                />
                                                                <p className="text-xs text-slate-400 mt-1">Overrides the live courier ETA shown to customers. Leave blank to use the real-time estimate.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.brand}
                                                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.modelName}
                                                            onChange={(e) => setNewProduct({ ...newProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={newProduct.rating}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, rating: e.target.value });
                                                                if (newProductErrors.rating) setNewProductErrors(prev => ({ ...prev, rating: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.rating ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="4.5"
                                                        />
                                                        {newProductErrors.rating && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.rating}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={newProduct.lastMonthSales}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, lastMonthSales: e.target.value });
                                                                if (newProductErrors.lastMonthSales) setNewProductErrors(prev => ({ ...prev, lastMonthSales: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.lastMonthSales ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="50"
                                                        />
                                                        {newProductErrors.lastMonthSales && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.lastMonthSales}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon Code</label>
                                                        <input
                                                            type="text"
                                                            value={newProduct.couponCode}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, couponCode: e.target.value });
                                                                if (newProductErrors.couponCode) setNewProductErrors(prev => ({ ...prev, couponCode: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.couponCode ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="e.g. SAVE10"
                                                        />
                                                        {newProductErrors.couponCode && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.couponCode}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={newProduct.discountPercentage}
                                                            onChange={(e) => {
                                                                setNewProduct({ ...newProduct, discountPercentage: e.target.value });
                                                                if (newProductErrors.discountPercentage) setNewProductErrors(prev => ({ ...prev, discountPercentage: undefined }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.discountPercentage ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                            placeholder="10"
                                                        />
                                                        {newProductErrors.discountPercentage && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.discountPercentage}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
                                                    <select
                                                        required
                                                        value={newProduct.category}
                                                        onChange={(e) => {
                                                            setNewProduct({ ...newProduct, category: e.target.value });
                                                            if (newProductErrors.category) setNewProductErrors(prev => ({ ...prev, category: undefined }));
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 focus:ring-2 outline-none ${newProductErrors.category ? 'border-red-400 dark:border-red-600 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    {newProductErrors.category && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{newProductErrors.category}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            type="text"
                                                            value={newProductImageDraft}
                                                            onChange={(e) => handleImageUrlInputChange(e.target.value, 'new')}
                                                            onKeyDown={(e) => handleImageUrlInputKeyDown(e, 'new')}
                                                            onBlur={() => addImageUrlTag(newProductImageDraft, 'new')}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Paste a URL and press Enter or comma to add"
                                                        />
                                                    </div>
                                                    {parseImageUrlList(newProduct.imagesInput).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {parseImageUrlList(newProduct.imagesInput).map((url, idx) => (
                                                                <span
                                                                    key={`${url}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-700 dark:text-teal-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={url}>{url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImageUrlTag(url, 'new')}
                                                                        className="text-teal-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Or</span>
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                    </div>

                                                    <label className="flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-all">
                                                        <Upload className="size-5" />
                                                        Upload Image(s)
                                                        <span className="text-[11px] font-normal text-slate-400">You can select multiple image files at once. They&apos;ll be uploaded when you save.</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => {
                                                                queueProductImageFiles(e.target.files, 'new');
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {newProductImageFiles.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {newProductImageFiles.map((file, idx) => (
                                                                <span
                                                                    key={`${file.name}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={file.name}>{file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeQueuedProductImageFile(idx, 'new')}
                                                                        className="text-indigo-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                                    <textarea
                                                        value={newProduct.description}
                                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                        placeholder="Product details..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Create Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >

                    {/* Edit Product Modal */}
                    <AnimatePresence>
                        {
                            isEditModalOpen && editingProduct && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Product</h3>
                                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <X className="size-6" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleUpdateProduct} className="flex flex-col max-h-[90vh]">
                                            <div className="p-6 space-y-4 overflow-y-auto">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            required
                                                            type="text"
                                                            value={editingProduct.name}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Cordless Drill"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                            <input
                                                                required
                                                                type="number"
                                                                min="0"
                                                                value={editingProduct.price}
                                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock <span className="text-red-500">*</span></label>
                                                        <input
                                                            required
                                                            type="number"
                                                            min="0"
                                                            value={editingProduct.stock}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editingProduct.cgst}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, cgst: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="9"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SGST (%)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editingProduct.sgst}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, sgst: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="9"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                                                        <input
                                                            type="number"
                                                            min="0.05"
                                                            step="0.01"
                                                            value={editingProduct.weightKg}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, weightKg: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Length (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.lengthCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, lengthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Width (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.widthCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, widthCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="0.1"
                                                            value={editingProduct.heightCm}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, heightCm: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 -mt-2">Packed weight and dimensions are used to calculate Blue Dart / DTDC freight rates at checkout.</p>
                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pack Quantity</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editingProduct.packQuantity}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, packQuantity: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pack Unit</label>
                                                        <input
                                                            type="text"
                                                            list="pack-unit-options"
                                                            value={editingProduct.packUnit}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, packUnit: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Box"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Size</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={editingProduct.unitSize}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, unitSize: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="0.10"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Measure</label>
                                                        <input
                                                            type="text"
                                                            list="unit-measure-options"
                                                            value={editingProduct.unitMeasure}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, unitMeasure: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Liter"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400 -mt-2">e.g. 10 Box &times; 0.10 Liter each</p>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="editProductCodAvailable"
                                                        checked={editingProduct.codAvailable !== false}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, codAvailable: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="editProductCodAvailable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Cash on Delivery (COD) available</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="editProductShowAddToCart"
                                                        checked={editingProduct.showAddToCart !== false}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, showAddToCart: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="editProductShowAddToCart" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show "Add to Cart" button</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="editProductShowBuyNow"
                                                        checked={editingProduct.showBuyNow !== false}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, showBuyNow: e.target.checked })}
                                                        className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <label htmlFor="editProductShowBuyNow" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show "Buy Now" button</label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Type</label>
                                                        <select
                                                            value={editingProduct.productType === 'digital' ? 'digital' : 'physical'}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, productType: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                        >
                                                            <option value="physical">Physical (shipped)</option>
                                                            <option value="digital">Digital (no shipping/delivery)</option>
                                                        </select>
                                                        <p className="text-xs text-slate-400 mt-1">Digital products hide shipping, delivery &amp; courier info on the product page.</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-6">
                                                        <input
                                                            type="checkbox"
                                                            id="editProductIsReturnable"
                                                            checked={editingProduct.isReturnable !== false}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, isReturnable: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="editProductIsReturnable" className="text-sm font-medium text-slate-700 dark:text-slate-300">Returnable / refundable</label>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="editProductShowDeliveryChecker"
                                                            checked={editingProduct.showDeliveryChecker !== false}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, showDeliveryChecker: e.target.checked })}
                                                            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="editProductShowDeliveryChecker" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show delivery / pincode checker on product page</label>
                                                    </div>

                                                    {editingProduct.showDeliveryChecker !== false && (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Allowed courier partners</label>
                                                                <div className="flex items-center gap-4">
                                                                    {["BLUEDART", "DTDC"].map(code => {
                                                                        const current: string[] = editingProduct.allowedCourierPartners?.length ? editingProduct.allowedCourierPartners : ["BLUEDART", "DTDC"];
                                                                        return (
                                                                            <label key={code} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={current.includes(code)}
                                                                                    onChange={(e) => {
                                                                                        if (!e.target.checked && current.length === 1) return; // keep at least one selected
                                                                                        const next = e.target.checked
                                                                                            ? [...current, code]
                                                                                            : current.filter(c => c !== code);
                                                                                        setEditingProduct({ ...editingProduct, allowedCourierPartners: next });
                                                                                    }}
                                                                                    className="size-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                                                />
                                                                                {code === "BLUEDART" ? "Blue Dart" : "DTDC"}
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <p className="text-xs text-slate-400 mt-1">Restrict to one carrier for oversized, hazardous or high-value items only that carrier handles.</p>
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom delivery estimate (optional)</label>
                                                                <input
                                                                    type="text"
                                                                    value={editingProduct.customDeliveryEstimate || ""}
                                                                    onChange={(e) => setEditingProduct({ ...editingProduct, customDeliveryEstimate: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                                    placeholder="e.g. Made to order — ships in 7-10 business days"
                                                                />
                                                                <p className="text-xs text-slate-400 mt-1">Overrides the live courier ETA shown to customers. Leave blank to use the real-time estimate.</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.brand}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. Bosch"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                                                        <input
                                                            type="text"
                                                            value={editingProduct.modelName}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, modelName: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="e.g. GSB 600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max="5"
                                                            value={editingProduct.rating}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, rating: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="4.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Month Sales</label>
                                                        <input
                                                            type="number"
                                                            value={editingProduct.lastMonthSales}
                                                            onChange={(e) => setEditingProduct({ ...editingProduct, lastMonthSales: e.target.value })}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="50"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
                                                    <select
                                                        required
                                                        value={editingProduct.category}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesList.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URLs</label>
                                                    <div className="relative">
                                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                                        <input
                                                            type="text"
                                                            value={editProductImageDraft}
                                                            onChange={(e) => handleImageUrlInputChange(e.target.value, 'edit')}
                                                            onKeyDown={(e) => handleImageUrlInputKeyDown(e, 'edit')}
                                                            onBlur={() => addImageUrlTag(editProductImageDraft, 'edit')}
                                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                                                            placeholder="Paste a URL and press Enter or comma to add"
                                                        />
                                                    </div>
                                                    {parseImageUrlList(editingProduct.imagesInput).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {parseImageUrlList(editingProduct.imagesInput).map((url, idx) => (
                                                                <span
                                                                    key={`${url}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-medium text-teal-700 dark:text-teal-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={url}>{url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeImageUrlTag(url, 'edit')}
                                                                        className="text-teal-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase">Or</span>
                                                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                                    </div>

                                                    <label className="flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-all">
                                                        <Upload className="size-5" />
                                                        Upload Image(s)
                                                        <span className="text-[11px] font-normal text-slate-400">You can select multiple image files at once. They&apos;ll be uploaded when you save.</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            onChange={(e) => {
                                                                queueProductImageFiles(e.target.files, 'edit');
                                                                e.target.value = '';
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {editProductImageFiles.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {editProductImageFiles.map((file, idx) => (
                                                                <span
                                                                    key={`${file.name}-${idx}`}
                                                                    className="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                                                                >
                                                                    <span className="truncate max-w-[220px]" title={file.name}>{file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeQueuedProductImageFile(idx, 'edit')}
                                                                        className="text-indigo-500 hover:text-red-500 shrink-0"
                                                                        title="Remove"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                                    <textarea
                                                        value={editingProduct.description}
                                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none"
                                                        placeholder="Product details..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditModalOpen(false)}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30 flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Update Product'}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )
                        }
                    </AnimatePresence >
            <AnimatePresence>
                {viewingProductDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-teal-600 text-white rounded-xl">
                                        <Eye className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingProductDetails.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">SKU: {viewingProductDetails._id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/product/${viewingProductDetails._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1"
                                    >
                                        <ExternalLink className="size-3.5" /> View Live Page
                                    </a>
                                    <button onClick={() => setViewingProductDetails(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                                {/* Timestamp Banner */}
                                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                                        <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                                        <span><strong>Last Updated:</strong> {viewingProductDetails.updatedAt ? new Date(viewingProductDetails.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : 'N/A'} at {viewingProductDetails.updatedAt ? new Date(viewingProductDetails.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : 'N/A'}</span>
                                    </div>
                                    {viewingProductDetails.createdAt && (
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Calendar className="size-3.5 text-teal-600" />
                                            <span>Created: {new Date(viewingProductDetails.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Specifications Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pricing & Financials</span>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Selling Price:</span>
                                                <span className="font-bold text-teal-600 dark:text-teal-400">₹{viewingProductDetails.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Cost Price (COGS):</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{viewingProductDetails.costPrice || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">CGST / SGST Rate:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{viewingProductDetails.cgst || 0}% / {viewingProductDetails.sgst || 0}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Inventory & Brand</span>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Stock Quantity:</span>
                                                <span className={`font-bold ${viewingProductDetails.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{viewingProductDetails.stock} units</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Brand / Model:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{viewingProductDetails.brand || 'N/A'} / {viewingProductDetails.modelName || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Category:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{typeof viewingProductDetails.category === 'object' ? (viewingProductDetails.category as any).name : viewingProductDetails.category}</span>
                                            </div>
                                            {!!viewingProductDetails.unitMeasure && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Packaging:</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {viewingProductDetails.packQuantity || 1} {viewingProductDetails.packUnit || 'Piece'} &times; {viewingProductDetails.unitSize || 0} {viewingProductDetails.unitMeasure}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {viewingProductDetails.description && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            {viewingProductDetails.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                                <button
                                    onClick={() => setViewingProductDetails(null)}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
