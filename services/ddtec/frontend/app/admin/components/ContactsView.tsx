"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Mail,
    Phone,
    Building2,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    UserPlus,
    Sparkles,
    Download,
    Trash,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';

interface ContactEmail {
    label: 'work' | 'personal' | 'other';
    value: string;
}

interface ContactPhone {
    label: 'mobile' | 'work' | 'home' | 'other';
    value: string;
}

interface ContactAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

interface Contact {
    _id: string;
    firstName: string;
    lastName?: string;
    emails: ContactEmail[];
    phones: ContactPhone[];
    company?: string;
    jobTitle?: string;
    address?: ContactAddress;
    productInterest: string[];
    tags: string[];
    birthday?: string;
    photo?: string;
    source: 'manual' | 'vcf_import' | 'csv_import';
    note?: string;
    createdAt: string;
    updatedAt: string;
}

const emptyEmail = (): ContactEmail => ({ label: 'work', value: '' });
const emptyPhone = (): ContactPhone => ({ label: 'mobile', value: '' });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

interface FormErrors {
    firstName?: string;
    lastName?: string;
    birthday?: string;
    emails: (string | null)[];
    phones: (string | null)[];
    emailsGeneral?: string;
    phonesGeneral?: string;
}

const emptyErrors = (): FormErrors => ({ emails: [], phones: [] });

const emptyFormData = () => ({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    emails: [emptyEmail()],
    phones: [emptyPhone()],
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    productInterest: '',
    tags: '',
    birthday: '',
    photo: '',
    note: ''
});

const timeAgo = (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(mins, 0)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
};

