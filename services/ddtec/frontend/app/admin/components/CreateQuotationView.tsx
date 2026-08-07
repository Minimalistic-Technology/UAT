"use client";

import React, { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    Trash2,
    Loader2,
    Download,
    Search,
    DollarSign,
    Calculator,
    Building,
    User,
    MapPin,
    Hash,
    Sparkles,
    RefreshCw,
    CheckCircle2,
    Save,
    Mail,
    Send
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/app/_context/ToastContext";

interface CatalogItem {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
    unit?: string;
    cgst?: number;
    sgst?: number;
}

interface QuotationLineItem {
    id: string; // Internal temporary ID for React key
    itemId?: string; // Optional reference ID if pre-filled from catalog
    name: string;
    price: number;
    unit: string;
    quantity: number;
    hsnCode: string;
    cgst: number;
    sgst: number;
}

export default function CreateQuotationView() {
    const { showToast } = useToast();
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [selectedCatalogId, setSelectedCatalogId] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Buyer Information State
    const [buyer, setBuyer] = useState({
        name: "",
        address: "",
        gstin: "",
        stateName: "",
        toEmail: ""
    });
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Quotation Line Items State
    const [items, setItems] = useState<QuotationLineItem[]>([
        {
            id: Math.random().toString(36).substr(2, 9),
            name: "Industrial Safety Gloves (Heavy Duty)",
            price: 450,
            unit: "Pair",
            quantity: 10,
            hsnCode: "392690",
            cgst: 9,
            sgst: 9
        }
    ]);

    useEffect(() => {
        fetchCatalogItems();
    }, []);

    const fetchCatalogItems = async () => {
        setLoadingCatalog(true);
        try {
            const [quotationItemsRes, mainProductsRes] = await Promise.all([
                api.get("/quotation-items/all").catch(() => ({ data: [] })),
                api.get("/products").catch(() => ({ data: [] }))
            ]);

            const list: CatalogItem[] = [];

            if (Array.isArray(quotationItemsRes.data)) {
                quotationItemsRes.data.forEach((item: any) => {
                    list.push({
                        _id: item._id,
                        name: item.name,
                        price: item.price || 0,
                        hsnCode: item.hsnCode || "",
                        unit: item.unit || "Nos",
                        cgst: item.cgst || 0,
                        sgst: item.sgst || 0
                    });
                });
            }

            if (Array.isArray(mainProductsRes.data)) {
                mainProductsRes.data.forEach((p: any) => {
                    if (!list.some(existing => existing.name.toLowerCase() === p.name.toLowerCase())) {
                        list.push({
                            _id: p._id,
                            name: p.name,
                            price: p.price || 0,
                            hsnCode: "8471",
                            unit: "Nos",
                            cgst: p.cgst || 9,
                            sgst: p.sgst || 9
                        });
                    }
                });
            }

            setCatalogItems(list);
        } catch (error) {
            console.error("Failed to load catalog items", error);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleAddFromCatalog = () => {
        if (!selectedCatalogId) return;
        const catalogObj = catalogItems.find(c => c._id === selectedCatalogId);
        if (!catalogObj) return;

        const newItem: QuotationLineItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: catalogObj._id,
            name: catalogObj.name,
            price: catalogObj.price,
            unit: catalogObj.unit || "Nos",
            quantity: 1,
            hsnCode: catalogObj.hsnCode || "",
            cgst: catalogObj.cgst ?? 9,
            sgst: catalogObj.sgst ?? 9
        };

        setItems(prev => [...prev, newItem]);
        setSelectedCatalogId("");
        showToast(`Added "${catalogObj.name}" to quotation draft`, "success");
    };

    const handleAddCustomItem = () => {
        const newItem: QuotationLineItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Custom Product / Service Item",
            price: 1000,
            unit: "Nos",
            quantity: 1,
            hsnCode: "9983",
            cgst: 9,
            sgst: 9
        };
        setItems(prev => [...prev, newItem]);
        showToast("Added blank custom line item", "info");
    };

    const handleItemChange = (id: string, field: keyof QuotationLineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            return {
                ...item,
                [field]: value
            };
        }));
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        showToast("Removed line item", "info");
    };

    // Financial Calculations
    const taxableTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    const cgstTotal = items.reduce((sum, item) => {
        const lineVal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        return sum + (lineVal * (Number(item.cgst) || 0)) / 100;
    }, 0);
    const sgstTotal = items.reduce((sum, item) => {
        const lineVal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        return sum + (lineVal * (Number(item.sgst) || 0)) / 100;
    }, 0);
    const grandTotal = taxableTotal + cgstTotal + sgstTotal;

    const handleGeneratePdf = async () => {
        if (items.length === 0) {
            showToast("Please add at least one line item to generate a quotation.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please specify Buyer Name / Organization.", "warning");
            return;
        }

        setIsGenerating(true);
        try {
            const payloadItems = items.map(item => ({
                itemId: item.itemId || undefined,
                name: item.name,
                price: Number(item.price) || 0,
                unit: item.unit || "Nos",
                quantity: Number(item.quantity) || 1,
                hsnCode: item.hsnCode || "",
                cgst: Number(item.cgst) || 0,
                sgst: Number(item.sgst) || 0
            }));

            const response = await api.post(
                "/quotation/generate",
                { items: payloadItems, buyer },
                { responseType: "blob" }
            );

            const disposition = response.headers["content-disposition"];
            const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `QT-${buyer.name.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast("Quotation PDF generated and downloaded successfully!", "success");
        } catch (error: any) {
            console.error("Quotation generation error:", error);
            showToast(error.response?.data?.msg || "Failed to generate quotation PDF.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = async () => {
        if (items.length === 0) {
            showToast("Please add at least one line item to send a quotation email.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please specify Buyer Name / Organization.", "warning");
            return;
        }
        if (!buyer.toEmail || !buyer.toEmail.includes("@")) {
            showToast("Please enter a valid Recipient Email Address (TO).", "warning");
            return;
        }

        setIsSendingEmail(true);
        try {
            const payloadItems = items.map(item => ({
                itemId: item.itemId || undefined,
                name: item.name,
                price: Number(item.price) || 0,
                unit: item.unit || "Nos",
                quantity: Number(item.quantity) || 1,
                hsnCode: item.hsnCode || "",
                cgst: Number(item.cgst) || 0,
                sgst: Number(item.sgst) || 0
            }));

            const { data } = await api.post("/quotation/send-email", {
                items: payloadItems,
                buyer,
                toEmail: buyer.toEmail
            });

            showToast(data.msg || `Quotation PDF successfully emailed to ${buyer.toEmail}`, "success");
        } catch (error: any) {
            console.error("Email sending error:", error);
            showToast(error.response?.data?.msg || "Failed to send quotation email.", "error");
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Create & Manipulate Quotation
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCatalogItems}
                        className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                        title="Reload catalog items"
                    >
                        <RefreshCw className={`size-4 ${loadingCatalog ? 'animate-spin' : ''}`} /> Refresh Catalog
                    </button>
                </div>
            </div>

            {/* Buyer / Customer Info Form */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <Building className="size-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customer / Buyer Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Buyer Name / Organization <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. Acme Infra Ltd."
                                value={buyer.name}
                                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Address / Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Plot 42, Tech Park, Pune"
                                value={buyer.address}
                                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            GSTIN / UIN Number
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="27AAACG0000A1Z5"
                                value={buyer.gstin}
                                onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            State Name
                        </label>
                        <input
                            type="text"
                            placeholder="Maharashtra (27)"
                            value={buyer.stateName}
                            onChange={(e) => setBuyer({ ...buyer, stateName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Recipient Email (TO)</span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400">Admin Only</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3 size-4 text-teal-600 dark:text-teal-400" />
                            <input
                                type="email"
                                placeholder="client@company.com"
                                value={buyer.toEmail}
                                onChange={(e) => setBuyer({ ...buyer, toEmail: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Selector & Manipulation Workspace */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">

                {/* Bar to Add from Catalog or Custom */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <FileText className="size-5 text-teal-600 dark:text-teal-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quotation Line Items</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Add from Catalog Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={selectedCatalogId}
                                onChange={(e) => setSelectedCatalogId(e.target.value)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none max-w-[240px]"
                            >
                                <option value="">-- Add from Catalog --</option>
                                {catalogItems.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.name} (₹{c.price})
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={handleAddFromCatalog}
                                disabled={!selectedCatalogId}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                            >
                                <Plus className="size-3.5" /> Add Catalog Item
                            </button>
                        </div>

                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                        {/* Add Custom Ad-Hoc Item */}
                        <button
                            type="button"
                            onClick={handleAddCustomItem}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 w-full sm:w-auto justify-center"
                        >
                            <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" /> + Add Custom Line Item
                        </button>
                    </div>
                </div>

                {/* Items Editable Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/40">
                                <th className="py-3 px-3 min-w-[220px]">Item Description</th>
                                <th className="py-3 px-2 w-[130px]">Rate (₹) <span className="text-teal-600 dark:text-teal-400 text-[10px] lowercase">(customizable)</span></th>
                                <th className="py-3 px-2 w-[90px]">Qty</th>
                                <th className="py-3 px-2 w-[90px]">Unit</th>
                                <th className="py-3 px-2 w-[95px]">HSN Code</th>
                                <th className="py-3 px-2 w-[80px]">CGST %</th>
                                <th className="py-3 px-2 w-[80px]">SGST %</th>
                                <th className="py-3 px-3 text-right w-[120px]">Amount (₹)</th>
                                <th className="py-3 px-2 text-center w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                                        No items added yet. Click <strong>"Add Catalog Item"</strong> or <strong>"+ Add Custom Line Item"</strong> above.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, index) => {
                                    const qty = Number(item.quantity) || 0;
                                    const rate = Number(item.price) || 0;
                                    const lineTaxable = qty * rate;
                                    const cgstVal = (lineTaxable * (Number(item.cgst) || 0)) / 100;
                                    const sgstVal = (lineTaxable * (Number(item.sgst) || 0)) / 100;
                                    const lineTotal = lineTaxable + cgstVal + sgstVal;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/20 transition-colors">
                                            {/* Name / Description */}
                                            <td className="py-3 px-3">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="Item title..."
                                                />
                                            </td>

                                            {/* Rate (Price) - FULL ADMIN MANIPULATION */}
                                            <td className="py-3 px-2">
                                                <div className="relative">
                                                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                                                        className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-teal-500/40 dark:border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 text-xs font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                                                        placeholder="0"
                                                        min="0"
                                                        step="any"
                                                    />
                                                </div>
                                            </td>

                                            {/* Quantity */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                    min="1"
                                                />
                                            </td>

                                            {/* Unit */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="Nos"
                                                />
                                            </td>

                                            {/* HSN Code */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="text"
                                                    value={item.hsnCode}
                                                    onChange={(e) => handleItemChange(item.id, "hsnCode", e.target.value)}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-mono uppercase text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="HSN"
                                                />
                                            </td>

                                            {/* CGST % */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="number"
                                                    value={item.cgst}
                                                    onChange={(e) => handleItemChange(item.id, "cgst", parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </td>

                                            {/* SGST % */}
                                            <td className="py-3 px-2">
                                                <input
                                                    type="number"
                                                    value={item.sgst}
                                                    onChange={(e) => handleItemChange(item.id, "sgst", parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </td>

                                            {/* Line Total */}
                                            <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white text-xs">
                                                ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            {/* Delete Row */}
                                            <td className="py-3 px-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financial Summary & Actions Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Quick Notes / Verification */}
                <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500" /> Admin Quotation Summary
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Generating this quotation will calculate taxes and produce an official GST tax invoice format PDF with unique quotation number <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">QT-{Date.now()}</span>.
                        </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setItems([]);
                                setBuyer({ name: "", address: "", gstin: "", stateName: "", toEmail: "" });
                                showToast("Cleared quotation form", "info");
                            }}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                        >
                            Reset Form
                        </button>
                    </div>
                </div>

                {/* Right Column: Grand Total Calculations & Download PDF */}
                <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Calculation Matrix</h4>

                    <div className="space-y-2 text-sm border-b border-slate-800 pb-4">
                        <div className="flex justify-between text-slate-300 text-xs">
                            <span>Taxable Value (Subtotal):</span>
                            <span className="font-mono font-bold text-white">₹{taxableTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-xs">
                            <span>Central Tax (CGST):</span>
                            <span className="font-mono font-bold text-teal-400">₹{cgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-xs">
                            <span>State Tax (SGST):</span>
                            <span className="font-mono font-bold text-teal-400">₹{sgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                        <span className="text-sm font-bold uppercase tracking-wider text-teal-300">Grand Total:</span>
                        <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                            ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Action Buttons: Download PDF & Send Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <button
                            type="button"
                            onClick={handleGeneratePdf}
                            disabled={isGenerating || items.length === 0}
                            className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-extrabold rounded-2xl border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="size-4 text-teal-400" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={isSendingEmail || items.length === 0}
                            className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                        >
                            {isSendingEmail ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Sending Email...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    <span>Send Email to (TO)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
