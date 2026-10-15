"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
    itemName?: string;
    className?: string;
    variant?: 'admin' | 'storefront' | 'warehouse';
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
    itemName = 'items',
    className = '',
    variant = 'admin',
}: PaginationProps) {
    if (totalPages <= 1 && (!totalItems || (pageSize && totalItems <= pageSize))) {
        return null;
    }

    const safePage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));

    const startItem = pageSize ? (safePage - 1) * pageSize + 1 : 1;
    const endItem = pageSize && totalItems !== undefined ? Math.min(safePage * pageSize, totalItems) : undefined;

    if (variant === 'storefront') {
        return (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-slate-200 dark:border-slate-800 ${className}`}>
                {totalItems !== undefined && pageSize !== undefined ? (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}</span> to{' '}
                        <span className="font-semibold text-slate-900 dark:text-white">{endItem}</span> of{' '}
                        <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> {itemName}
                    </p>
                ) : (
                    <span />
                )}

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, safePage - 1))}
                        disabled={safePage <= 1}
                        className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    >
                        <ChevronLeft className="size-4" /> Prev
                    </button>

                    <div className="flex items-center gap-1 px-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                        Page {safePage} of {totalPages}
                    </div>

                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                        disabled={safePage >= totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                    >
                        Next <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>
        );
    }

    if (variant === 'warehouse') {
        return (
            <div className={`flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-850 border-t border-slate-200 dark:border-slate-750 text-xs ${className}`}>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    {totalItems !== undefined && pageSize !== undefined && (
                        <span>
                            {startItem}–{endItem} of {totalItems} {itemName}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, safePage - 1))}
                        disabled={safePage <= 1}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
                        {safePage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                        disabled={safePage >= totalPages}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Default: 'admin' variant
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {totalItems !== undefined && pageSize !== undefined && (
                    <span>
                        Showing {startItem}–{endItem} of {totalItems} {itemName}
                    </span>
                )}
                {onPageSizeChange && pageSize !== undefined && (
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="ml-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold outline-none cursor-pointer"
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt} / page
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, safePage - 1))}
                    disabled={safePage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                    <ChevronLeft className="size-4" /> Previous
                </button>
                <span className="px-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                    Page {safePage} of {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                    disabled={safePage >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                    Next <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}
