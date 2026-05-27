"use client";

import {
    Activity,
    Inbox,
    Search
} from "lucide-react";

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: { name: string } | string;
    isActive: boolean;
}

interface InventoryListProps {
    products: Product[];
    isLoadingProducts: boolean;
    productSearch: string;
    setProductSearch: (val: string) => void;
    handleToggleStock: (productId: string, currentStock: number) => void;
}

export default function InventoryList({
    products,
    isLoadingProducts,
    productSearch,
    setProductSearch,
    handleToggleStock
}: InventoryListProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border-0 rounded-3xl p-6 shadow-xl dark:shadow-slate-900 drop-shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Inventory Status</h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">Click rows to toggle stock values instantly.</p>
                </div>
                {/* Small Compact Search box inside mockup box */}
                <div className="relative w-full sm:w-36 flex-shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450 size-3" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1 text-[10px] text-slate-805 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
                    />
                </div>
            </div>

            {/* Inventory elements list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[385px]">
                {isLoadingProducts ? (
                    <div className="h-full flex items-center justify-center py-20">
                        <Activity className="size-6 text-teal-605 dark:text-teal-450 animate-spin mr-2" />
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold font-sans">Synchronizing products...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                        <Inbox className="size-10 text-slate-300 dark:text-slate-750 mb-3" />
                        <p className="text-slate-800 dark:text-slate-350 font-black text-xs">Catalog empty</p>
                    </div>
                ) : (
                    products.slice(0, 15).map((product) => {
                        const inStock = product.stock > 25;
                        const lowStock = product.stock <= 25 && product.stock > 0;

                        let stockStatusBadgeClass = "bg-emerald-50 dark:bg-emerald-955/20 text-emerald-750 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-950/40";
                        let stockStatusLabelUser = "In Stock";
                        if (lowStock) {
                            stockStatusBadgeClass = "bg-orange-50 dark:bg-orange-955/20 text-orange-700 dark:text-orange-400 border border-orange-200/50 dark:border-orange-950/40 animate-pulse";
                            stockStatusLabelUser = "Low Stock";
                        } else if (product.stock === 0) {
                            stockStatusBadgeClass = "bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 border border-red-200/55 dark:border-red-950/40";
                            stockStatusLabelUser = "Out of Stock";
                        }

                        return (
                            <div
                                key={product._id}
                                onClick={() => handleToggleStock(product._id, product.stock)}
                                className="group bg-slate-50 hover:bg-teal-50/20 dark:bg-slate-900/60 dark:hover:bg-teal-950/10 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-3 shadow-xs hover:border-teal-500/30 dark:hover:border-teal-500/25 transition-[all] duration-150 flex items-center justify-between cursor-pointer"
                            >
                                {/* Left visual details */}
                                <div className="flex items-center gap-3 min-w-0 pr-4">
                                    <div className="size-9 rounded-xl overflow-hidden border border-slate-205 dark:border-slate-805 bg-white dark:bg-slate-950 flex-shrink-0 flex items-center justify-center">
                                        <img
                                            src={product.image || "/fallback.jpg"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <h4 className="font-sans font-black text-xs text-slate-800 dark:text-white truncate" title={product.name}>
                                            {product.name}
                                        </h4>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5 tracking-wide leading-none truncate font-sans">
                                            {typeof product.category === 'object' ? product.category?.name : 'Catalog Product'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right numerical status indicators */}
                                <div className="flex items-center gap-4.5 flex-shrink-0">
                                    <div className="text-right">
                                        <span className="text-[8px] font-bold text-slate-405 dark:text-slate-550 uppercase tracking-widest block leading-none">QTY LOG</span>
                                        <span className="text-xs font-black text-slate-750 dark:text-slate-350 block mt-1 leading-none font-mono">
                                            {product.stock}
                                        </span>
                                    </div>

                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-wider leading-none shadow-2xs ${stockStatusBadgeClass}`}>
                                        {stockStatusLabelUser}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
