"use client";

import React, { useEffect, useState } from "react";
import { FileText, Plus, Minus, Trash2, Loader2, Download, Search } from "lucide-react";
import api from "@/lib/api";

interface QuotationProduct {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
    unit?: string;
    description?: string;
}

interface SelectedItem {
    itemId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
}

const CGST_RATE = 9;
const SGST_RATE = 9;

export default function QuotationPage() {
    const [products, setProducts] = useState<QuotationProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const [buyer, setBuyer] = useState({
        name: "",
        address: "",
        gstin: "",
        stateName: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addItem = (product: QuotationProduct) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.itemId === product._id);
            if (existing) {
                return prev.map(i => i.itemId === product._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { itemId: product._id, name: product.name, price: product.price, unit: product.unit || "Nos", quantity: 1 }];
        });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity } : i));
    };

    const removeItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(i => i.itemId !== itemId));
    };

    const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cgstAmount = (subtotal * CGST_RATE) / 100;
    const sgstAmount = (subtotal * SGST_RATE) / 100;
    const grandTotal = subtotal + cgstAmount + sgstAmount;

    const handleGenerateQuotation = async () => {
        if (selectedItems.length === 0) {
            alert("Please add at least one product to generate a quotation.");
            return;
        }
        if (!buyer.name.trim()) {
            alert("Please enter buyer name.");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post(
                "/quotation/generate",
                {
                    items: selectedItems.map(i => ({ itemId: i.itemId, quantity: i.quantity })),
                    buyer,
                    cgstRate: CGST_RATE,
                    sgstRate: SGST_RATE
                },
                { responseType: "blob" }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `quotation-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error(error);
            alert("Failed to generate quotation. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <FileText className="size-8 text-teal-600" />
                        Build a Quotation
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Select products, choose quantities, and generate a downloadable quotation.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product List */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
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
                            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <div key={product._id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                                            {product.description && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{product.description}</p>
                                            )}
                                            <p className="text-sm text-teal-600 dark:text-teal-400 font-semibold mt-1">
                                                ₹{product.price.toLocaleString("en-IN")} / {product.unit || "Nos"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => addItem(product)}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shrink-0"
                                        >
                                            <Plus className="size-4" /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quotation Builder */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden h-fit">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Selected Items</h2>
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

                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-1.5 text-sm">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>CGST ({CGST_RATE}%)</span>
                                <span>₹{cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>SGST ({SGST_RATE}%)</span>
                                <span>₹{sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-base pt-1.5 border-t border-slate-100 dark:border-slate-700">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Buyer Details</h3>
                            <input
                                type="text"
                                required
                                value={buyer.name}
                                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                                placeholder="Buyer / Company Name"
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

                            <button
                                onClick={handleGenerateQuotation}
                                disabled={isGenerating || selectedItems.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="animate-spin size-5" /> : <Download className="size-5" />}
                                Generate Quotation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
