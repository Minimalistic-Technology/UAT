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
    Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';

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

    const handleOpenCreateModal = () => {
        setEditingContact(null);
        setFormData(emptyFormData());
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
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName.trim()) {
            showToast('First name is required', 'error');
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
        if (!confirm(`Delete contact "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/contacts/${id}`);
            showToast('Contact deleted', 'success');
            fetchContacts();
        } catch (error: any) {
            console.error('Failed to delete contact', error);
            showToast(error.response?.data?.msg || 'Failed to delete contact', 'error');
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
                        {filteredContacts.map((c) => {
                            const primaryEmail = c.emails[0]?.value;
                            const primaryPhone = c.phones[0]?.value;
                            return (
                                <div key={c._id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-all">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium">
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
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
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
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Emails</label>
                                <div className="space-y-2">
                                    {formData.emails.map((email, idx) => (
                                        <div key={idx} className="flex gap-2">
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
                                                onChange={(e) => updateEmailRow(idx, 'value', e.target.value)}
                                                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, emails: p.emails.filter((_, i) => i !== idx) }))}
                                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                            >
                                                <X className="size-4" />
                                            </button>
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
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phones</label>
                                <div className="space-y-2">
                                    {formData.phones.map((phone, idx) => (
                                        <div key={idx} className="flex gap-2">
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
                                                onChange={(e) => updatePhoneRow(idx, 'value', e.target.value)}
                                                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, phones: p.phones.filter((_, i) => i !== idx) }))}
                                                className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                            >
                                                <X className="size-4" />
                                            </button>
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
                                        value={formData.birthday}
                                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono"
                                    />
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
