"use client";

import { useState } from "react";
import {
    Search,
    Boxes,
    Plus,
    Minus,
    Activity,
    Check,
    RotateCcw,
    AlertTriangle
} from "lucide-react";
import api from "@/lib/api";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: { name: string } | string;
    isActive: boolean;
}

interface InventoryViewProps {
    products: Product[];
    isLoadingProducts: boolean;
    updateStockDirectly: (productId: string, newStock: number) => Promise<void>;
}

export default function InventoryView({
    products,
    isLoadingProducts,
    updateStockDirectly
}: InventoryViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [stockInputs, setStockInputs] = useState<Record<string, number>>({});

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof p.category === 'object' && p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleInputChange = (productId: string, val: string) => {
        const num = parseInt(val);
        if (!isNaN(num)) {
            setStockInputs(prev => ({ ...prev, [productId]: Math.max(0, num) }));
        }
    };

    const submitStockUpdate = async (productId: string, currentStock: number) => {
        const inputVal = stockInputs[productId];
        const newStock = inputVal !== undefined ? inputVal : currentStock;

        if (newStock === currentStock) return;

        setUpdatingId(productId);
        try {
            await updateStockDirectly(productId, newStock);
        } finally {
            setUpdatingId(null);
            // Clear input local state as it is now persisted
            const updatedInputs = { ...stockInputs };
            delete updatedInputs[productId];
            setStockInputs(updatedInputs);
        }
    };

    const adjustStockStep = (productId: string, currentStock: number, direction: number) => {
        const base = stockInputs[productId] !== undefined ? stockInputs[productId] : currentStock;
        const target = Math.max(0, base + direction);
        setStockInputs(prev => ({ ...prev, [productId]: target }));
    };

    const getStockBadge = (stockVal: number) => {
        if (stockVal === 0) {
            return "bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/30";
        }
        if (stockVal <= 25) {
            return "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30";
        }
        return "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/55 dark:border-emerald-900/30";
    };

    const getStockLabel = (stockVal: number) => {
        if (stockVal === 0) return "Out of Stock";
        if (stockVal <= 25) return "Low Stock Warning";
        return "Aesthetic In Stock";
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-6 flex-1">
            {/* Header controls layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Boxes className="size-5 text-teal-600" />
                        Warehouse Stock Control Center
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold mt-0.5">Directly update physical warehouse stock units below.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 size-3.5" />
                    <input
                        type="text"
                        placeholder="Search model, category, tool..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium placeholder-slate-450"
                    />
                </div>
            </div>

            {/* Inventory table */}
            <div className="flex-1 overflow-x-auto">
                {isLoadingProducts ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <Activity className="size-8 text-teal-600 animate-spin" />
                        <span className="text-slate-500 font-bold text-xs">Loading physical items data...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Boxes className="size-16 text-slate-350 dark:text-slate-850 mb-3" />
                        <p className="text-slate-800 dark:text-slate-300 font-bold text-sm">No Products Registered</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th className="pb-3.5 pl-2 font-black">Item Image</th>
                                <th className="pb-3.5 font-black">Product Details</th>
                                <th className="pb-3.5 font-black">Department</th>
                                <th className="pb-3.5 font-black">Unit Valuation</th>
                                <th className="pb-3.5 text-center font-black">Stock Status</th>
                                <th className="pb-3.5 text-center font-black">Physical Units Count</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-850/50">
                            {filtered.map((item) => {
                                const localValue = stockInputs[item._id] !== undefined ? stockInputs[item._id] : item.stock;
                                const isDirty = localValue !== item.stock;

                                return (
                                    <tr key={item._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all">
                                        <td className="py-4 pl-2">
                                            <div className="size-12 rounded-2xl overflow-hidden border border-slate-205 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shadow-xs">
                                                <img
                                                    src={item.image || "/fallback.jpg"}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 font-sans font-black text-xs text-slate-800 dark:text-white min-w-[200px]">
                                            {item.name}
                                            <span className="text-[10px] text-slate-450 dark:text-slate-550 block font-normal mt-0.5 font-mono">
                                                SKU-{item._id.substring(item._id.length - 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs font-bold text-slate-550 dark:text-slate-450 font-sans">
                                            {typeof item.category === "object" ? item.category?.name : "Abrasives department"}
                                        </td>
                                        <td className="py-4 text-xs font-black text-slate-750 dark:text-slate-350 font-mono">
                                            ₹{item.price?.toFixed(2)}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider leading-none shadow-xs ${getStockBadge(item.stock)}`}>
                                                {getStockLabel(item.stock)}
                                            </span>
                                            {item.stock <= 25 && item.stock > 0 && (
                                                <AlertTriangle className="size-4 text-orange-500 inline-block ml-1 animate-pulse" />
                                            )}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => adjustStockStep(item._id, item.stock, -1)}
                                                    className="size-7 rounded-lg border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-655 dark:text-slate-400"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>

                                                <input
                                                    type="number"
                                                    value={localValue}
                                                    onChange={(e) => handleInputChange(item._id, e.target.value)}
                                                    className="w-14 text-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg py-1 text-xs font-black text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono shadow-inner"
                                                />

                                                <button
                                                    onClick={() => adjustStockStep(item._id, item.stock, 1)}
                                                    className="size-7 rounded-lg border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-655 dark:text-slate-400"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>

                                                {/* Action Save button when values modified */}
                                                {isDirty && (
                                                    <button
                                                        onClick={() => submitStockUpdate(item._id, item.stock)}
                                                        disabled={updatingId === item._id}
                                                        className="ml-1 size-7 bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-650 text-white rounded-lg flex items-center justify-center shadow-xs transition-all animate-bounce"
                                                        title="Persist physical stock change"
                                                    >
                                                        {updatingId === item._id ? (
                                                            <Activity className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <Check className="size-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
