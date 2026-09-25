"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
    Building2,
    Plus,
    Search,
    Loader2,
    ChevronRight,
    ChevronLeft,
    X,
    Trash2,
    Pencil,
    MapPin,
    Receipt,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';

interface Company {
    _id: string;
    name: string;
    location?: string;
    gstNumber?: string;
    createdAt: string;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MAX_NAME_LEN = 150;
const MAX_LOCATION_LEN = 200;
const PAGE_SIZE = 8;

interface CompanyFormErrors {
    name?: string;
    location?: string;
    gstNumber?: string;
}

const emptyCompanyForm = () => ({ name: '', location: '', gstNumber: '' });

const initials = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
};

export default function CompanyView() {
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(emptyCompanyForm());
    const [formErrors, setFormErrors] = useState<CompanyFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    const fetchAll = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const { data } = await api.get('companies', { params: searchQuery ? { search: searchQuery } : {} });
            setCompanies(data);
        } catch (err) {
            console.error('Error fetching companies:', err);
            showToast('Failed to load companies', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchAll, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery]);

    const totalPages = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
    const pagedCompanies = useMemo(
        () => companies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [companies, page]
    );

    const openNewCompanyForm = () => {
        setEditingCompany(null);
        setFormData(emptyCompanyForm());
        setFormErrors({});
        setIsFormOpen(true);
    };

    const openEditCompanyForm = (company: Company) => {
        setEditingCompany(company);
        setFormData({
            name: company.name || '',
            location: company.location || '',
            gstNumber: company.gstNumber || '',
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const validateCompanyForm = (): boolean => {
        const errors: CompanyFormErrors = {};
        const name = formData.name.trim();
        if (!name) {
            errors.name = 'Company name is required';
        } else if (name.length > MAX_NAME_LEN) {
            errors.name = `Name must be under ${MAX_NAME_LEN} characters`;
        }
        if (formData.location.trim().length > MAX_LOCATION_LEN) {
            errors.location = `Location must be under ${MAX_LOCATION_LEN} characters`;
        }
        if (formData.gstNumber.trim() && !GSTIN_REGEX.test(formData.gstNumber.trim().toUpperCase())) {
            errors.gstNumber = 'Enter a valid GST number (e.g., 27AAPFU0939F1ZV)';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateCompanyForm()) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                location: formData.location.trim(),
                gstNumber: formData.gstNumber.trim().toUpperCase(),
            };
            if (editingCompany) {
                await api.put(`companies/${editingCompany._id}`, payload);
                showToast('Company updated', 'success');
            } else {
                await api.post('companies', payload);
                showToast('Company added', 'success');
            }
            setIsFormOpen(false);
            setEditingCompany(null);
            setFormData(emptyCompanyForm());
            setFormErrors({});
            fetchAll();
        } catch (err: any) {
            console.error('Error saving company:', err);
            showToast(err?.response?.data?.msg || 'Failed to save company', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCompany = async (company: Company) => {
        const ok = await confirm({
            title: 'Delete Company',
            message: `Delete "${company.name}"? This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`companies/${company._id}`);
            showToast('Company deleted', 'success');
            fetchAll(true);
        } catch (err) {
            console.error('Error deleting company:', err);
            showToast('Failed to delete company', 'error');
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-11 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600">
                        <Building2 className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Companies</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage companies, their location and GST number</p>
                    </div>
                </div>

                <button
                    onClick={openNewCompanyForm}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    <Plus className="size-4" /> Add Company
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, location or GST number..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Company list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-teal-600" />
                </div>
            ) : companies.length === 0 ? (
                <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    No companies yet. Add your first company to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {pagedCompanies.map(company => (
                        <div
                            key={company._id}
                            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="flex items-center justify-center size-10 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 font-semibold shrink-0">
                                        {initials(company.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{company.name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                            {company.location && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <MapPin className="size-3" /> {company.location}
                                                </span>
                                            )}
                                            {company.gstNumber && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    <Receipt className="size-3" /> {company.gstNumber}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">Added {timeAgo(company.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => openEditCompanyForm(company)}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                                        title="Edit company"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCompany(company)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                        title="Delete company"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && companies.length > 0 && (
                <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, companies.length)} of {companies.length} companies
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="size-4" /> Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Add / Edit Company Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{editingCompany ? 'Edit Company' : 'Add Company'}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {editingCompany ? 'Update this company\'s details' : 'Add a new company to your workspace'}
                                </p>
                            </div>
                            <button onClick={() => { setIsFormOpen(false); setEditingCompany(null); setFormErrors({}); }} className="text-slate-400 hover:text-red-500">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitCompany} className="p-4 space-y-3 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Company Name *</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={formData.name}
                                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: undefined }); }}
                                    placeholder="Acme Infra Ltd."
                                    maxLength={MAX_NAME_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                    Location <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors({ ...formErrors, location: undefined }); }}
                                    placeholder="City, State"
                                    maxLength={MAX_LOCATION_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.location ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                    GST Number <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.gstNumber}
                                    onChange={(e) => { setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() }); setFormErrors({ ...formErrors, gstNumber: undefined }); }}
                                    placeholder="27AAPFU0939F1ZV"
                                    maxLength={15}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 ${formErrors.gstNumber ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.gstNumber && <p className="text-xs text-red-500 mt-1">{formErrors.gstNumber}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsFormOpen(false); setEditingCompany(null); setFormErrors({}); }}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                                >
                                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                                    {editingCompany ? 'Save Changes' : 'Add Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
