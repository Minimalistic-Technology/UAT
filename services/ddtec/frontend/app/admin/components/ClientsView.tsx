"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
    Users,
    Plus,
    Search,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Download,
    X,
    Trash2,
    Pencil,
    Phone,
    Mail,
    Building2,
    FolderKanban,
    Receipt
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';

interface ClientProject {
    _id: string;
    client: string;
    title: string;
    status: 'ongoing' | 'completed';
    note?: string;
    createdAt: string;
}

interface Client {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    gstin?: string;
    currency: string;
    note?: string;
    projects: ClientProject[];
    projectCount: number;
    ongoingCount: number;
    completedCount: number;
    createdAt: string;
}

interface ClientStats {
    totalClients: number;
    totalProjects: number;
    ongoing: number;
    completed: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const MAX_NAME_LEN = 100;
const MAX_COMPANY_LEN = 100;
const MAX_NOTE_LEN = 2000;
const PAGE_SIZE = 6;

const CURRENCY_OPTIONS = [
    { code: 'INR', label: 'INR — Indian Rupee (₹)' },
    { code: 'USD', label: 'USD — US Dollar ($)' },
    { code: 'EUR', label: 'EUR — Euro (€)' },
    { code: 'GBP', label: 'GBP — British Pound (£)' },
    { code: 'AED', label: 'AED — UAE Dirham (د.إ)' },
    { code: 'AUD', label: 'AUD — Australian Dollar ($)' },
    { code: 'CAD', label: 'CAD — Canadian Dollar ($)' },
    { code: 'SGD', label: 'SGD — Singapore Dollar ($)' },
];

interface ClientFormErrors {
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
    gstin?: string;
}

const emptyClientForm = () => ({ name: '', phone: '', email: '', company: '', gstin: '', currency: 'INR', note: '' });

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

const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

const csvEscape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function ClientsView() {
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<ClientStats>({ totalClients: 0, totalProjects: 0, ongoing: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(emptyClientForm());
    const [formErrors, setFormErrors] = useState<ClientFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const [projectClient, setProjectClient] = useState<Client | null>(null);
    const [projectTitle, setProjectTitle] = useState('');
    const [isSubmittingProject, setIsSubmittingProject] = useState(false);

    const fetchAll = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [clientsRes, statsRes] = await Promise.all([
                api.get('clients', { params: searchQuery ? { search: searchQuery } : {} }),
                api.get('clients/stats'),
            ]);
            setClients(clientsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching clients data:', err);
            showToast('Failed to load clients', 'error');
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

    const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
    const pagedClients = useMemo(
        () => clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [clients, page]
    );

    const openNewClientForm = () => {
        setEditingClient(null);
        setFormData(emptyClientForm());
        setFormErrors({});
        setIsFormOpen(true);
    };

    const openEditClientForm = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            company: client.company || '',
            gstin: client.gstin || '',
            currency: client.currency || 'INR',
            note: client.note || '',
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const validateClientForm = (): boolean => {
        const errors: ClientFormErrors = {};
        const name = formData.name.trim();
        if (!name) {
            errors.name = 'Client name is required';
        } else if (name.length > MAX_NAME_LEN) {
            errors.name = `Name must be under ${MAX_NAME_LEN} characters`;
        }
        if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
            errors.phone = 'Enter a valid phone number';
        }
        if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (formData.company.trim().length > MAX_COMPANY_LEN) {
            errors.company = `Company must be under ${MAX_COMPANY_LEN} characters`;
        }
        if (formData.gstin.trim() && !GSTIN_REGEX.test(formData.gstin.trim().toUpperCase())) {
            errors.gstin = 'Enter a valid GSTIN (e.g., 27AAPFU0939F1ZV)';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateClientForm()) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                company: formData.company.trim(),
                gstin: formData.gstin.trim().toUpperCase(),
                currency: formData.currency,
                note: formData.note.trim(),
            };
            if (editingClient) {
                await api.put(`clients/${editingClient._id}`, payload);
                showToast('Client updated', 'success');
            } else {
                await api.post('clients', payload);
                showToast('Client added', 'success');
            }
            setIsFormOpen(false);
            setEditingClient(null);
            setFormData(emptyClientForm());
            setFormErrors({});
            fetchAll();
        } catch (err: any) {
            console.error('Error saving client:', err);
            showToast(err?.response?.data?.msg || 'Failed to save client', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClient = async (client: Client) => {
        const ok = await confirm({
            title: 'Delete Client',
            message: `Delete "${client.name}"? This will also remove their projects. This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`clients/${client._id}`);
            showToast('Client deleted', 'success');
            fetchAll(true);
        } catch (err) {
            console.error('Error deleting client:', err);
            showToast('Failed to delete client', 'error');
        }
    };

    const openNewProjectForm = (client: Client) => {
        setProjectClient(client);
        setProjectTitle('');
    };

    const handleSubmitProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectClient) return;
        const title = projectTitle.trim();
        if (!title) {
            showToast('Project title is required', 'error');
            return;
        }
        try {
            setIsSubmittingProject(true);
            await api.post(`clients/${projectClient._id}/projects`, { title, status: 'ongoing' });
            showToast('Project added', 'success');
            setProjectClient(null);
            setProjectTitle('');
            fetchAll(true);
        } catch (err: any) {
            console.error('Error creating project:', err);
            showToast(err?.response?.data?.msg || 'Failed to add project', 'error');
        } finally {
            setIsSubmittingProject(false);
        }
    };

    const handleExportCsv = () => {
        const header = ['Name', 'Phone', 'Email', 'Company', 'GSTIN', 'Currency', 'Projects', 'Ongoing', 'Completed', 'Added'];
        const rows = clients.map(c => [
            c.name, c.phone || '', c.email || '', c.company || '', c.gstin || '', c.currency || 'INR',
            c.projectCount, c.ongoingCount, c.completedCount, c.createdAt,
        ]);
        const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
        downloadFile(csv, 'clients.csv', 'text/csv');
    };

    const handleExportJson = () => {
        downloadFile(JSON.stringify(clients, null, 2), 'clients.json', 'application/json');
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-11 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clients</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">View all clients and jump into their projects</p>
                    </div>
                </div>

                <button
                    onClick={openNewClientForm}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    <Plus className="size-4" /> Add Client
                </button>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total clients</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalClients}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total projects</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalProjects}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Ongoing</div>
                    <div className="text-2xl font-bold text-teal-600 mt-1">{stats.ongoing}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Download className="size-3.5" /> CSV
                    </button>
                    <button
                        onClick={handleExportJson}
                        className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Download className="size-3.5" /> JSON
                    </button>
                </div>
            </div>

            {/* Client list */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-teal-600" />
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    No clients yet. Add your first client to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {pagedClients.map(client => (
                        <div
                            key={client._id}
                            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="flex items-center justify-center size-10 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 font-semibold shrink-0">
                                        {initials(client.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{client.name}</p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                            {client.phone && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Phone className="size-3" /> {client.phone}
                                                </span>
                                            )}
                                            {client.email && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Mail className="size-3" /> {client.email}
                                                </span>
                                            )}
                                            {client.company && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Building2 className="size-3" /> {client.company}
                                                </span>
                                            )}
                                            {client.gstin && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Receipt className="size-3" /> {client.gstin}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => openEditClientForm(client)}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                                        title="Edit client"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClient(client)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                        title="Delete client"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <FolderKanban className="size-3.5" />
                                    {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                                    {client.projectCount === 0 && <span className="text-slate-400 dark:text-slate-500">&mdash; No projects yet</span>}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">Added {timeAgo(client.createdAt)}</span>
                                    <button
                                        onClick={() => openNewProjectForm(client)}
                                        className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                                    >
                                        <Plus className="size-3.5" /> New Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && clients.length > 0 && (
                <div className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, clients.length)} of {clients.length} clients
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

            {/* Add / Edit Client Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{editingClient ? 'Edit Client' : 'Add Client'}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {editingClient ? 'Update this client\'s details' : 'Add a new client to your workspace'}
                                </p>
                            </div>
                            <button onClick={() => { setIsFormOpen(false); setEditingClient(null); setFormErrors({}); }} className="text-slate-400 hover:text-red-500">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitClient} className="p-4 space-y-3 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Client Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: undefined }); }}
                                    placeholder="John Doe"
                                    maxLength={MAX_NAME_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => { setFormData({ ...formData, company: e.target.value }); setFormErrors({ ...formErrors, company: undefined }); }}
                                    placeholder="Company name"
                                    maxLength={MAX_COMPANY_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.company ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.company && <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                    Email <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: undefined }); }}
                                    placeholder="client@example.com"
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.email ? (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                                ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Used to send invoices and documents. Leave it blank if you don&apos;t have one — you can add it any time.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFormErrors({ ...formErrors, phone: undefined }); }}
                                    placeholder="+1 (555) 123-4567"
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                    GSTIN <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.gstin}
                                    onChange={(e) => { setFormData({ ...formData, gstin: e.target.value.toUpperCase() }); setFormErrors({ ...formErrors, gstin: undefined }); }}
                                    placeholder="27AAPFU0939F1ZV"
                                    maxLength={15}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 ${formErrors.gstin ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.gstin ? (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.gstin}</p>
                                ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        Only needed for Indian GST invoices. Leave blank if the client isn&apos;t registered.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Invoice Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    {CURRENCY_OPTIONS.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                    Invoices for this client will be shown in {formData.currency}.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Anything useful about this client..."
                                    rows={3}
                                    maxLength={MAX_NOTE_LEN}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsFormOpen(false); setEditingClient(null); setFormErrors({}); }}
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
                                    {editingClient ? 'Save Changes' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Project Modal */}
            {projectClient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-xl">
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">New Project</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">For {projectClient.name}</p>
                            </div>
                            <button onClick={() => setProjectClient(null)} className="text-slate-400 hover:text-red-500">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitProject} className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Project Title *</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    placeholder="e.g., Website Redesign"
                                    maxLength={150}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setProjectClient(null)}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingProject}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                                >
                                    {isSubmittingProject && <Loader2 className="size-4 animate-spin" />}
                                    Add Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
