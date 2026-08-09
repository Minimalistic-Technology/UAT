"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FileText,
    Plus,
    Minus,
    Trash2,
    Loader2,
    Download,
    Search,
    ImageOff,
    BookmarkCheck,
    Save,
    RotateCcw
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "../_context/ToastContext";

interface QuotationProduct {
    _id: string;
    name: string;
    price: number;
    quantity?: number;
    hsnCode?: string;
    unit?: string;
    description?: string;
    image?: string;
    cgst?: number;
    sgst?: number;
}

interface SelectedItem {
    itemId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    cgst: number;
    sgst: number;
}

function QuotationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [products, setProducts] = useState<QuotationProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);

    const [buyer, setBuyer] = useState({
        name: "",
        address: "",
        gstin: "",
        stateName: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const loadId = searchParams.get("load");
        if (loadId) {
            loadSavedQuotation(loadId);
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/quotation-items");
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch quotation products", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSavedQuotation = async (id: string) => {
        try {
            const { data } = await api.get(`/quotation/saved/${id}`);
            if (data) {
                setTitle(data.title || "");
                if (data.buyer) {
                    setBuyer({
                        name: data.buyer.name || "",
                        address: data.buyer.address || "",
                        gstin: data.buyer.gstin || "",
                        stateName: data.buyer.stateName || ""
                    });
                }
                if (Array.isArray(data.items)) {
                    setSelectedItems(
                        data.items.map((i: any) => ({
                            itemId: i.itemId || i._id,
                            name: i.name,
                            price: i.price,
                            unit: i.unit || "Nos",
                            quantity: i.quantity || 1,
                            cgst: i.cgst || 0,
                            sgst: i.sgst || 0
                        }))
                    );
                }
                setSavedQuotationId(data._id);
                showToast(`Loaded template for "${data.buyer?.name || data.title}"! You can edit items or buyer details to create a new quotation.`, "success");
            }
        } catch (error) {
            console.error("Failed to load saved quotation", error);
            showToast("Failed to load quotation template", "error");
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addItem = (product: QuotationProduct) => {
        const initialQty = product.quantity || 1;
        setSelectedItems(prev => {
            const existing = prev.find(i => i.itemId === product._id);
            if (existing) {
                return prev.map(i => i.itemId === product._id ? { ...i, quantity: i.quantity + initialQty } : i);
            }
            return [...prev, {
                itemId: product._id,
                name: product.name,
                price: product.price,
                unit: product.unit || "Nos",
                quantity: initialQty,
                cgst: product.cgst ?? 0,
                sgst: product.sgst ?? 0
            }];
        });
        showToast(`Added ${product.name} to quotation`, "success");
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity } : i));
    };

    const removeItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(i => i.itemId !== itemId));
    };

    const clearForm = () => {
        setSelectedItems([]);
        setBuyer({ name: "", address: "", gstin: "", stateName: "" });
        setTitle("");
        setSavedQuotationId(null);
        router.push("/quotation");
        showToast("Cleared quotation builder form.", "info");
    };

    const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cgstAmount = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity * i.cgst) / 100, 0);
    const sgstAmount = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity * i.sgst) / 100, 0);
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    const handleSaveQuotation = async () => {
        if (selectedItems.length === 0) {
            showToast("Please add at least one product to save the quotation.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please enter buyer name to save quotation.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const { data } = await api.post("/quotation/save", {
                id: savedQuotationId,
                title: title.trim() || `Quotation for ${buyer.name.trim()}`,
                buyer,
                items: selectedItems
            });

            if (data.quotation) {
                setSavedQuotationId(data.quotation._id);
            }
            showToast(data.msg || "Quotation saved successfully!", "success");
        } catch (error: any) {
            console.error("Save quotation error:", error);
            showToast(error.response?.data?.msg || "Failed to save quotation.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateQuotation = async () => {
        if (selectedItems.length === 0) {
            showToast("Please add at least one product to generate a quotation.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please enter buyer name.", "warning");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post(
                "/quotation/generate",
                {
                    items: selectedItems.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
                    buyer
                },
                { responseType: "blob" }
            );

            const disposition = response.headers["content-disposition"];
            const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `quotation-${Date.now()}.pdf`;

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast("Quotation PDF generated successfully!", "success");
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.msg || "Failed to generate quotation. Please try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header & Saved Quotations Navigation Option */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText className="size-8 text-teal-600" />
                            Build a Quotation
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Select products, choose quantities, save templates for future use, and generate downloadable quotations.
                        </p>
                    </div>

                    {/* View Saved Quotations Page Option */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href="/quotation/saved"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold rounded-xl border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all text-sm shadow-sm"
                        >
                            <BookmarkCheck className="size-4" />
                            View Saved Quotations
                        </Link>

                        {(selectedItems.length > 0 || buyer.name) && (
                            <button
                                onClick={clearForm}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-xs"
                                title="Reset builder"
                            >
                                <RotateCcw className="size-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Selection Catalog */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products to add..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="animate-spin text-teal-600 size-10" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No products available</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 max-h-[60vh] overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className="flex flex-col rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50"
                                    >
                                        <div className="aspect-square w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageOff className="size-8 text-slate-300 dark:text-slate-500" />
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">{product.name}</p>
                                            <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold mt-1">
                                                ₹{product.price.toLocaleString("en-IN")} / {product.unit || "Nos"}
                                            </p>
                                            <button
                                                onClick={() => addItem(product)}
                                                className="mt-auto pt-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors"
                                            >
                                                <Plus className="size-4" /> Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quotation Builder Sidebar */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden h-fit">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Selected Items</h2>
                            {selectedItems.length > 0 && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
                                    {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        <div className="p-5 space-y-3 max-h-[35vh] overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-6">No items selected yet</p>
                            ) : (
                                selectedItems.map(item => (
                                    <div key={item.itemId} className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">₹{item.price.toLocaleString("en-IN")} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                                                className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                            >
                                                <Minus className="size-3.5" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                                className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                            >
                                                <Plus className="size-3.5" />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.itemId)}
                                                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Calculation Summary */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-1.5 text-sm bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>CGST</span>
                                <span>₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>SGST</span>
                                <span>₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-base pt-1.5 border-t border-slate-200 dark:border-slate-700">
                                <span>Grand Total</span>
                                <span className="text-teal-600 dark:text-teal-400">₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Buyer & Quotation Title Inputs */}
                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quotation Details</h3>
                            
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Quotation Title (e.g. Project Alpha Quotation)"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2 border text-sm"
                            />

                            <input
                                type="text"
                                required
                                value={buyer.name}
                                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                                placeholder="Buyer / Company Name *"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2 border text-sm"
                            />

                            <textarea
                                value={buyer.address}
                                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                                placeholder="Address"
                                rows={2}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2 border text-sm"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={buyer.gstin}
                                    onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value })}
                                    placeholder="GSTIN"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2 border text-sm"
                                />
                                <input
                                    type="text"
                                    value={buyer.stateName}
                                    onChange={(e) => setBuyer({ ...buyer, stateName: e.target.value })}
                                    placeholder="State"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 p-2 border text-sm"
                                />
                            </div>

                            {/* Action Buttons: Save Quotation & Generate Quotation */}
                            <div className="pt-2 grid grid-cols-1 gap-2">
                                <button
                                    onClick={handleSaveQuotation}
                                    disabled={isSaving || selectedItems.length === 0 || !buyer.name.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                                    {savedQuotationId ? "Update Saved Quotation" : "Save Quotation to List"}
                                </button>

                                <button
                                    onClick={handleGenerateQuotation}
                                    disabled={isGenerating || selectedItems.length === 0 || !buyer.name.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 text-sm shadow-sm"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin size-4" /> : <Download className="size-4 text-teal-400" />}
                                    Generate & Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuotationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 flex items-center justify-center">
                <Loader2 className="animate-spin text-teal-600 size-10" />
            </div>
        }>
            <QuotationContent />
        </Suspense>
    );
}
