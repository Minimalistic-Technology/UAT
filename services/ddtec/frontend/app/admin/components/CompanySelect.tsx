"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Building2,
    Search,
    ChevronDown,
    Plus,
    Check,
    X,
    Loader2,
    MapPin,
    Receipt,
    ArrowLeft,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';

export interface CompanyOption {
    _id: string;
    name: string;
    location?: string;
    gstNumber?: string;
}

interface CompanySelectProps {
    value?: string;
    onChange: (name: string, company?: CompanyOption) => void;
    placeholder?: string;
    error?: string;
    size?: 'sm' | 'md';
    className?: string;
    disabled?: boolean;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export default function CompanySelect({
    value = '',
    onChange,
    placeholder = 'Select or add company...',
    error,
    size = 'md',
    className = '',
    disabled = false,
}: CompanySelectProps) {
    const { showToast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Quick add company state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyLocation, setNewCompanyLocation] = useState('');
    const [newCompanyGstin, setNewCompanyGstin] = useState('');
    const [newCompanyError, setNewCompanyError] = useState<string | null>(null);
    const [isSavingNew, setIsSavingNew] = useState(false);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('companies');
            setCompanies(Array.isArray(data) ? data : []);
            setHasLoaded(true);
        } catch (err) {
            console.error('Failed to load companies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !hasLoaded) {
            fetchCompanies();
        }
    }, [isOpen, hasLoaded]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsAddingNew(false);
                setSearchQuery('');
                setNewCompanyError(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && !isAddingNew) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
    }, [isOpen, isAddingNew]);

    const filteredCompanies = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return companies;
        return companies.filter(
            c =>
                c.name.toLowerCase().includes(q) ||
                (c.location && c.location.toLowerCase().includes(q)) ||
                (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
        );
    }, [companies, searchQuery]);

    const exactMatch = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return null;
        return companies.find(c => c.name.toLowerCase() === q) || null;
    }, [companies, searchQuery]);

    const handleSelectCompany = (company: CompanyOption) => {
        onChange(company.name, company);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('', undefined);
        setSearchQuery('');
    };

    const handleStartAddNew = (initialName?: string) => {
        setNewCompanyName(initialName || searchQuery.trim());
        setNewCompanyLocation('');
        setNewCompanyGstin('');
        setNewCompanyError(null);
        setIsAddingNew(true);
    };

    const handleCancelAddNew = () => {
        setIsAddingNew(false);
        setNewCompanyError(null);
    };

    const handleSaveNewCompany = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const trimmedName = newCompanyName.trim();
        if (!trimmedName) {
            setNewCompanyError('Company name is required');
            return;
        }
        if (trimmedName.length > 100) {
            setNewCompanyError('Company name must be under 100 characters');
            return;
        }
        if (newCompanyLocation.trim().length > 100) {
            setNewCompanyError('Location must be under 100 characters');
            return;
        }

        const trimmedGstin = newCompanyGstin.trim().toUpperCase();
        if (trimmedGstin && !GSTIN_REGEX.test(trimmedGstin)) {
            setNewCompanyError('Enter a valid GST number (e.g., 27AAPFU0939F1ZV)');
            return;
        }

        try {
            setIsSavingNew(true);
            setNewCompanyError(null);
            const payload = {
                name: trimmedName,
                location: newCompanyLocation.trim() || undefined,
                gstNumber: trimmedGstin || undefined,
            };
            const { data: createdCompany } = await api.post('companies', payload);
            showToast('Company created and selected', 'success');
            setCompanies(prev => [createdCompany, ...prev]);
            onChange(createdCompany.name, createdCompany);
            setIsAddingNew(false);
            setIsOpen(false);
            setSearchQuery('');
        } catch (err: any) {
            console.error('Failed to create company:', err);
            setNewCompanyError(err?.response?.data?.msg || 'Failed to create company');
        } finally {
            setIsSavingNew(false);
        }
    };

    const isSmall = size === 'sm';

    const triggerClass = isSmall
        ? `w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-all flex items-center justify-between gap-2 cursor-pointer ${
              error
                  ? 'border-red-400 dark:border-red-600 focus:ring-2 focus:ring-red-500'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-teal-500'
          }`
        : `w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white transition-all flex items-center justify-between gap-2 cursor-pointer ${
              error
                  ? 'border-red-400 focus:ring-2 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 focus:ring-2 focus:ring-teal-500'
          }`;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                    if (!disabled) setIsOpen(prev => !prev);
                }}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        setIsOpen(prev => !prev);
                    }
                }}
                className={`${triggerClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-2 min-w-0 truncate">
                    <Building2 className={`${isSmall ? 'size-3.5' : 'size-4'} text-slate-400 shrink-0`} />
                    {value ? (
                        <span className="font-medium text-slate-900 dark:text-white truncate">{value}</span>
                    ) : (
                        <span className="text-slate-400 truncate">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            title="Clear"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute z-50 left-0 mt-1.5 w-[min(360px,calc(100vw-3rem))] min-w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                    {!isAddingNew ? (
                        <>
                            {/* Search Header */}
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search or add company..."
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            {/* List of Companies */}
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/40">
                                {loading && !hasLoaded ? (
                                    <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
                                        <Loader2 className="size-4 animate-spin text-teal-600 mr-2" />
                                        Loading companies...
                                    </div>
                                ) : filteredCompanies.length === 0 ? (
                                    <div className="py-4 px-3 text-center text-xs text-slate-400">
                                        No matching companies found
                                    </div>
                                ) : (
                                    filteredCompanies.map(company => {
                                        const isSelected = value.toLowerCase() === company.name.toLowerCase();
                                        return (
                                            <button
                                                key={company._id}
                                                type="button"
                                                onClick={() => handleSelectCompany(company)}
                                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                                    isSelected
                                                        ? 'bg-teal-50/70 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-semibold'
                                                        : 'text-slate-800 dark:text-slate-200'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{company.name}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                                                        {company.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="size-2.5" /> {company.location}
                                                            </span>
                                                        )}
                                                        {company.gstNumber && (
                                                            <span className="flex items-center gap-1 font-mono">
                                                                <Receipt className="size-2.5" /> {company.gstNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="size-3.5 text-teal-600 shrink-0" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>

                            {/* Create Option Footer */}
                            <div className="p-1.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
                                {searchQuery.trim() && !exactMatch ? (
                                    <button
                                        type="button"
                                        onClick={() => handleStartAddNew(searchQuery.trim())}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg font-semibold transition-colors text-left"
                                    >
                                        <Plus className="size-3.5 shrink-0" />
                                        <span className="truncate">Add &quot;{searchQuery.trim()}&quot; to companies</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleStartAddNew()}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg font-semibold transition-colors text-left"
                                    >
                                        <Plus className="size-3.5 shrink-0 text-teal-600" />
                                        <span>New Company</span>
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Inline Quick Add Form */
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSaveNewCompany(e);
                                }
                            }}
                            className="p-3 space-y-2.5"
                        >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={handleCancelAddNew}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <ArrowLeft className="size-3" /> Back
                                </button>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">New Company</span>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-0.5">
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-[10px] ${newCompanyName.length >= 100 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                        {newCompanyName.length}/100
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newCompanyName}
                                    onChange={(e) => {
                                        setNewCompanyName(e.target.value);
                                        setNewCompanyError(null);
                                    }}
                                    placeholder="Company name"
                                    maxLength={100}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-0.5">
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                        Location <span className="font-normal text-slate-400 lowercase">(optional)</span>
                                    </label>
                                    <span className={`text-[10px] ${newCompanyLocation.length >= 100 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                        {newCompanyLocation.length}/100
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={newCompanyLocation}
                                    onChange={(e) => setNewCompanyLocation(e.target.value)}
                                    placeholder="City, State"
                                    maxLength={100}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">
                                    GST Number (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newCompanyGstin}
                                    onChange={(e) => setNewCompanyGstin(e.target.value.toUpperCase())}
                                    placeholder="e.g. 27AAPFU0939F1ZV"
                                    maxLength={15}
                                    className="w-full px-2.5 py-1.5 text-xs uppercase font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            {newCompanyError && (
                                <p className="text-[11px] text-red-600 dark:text-red-400">{newCompanyError}</p>
                            )}

                            <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                    type="button"
                                    onClick={handleCancelAddNew}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveNewCompany}
                                    disabled={isSavingNew}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60 flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                    {isSavingNew && <Loader2 className="size-3 animate-spin" />}
                                    Save & Select
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