const initials = (c: Contact) =>
    `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase() || '?';

export default function ContactsView() {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [companyFilter, setCompanyFilter] = useState('All');
    const [productInterestFilter, setProductInterestFilter] = useState('All');
    const [newThisWeekOnly, setNewThisWeekOnly] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [viewingContact, setViewingContact] = useState<Contact | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFormat, setImportFormat] = useState<'vcf' | 'csv'>('vcf');
    const [importFileName, setImportFileName] = useState('');
    const [importContent, setImportContent] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState(emptyFormData());
    const [formErrors, setFormErrors] = useState<FormErrors>(emptyErrors());

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/contacts');
            setContacts(data);
        } catch (error: any) {
            console.error('Failed to fetch contacts', error);
            showToast('Failed to load contacts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const uniqueCompanies = useMemo(() => {
        const set = new Set<string>();
        contacts.forEach(c => c.company && set.add(c.company));
        return Array.from(set).sort();
    }, [contacts]);

    const uniqueProductInterests = useMemo(() => {
        const set = new Set<string>();
        contacts.forEach(c => c.productInterest.forEach(p => set.add(p)));
        return Array.from(set).sort();
    }, [contacts]);

    const newThisWeekCount = useMemo(() => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return contacts.filter(c => new Date(c.createdAt).getTime() >= weekAgo).length;
    }, [contacts]);

    const filteredContacts = useMemo(() => {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return contacts.filter(c => {
            const fullName = `${c.firstName} ${c.lastName || ''}`.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                fullName.includes(searchQuery.toLowerCase()) ||
                (c.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.emails.some(e => e.value.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCompany = companyFilter === 'All' || c.company === companyFilter;
            const matchesProduct = productInterestFilter === 'All' || c.productInterest.includes(productInterestFilter);
            const matchesWeek = !newThisWeekOnly || new Date(c.createdAt).getTime() >= weekAgo;

            return matchesSearch && matchesCompany && matchesProduct && matchesWeek;
        });
    }, [contacts, searchQuery, companyFilter, productInterestFilter, newThisWeekOnly]);

    // Reset to page 1 whenever the filtered result set changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, companyFilter, productInterestFilter, newThisWeekOnly, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedContacts = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredContacts.slice(start, start + pageSize);
    }, [filteredContacts, safeCurrentPage, pageSize]);

    const validateForm = (data: typeof formData): FormErrors => {
        const errors: FormErrors = emptyErrors();

        if (!data.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!data.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        const hasEmail = data.emails.some(e => e.value.trim());
        errors.emails = data.emails.map(e => {
            if (!e.value.trim()) return null;
            return EMAIL_REGEX.test(e.value.trim()) ? null : 'Enter a valid email address';
        });
        if (!hasEmail) {
            errors.emailsGeneral = 'At least one email address is required';
        }

        const hasPhone = data.phones.some(p => p.value.trim());
        errors.phones = data.phones.map(p => {
            if (!p.value.trim()) return null;
            return PHONE_REGEX.test(p.value.trim()) ? null : 'Enter a valid phone number';
        });
        if (!hasPhone) {
            errors.phonesGeneral = 'At least one phone number is required';
        }

        if (data.birthday) {
            const bday = new Date(data.birthday);
            if (bday.getTime() > Date.now()) {
                errors.birthday = 'Birthday cannot be in the future';
            }
        }

        return errors;
    };

    const hasErrors = (errors: FormErrors): boolean =>
        Boolean(errors.firstName || errors.lastName || errors.birthday || errors.emailsGeneral || errors.phonesGeneral) ||
        errors.emails.some(Boolean) ||
        errors.phones.some(Boolean);

    const handleOpenCreateModal = () => {
        setEditingContact(null);
        setFormData(emptyFormData());
        setFormErrors(emptyErrors());
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            firstName: contact.firstName,
            lastName: contact.lastName || '',
            company: contact.company || '',
            jobTitle: contact.jobTitle || '',
            emails: contact.emails.length > 0 ? contact.emails : [emptyEmail()],
            phones: contact.phones.length > 0 ? contact.phones : [emptyPhone()],
            street: contact.address?.street || '',
            city: contact.address?.city || '',
            state: contact.address?.state || '',
            postalCode: contact.address?.postalCode || '',
            country: contact.address?.country || '',
            productInterest: contact.productInterest.join(', '),
            tags: contact.tags.join(', '),
            birthday: contact.birthday ? contact.birthday.slice(0, 10) : '',
            photo: contact.photo || '',
            note: contact.note || ''
        });
        setFormErrors(emptyErrors());
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm(formData);
        setFormErrors(errors);
        if (hasErrors(errors)) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
                jobTitle: formData.jobTitle,
                emails: formData.emails.filter(e => e.value.trim()),
                phones: formData.phones.filter(p => p.value.trim()),
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                productInterest: formData.productInterest.split(',').map(s => s.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
                birthday: formData.birthday || undefined,
                photo: formData.photo,
                note: formData.note
            };

            if (editingContact) {
                await api.put(`/contacts/${editingContact._id}`, payload);
                showToast('Contact updated', 'success');
            } else {
                await api.post('/contacts', payload);
                showToast('Contact added', 'success');
            }

            setIsFormModalOpen(false);
            fetchContacts();
        } catch (error: any) {
            console.error('Error saving contact:', error);
            showToast(error.response?.data?.msg || 'Failed to save contact', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        const ok = await confirm({ message: `Delete contact "${name}"? This cannot be undone.`, variant: "danger" });
        if (!ok) return;
        try {
            await api.delete(`/contacts/${id}`);
            showToast('Contact deleted', 'success');
            fetchContacts();
        } catch (error: any) {
            console.error('Failed to delete contact', error);
            showToast(error.response?.data?.msg || 'Failed to delete contact', 'error');
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev => {
            const allSelected = paginatedContacts.length > 0 && paginatedContacts.every(c => prev.has(c._id));
            const next = new Set(prev);
            if (allSelected) {
                paginatedContacts.forEach(c => next.delete(c._id));
            } else {
                paginatedContacts.forEach(c => next.add(c._id));
            }
            return next;
        });
    };

    const csvField = (value: string): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

    const handleExportSelected = () => {
        const selected = contacts.filter(c => selectedIds.has(c._id));
        if (selected.length === 0) return;

        const headers = ['First Name', 'Last Name', 'Emails', 'Phones', 'Company', 'Job Title', 'Product Interest', 'Tags', 'Birthday', 'Note'];
        const rows = selected.map(c => [
            c.firstName,
            c.lastName || '',
            c.emails.map(e => e.value).join('; '),
            c.phones.map(p => p.value).join('; '),
            c.company || '',
            c.jobTitle || '',
            c.productInterest.join('; '),
            c.tags.join('; '),
            c.birthday ? c.birthday.slice(0, 10) : '',
            c.note || ''
        ]);

        const csv = [headers, ...rows].map(row => row.map(csvField).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Exported ${selected.length} contact(s)`, 'success');
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        const ok = await confirm({ message: `Delete ${ids.length} selected contact(s)? This cannot be undone.`, variant: "danger" });
        if (!ok) return;

        setIsBulkDeleting(true);
        try {
            await api.post('/contacts/bulk-delete', { ids });
            showToast(`Deleted ${ids.length} contact(s)`, 'success');
            setSelectedIds(new Set());
            fetchContacts();
        } catch (error: any) {
            console.error('Failed to bulk delete contacts', error);
            showToast(error.response?.data?.msg || 'Failed to delete contacts', 'error');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') setImportContent(reader.result);
        };
        reader.readAsText(file);
    };

    const handleImportSubmit = async () => {
        if (!importContent.trim()) {
            showToast('Please choose a file to import', 'error');
            return;
        }
        setIsImporting(true);
        try {
            const { data } = await api.post('/contacts/import', { format: importFormat, content: importContent });
            showToast(`Imported ${data.imported} contact(s)${data.skipped ? `, skipped ${data.skipped}` : ''}`, 'success');
            setIsImportModalOpen(false);
            setImportContent('');
            setImportFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchContacts();
        } catch (error: any) {
            console.error('Import failed', error);
            showToast(error.response?.data?.msg || 'Failed to import contacts', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const updateEmailRow = (idx: number, field: 'label' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            emails: prev.emails.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
        }));
    };

    const updatePhoneRow = (idx: number, field: 'label' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
        }));
    };

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Contacts</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{contacts.length}</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                            <Sparkles className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">New This Week</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{newThisWeekCount}</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Building2 className="size-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Companies</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{uniqueCompanies.length}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, company, or email..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>

                <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                    <option value="All">All Companies</option>
                    {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    value={productInterestFilter}
                    onChange={(e) => setProductInterestFilter(e.target.value)}
                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                    <option value="All">All Product Interests</option>
                    {uniqueProductInterests.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <button
                    onClick={() => setNewThisWeekOnly(v => !v)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        newThisWeekOnly
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                    New in last 7 days
                </button>

                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center justify-center gap-2"
                >
                    <Upload className="size-4" /> Import
                </button>

                <button
                    onClick={handleOpenCreateModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <UserPlus className="size-4" /> Add Contact
                </button>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                        {selectedIds.size} selected
                    </span>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                        Clear
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={handleExportSelected}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all flex items-center gap-2"
                        >
                            <Download className="size-3.5" /> Export
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-md disabled:opacity-60 transition-all flex items-center gap-2"
                        >
                            {isBulkDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash className="size-3.5" />}
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Contacts List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                        <Loader2 className="size-8 text-teal-600 animate-spin" />
                        <span className="text-slate-500 text-xs font-bold">Loading contacts...</span>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="size-14 text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">No Contacts Found</p>
                        <p className="text-xs text-slate-500 mt-1">Add a contact manually or import from VCF / CSV.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                        <div className="px-4 py-2.5 flex items-center gap-3 bg-slate-50/60 dark:bg-slate-900/30 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            <input
                                type="checkbox"
                                checked={paginatedContacts.length > 0 && paginatedContacts.every(c => selectedIds.has(c._id))}
                                onChange={toggleSelectAll}
                                className="size-3.5 rounded accent-teal-600"
                            />
                            Select All On This Page
                        </div>
                        {paginatedContacts.map((c) => {
                            const primaryEmail = c.emails[0]?.value;
                            const primaryPhone = c.phones[0]?.value;
                            return (
                                <div key={c._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-all">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(c._id)}
                                            onChange={() => toggleSelectOne(c._id)}
                                            className="size-3.5 rounded accent-teal-600 shrink-0"
                                        />
                                        <div className="flex items-center gap-2.5 min-w-[170px]">
                                            {c.photo ? (
                                                <img src={c.photo} alt={c.firstName} className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                            ) : (
                                                <div className="size-9 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {initials(c)}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    {c.firstName} {c.lastName}
                                                </span>
                                                {(c.company || c.jobTitle) && (
                                                    <span className="text-[10px] text-slate-400 block">
                                                        {[c.jobTitle, c.company].filter(Boolean).join(' @ ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-slate-600 dark:text-slate-400 min-w-[160px]">
                                            {primaryEmail && (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="size-3.5 text-slate-400 shrink-0" /> {primaryEmail}
                                                </div>
                                            )}
                                            {primaryPhone && (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Phone className="size-3.5 text-slate-400 shrink-0" /> {primaryPhone}
                                                </div>
                                            )}
                                        </div>

                                        {c.productInterest.length > 0 && (
                                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                {c.productInterest.slice(0, 3).map(p => (
                                                    <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                                        {p}
                                                    </span>
                                                ))}
                                                {c.productInterest.length > 3 && (
                                                    <span className="text-[10px] text-slate-400">+{c.productInterest.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        <span className="text-slate-400 font-mono text-[11px]">
                                            {timeAgo(c.createdAt)}
                                        </span>

                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <button
                                                onClick={() => setViewingContact(c)}
                                                className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="View details & note"
                                            >
                                                <Eye className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(c)}
                                                className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit contact"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c._id, `${c.firstName} ${c.lastName || ''}`.trim())}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                title="Delete contact"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Footer */}
                {!loading && filteredContacts.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            <span>
                                Showing {(safeCurrentPage - 1) * pageSize + 1}
                                –{Math.min(safeCurrentPage * pageSize, filteredContacts.length)} of {filteredContacts.length}
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="ml-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold outline-none"
                            >
                                <option value={10}>10 / page</option>
                                <option value={25}>25 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safeCurrentPage <= 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Previous page"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                                Page {safeCurrentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage >= totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Next page"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View/Detail Modal */}
            {viewingContact && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingContact(null)}>
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                {viewingContact.firstName} {viewingContact.lastName}
                            </h3>
                            <button onClick={() => setViewingContact(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            {(viewingContact.company || viewingContact.jobTitle) && (
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                                    <Building2 className="size-4 text-slate-400" />
                                    {[viewingContact.jobTitle, viewingContact.company].filter(Boolean).join(' @ ')}
                                </div>
                            )}

                            {viewingContact.emails.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Emails</span>
                                    {viewingContact.emails.map((e, i) => (
                                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Mail className="size-3.5 text-slate-400" /> {e.value}
                                            <span className="text-[10px] text-slate-400 uppercase">({e.label})</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewingContact.phones.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Phones</span>
                                    {viewingContact.phones.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <Phone className="size-3.5 text-slate-400" /> {p.value}
                                            <span className="text-[10px] text-slate-400 uppercase">({p.label})</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewingContact.address && Object.values(viewingContact.address).some(Boolean) && (
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Address</span>
                                    <p className="text-slate-700 dark:text-slate-300">
                                        {[
                                            viewingContact.address.street,
                                            viewingContact.address.city,
                                            viewingContact.address.state,
                                            viewingContact.address.postalCode,
                                            viewingContact.address.country
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}

                            {viewingContact.productInterest.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Product Interest</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {viewingContact.productInterest.map(p => (
                                            <span key={p} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewingContact.tags.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Tags</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {viewingContact.tags.map(t => (
                                            <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {viewingContact.note && (
                                <div className="flex items-start gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2.5">
                                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                    <div>
                                        <span className="block uppercase text-[10px] tracking-wider mb-0.5">Admin-only Note</span>
                                        {viewingContact.note}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsFormModalOpen(false)}>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h3>
                            <button type="button" onClick={() => setIsFormModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, firstName: e.target.value });
                                            if (formErrors.firstName) setFormErrors(prev => ({ ...prev, firstName: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none ${
                                            formErrors.firstName
                                                ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                    />
                                    {formErrors.firstName && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, lastName: e.target.value });
                                            if (formErrors.lastName) setFormErrors(prev => ({ ...prev, lastName: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none ${
                                            formErrors.lastName
                                                ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                    />
                                    {formErrors.lastName && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Emails */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emails *</label>
                                {formErrors.emailsGeneral && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 mb-1">{formErrors.emailsGeneral}</p>
                                )}
                                <div className="space-y-2">
                                    {formData.emails.map((email, idx) => (
                                        <div key={idx}>
                                            <div className="flex gap-2">
                                                <select
                                                    value={email.label}
                                                    onChange={(e) => updateEmailRow(idx, 'label', e.target.value)}
                                                    className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                                >
                                                    <option value="work">Work</option>
                                                    <option value="personal">Personal</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={email.value}
                                                    onChange={(e) => {
                                                        updateEmailRow(idx, 'value', e.target.value);
                                                        if (formErrors.emails[idx] || formErrors.emailsGeneral) {
                                                            setFormErrors(prev => ({
                                                                ...prev,
                                                                emails: prev.emails.map((err, i) => (i === idx ? null : err)),
                                                                emailsGeneral: e.target.value.trim() ? undefined : prev.emailsGeneral
                                                            }));
                                                        }
                                                    }}
                                                    className={`flex-1 px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none ${
                                                        formErrors.emails[idx]
                                                            ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                                                            : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(p => ({ ...p, emails: p.emails.filter((_, i) => i !== idx) }));
                                                        setFormErrors(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== idx) }));
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            {formErrors.emails[idx] && (
                                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.emails[idx]}</p>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, emails: [...p.emails, emptyEmail()] }))}
                                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                    >
                                        <Plus className="size-3.5" /> Add email
                                    </button>
                                </div>
                            </div>

                            {/* Phones */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phones *</label>
                                {formErrors.phonesGeneral && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 mb-1">{formErrors.phonesGeneral}</p>
                                )}
                                <div className="space-y-2">
                                    {formData.phones.map((phone, idx) => (
                                        <div key={idx}>
                                            <div className="flex gap-2">
                                                <select
                                                    value={phone.label}
                                                    onChange={(e) => updatePhoneRow(idx, 'label', e.target.value)}
                                                    className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                                >
                                                    <option value="mobile">Mobile</option>
                                                    <option value="work">Work</option>
                                                    <option value="home">Home</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="+91 9876543210"
                                                    value={phone.value}
                                                    onChange={(e) => {
                                                        updatePhoneRow(idx, 'value', e.target.value);
                                                        if (formErrors.phones[idx] || formErrors.phonesGeneral) {
                                                            setFormErrors(prev => ({
                                                                ...prev,
                                                                phones: prev.phones.map((err, i) => (i === idx ? null : err)),
                                                                phonesGeneral: e.target.value.trim() ? undefined : prev.phonesGeneral
                                                            }));
                                                        }
                                                    }}
                                                    className={`flex-1 px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none ${
                                                        formErrors.phones[idx]
                                                            ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                                                            : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(p => ({ ...p, phones: p.phones.filter((_, i) => i !== idx) }));
                                                        setFormErrors(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            {formErrors.phones[idx] && (
                                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.phones[idx]}</p>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, phones: [...p.phones, emptyPhone()] }))}
                                        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                    >
                                        <Plus className="size-3.5" /> Add phone
                                    </button>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Street" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="col-span-2 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
                                    <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
                                    <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
                                    <input type="text" placeholder="Postal Code" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
                                    <input type="text" placeholder="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Interest (comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Angle Grinders, Drill Machines"
                                        value={formData.productInterest}
                                        onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        placeholder="VIP, Reseller"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Birthday</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={formData.birthday}
                                        onChange={(e) => {
                                            setFormData({ ...formData, birthday: e.target.value });
                                            if (formErrors.birthday) setFormErrors(prev => ({ ...prev, birthday: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono ${
                                            formErrors.birthday
                                                ? 'border-red-400 dark:border-red-600'
                                                : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                    />
                                    {formErrors.birthday && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.birthday}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Photo URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://example.com/photo.jpg"
                                        value={formData.photo}
                                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                                    <AlertCircle className="size-3.5" /> Admin Note (private — never shown to non-admins)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Internal notes about this contact..."
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                {editingContact ? 'Save Changes' : 'Add Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsImportModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Import Contacts</h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setImportFormat('vcf'); setImportContent(''); setImportFileName(''); }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${importFormat === 'vcf' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
                                >
                                    VCF (vCard)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setImportFormat('csv'); setImportContent(''); setImportFileName(''); }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${importFormat === 'csv' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
                                >
                                    CSV (Google Contacts)
                                </button>
                            </div>

                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-6 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all">
                                <Upload className="size-5 text-teal-600" />
                                {importFileName || `Choose a .${importFormat} file`}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={importFormat === 'vcf' ? '.vcf,text/vcard' : '.csv,text/csv'}
                                    onChange={handleImportFileChange}
                                    className="hidden"
                                />
                            </label>

                            <p className="text-[11px] text-slate-400">
                                {importFormat === 'vcf'
                                    ? 'Standard vCard export from phones, Outlook, or Apple Contacts.'
                                    : "Export your contacts from Google Contacts as CSV (Google format), then upload it here."}
                            </p>
                        </div>
                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportSubmit}
                                disabled={isImporting || !importContent}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2"
                            >
                                {isImporting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
