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
import CompanySelect from './CompanySelect';

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
    company?: string;
    jobTitle?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    birthday?: string;
    note?: string;
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
    productInterest: [] as string[],
    tags: [] as string[],
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

const ACRONYMS = new Set(['VIP', 'CRM', 'USB', 'B2B', 'IT', 'VCF', 'CSV', 'API', 'UI', 'UX', 'AI', 'PC', 'MNC']);

const normalizeTag = (raw: string): string => {
    if (!raw) return '';
    const str = raw.trim();
    if (!str) return '';
    return str
        .split(/\s+/)
        .map(word => {
            const upper = word.toUpperCase();
            if (ACRONYMS.has(upper)) return upper;
            return word
                .split('-')
                .map(part => {
                    const partUpper = part.toUpperCase();
                    if (ACRONYMS.has(partUpper)) return partUpper;
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                })
                .join('-');
        })
        .join(' ');
};

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
    const [productInterestInput, setProductInterestInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isInterestFocused, setIsInterestFocused] = useState(false);
    const [isTagFocused, setIsTagFocused] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(25);

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
        const map = new Map<string, string>();
        contacts.forEach(c => {
            (c.productInterest || []).forEach(p => {
                const norm = normalizeTag(p);
                if (norm && !map.has(norm.toLowerCase())) {
                    map.set(norm.toLowerCase(), norm);
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    }, [contacts]);

    const allExistingTags = useMemo(() => {
        const map = new Map<string, string>();
        contacts.forEach(c => {
            (c.tags || []).forEach(t => {
                const norm = normalizeTag(t);
                if (norm && !map.has(norm.toLowerCase())) {
                    map.set(norm.toLowerCase(), norm);
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    }, [contacts]);

    const interestSuggestions = useMemo(() => {
        const q = productInterestInput.trim().toLowerCase();
        if (!q) return [];
        const selected = new Set(formData.productInterest.map(p => p.toLowerCase()));
        return uniqueProductInterests.filter(p => p.toLowerCase().includes(q) && !selected.has(p.toLowerCase()));
    }, [productInterestInput, uniqueProductInterests, formData.productInterest]);

    const tagSuggestions = useMemo(() => {
        const q = tagsInput.trim().toLowerCase();
        if (!q) return [];
        const selected = new Set(formData.tags.map(t => t.toLowerCase()));
        return allExistingTags.filter(t => t.toLowerCase().includes(q) && !selected.has(t.toLowerCase()));
    }, [tagsInput, allExistingTags, formData.tags]);

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
            const matchesProduct =
                productInterestFilter === 'All' ||
                (c.productInterest || []).some(p => p.trim().toLowerCase() === productInterestFilter.toLowerCase());
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

        const fName = data.firstName.trim();
        if (!fName) {
            errors.firstName = 'First name is required';
        } else if (fName.length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        } else if (fName.length > 60) {
            errors.firstName = 'First name cannot exceed 60 characters';
        }

        const lName = data.lastName.trim();
        if (!lName) {
            errors.lastName = 'Last name is required';
        } else if (lName.length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        } else if (lName.length > 60) {
            errors.lastName = 'Last name cannot exceed 60 characters';
        }

        const comp = data.company?.trim() || '';
        if (comp && comp.length < 2) {
            errors.company = 'Company name must be at least 2 characters';
        } else if (comp.length > 100) {
            errors.company = 'Company name cannot exceed 100 characters';
        }

        const jt = data.jobTitle?.trim() || '';
        if (jt && jt.length < 2) {
            errors.jobTitle = 'Job title must be at least 2 characters';
        } else if (jt.length > 80) {
            errors.jobTitle = 'Job title cannot exceed 80 characters';
        }

        if (data.street && data.street.trim().length > 150) {
            errors.street = 'Street cannot exceed 150 characters';
        }

        if (data.city && data.city.trim().length > 80) {
            errors.city = 'City cannot exceed 80 characters';
        }

        if (data.state && data.state.trim().length > 80) {
            errors.state = 'State cannot exceed 80 characters';
        }

        if (data.postalCode && data.postalCode.trim().length > 20) {
            errors.postalCode = 'Postal code cannot exceed 20 characters';
        }

        if (data.country && data.country.trim().length > 80) {
            errors.country = 'Country cannot exceed 80 characters';
        }

        const seenEmails = new Set<string>();
        let hasValidEmail = false;
        errors.emails = data.emails.map(e => {
            const val = e.value.trim().toLowerCase();
            if (!val) return null;
            if (!EMAIL_REGEX.test(val)) return 'Enter a valid email address';
            if (val.length < 5 || val.length > 100) return 'Email must be between 5 and 100 characters';
            if (seenEmails.has(val)) return 'Duplicate email address';
            seenEmails.add(val);
            hasValidEmail = true;
            return null;
        });
        if (!hasValidEmail) {
            errors.emailsGeneral = 'At least one valid email address is required';
        }

        const seenPhones = new Set<string>();
        let hasValidPhone = false;
        errors.phones = data.phones.map(p => {
            const val = p.value.trim();
            if (!val) return null;
            if (!PHONE_REGEX.test(val)) return 'Enter a valid phone number (7-20 characters)';
            const digitsOnly = val.replace(/\D/g, '');
            if (digitsOnly.length < 7 || digitsOnly.length > 15) return 'Phone must contain 7 to 15 digits';
            if (seenPhones.has(val)) return 'Duplicate phone number';
            seenPhones.add(val);
            hasValidPhone = true;
            return null;
        });
        if (!hasValidPhone) {
            errors.phonesGeneral = 'At least one valid phone number is required';
        }

        if (data.birthday) {
            const bday = new Date(data.birthday);
            if (isNaN(bday.getTime())) {
                errors.birthday = 'Invalid date';
            } else {
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                if (bday > today) {
                    errors.birthday = 'Birthday cannot be in the future';
                }
            }
        }

        if (data.note && data.note.trim().length > 2000) {
            errors.note = 'Note cannot exceed 2000 characters';
        }

        return errors;
    };

    const hasErrors = (errors: FormErrors): boolean =>
        Boolean(
            errors.firstName ||
            errors.lastName ||
            errors.company ||
            errors.jobTitle ||
            errors.street ||
            errors.city ||
            errors.state ||
            errors.postalCode ||
            errors.country ||
            errors.birthday ||
            errors.note ||
            errors.emailsGeneral ||
            errors.phonesGeneral
        ) ||
        errors.emails.some(Boolean) ||
        errors.phones.some(Boolean);

    const addProductInterestTag = (rawVal: string) => {
        const items = rawVal.split(',').map(s => s.trim()).filter(Boolean);
        if (items.length === 0) return;

        setFormData(prev => {
            const current = new Set(prev.productInterest.map(p => p.toLowerCase()));
            const next = [...prev.productInterest];
            for (const item of items) {
                const normalized = normalizeTag(item);
                if (normalized.length > 50) continue;
                if (normalized && !current.has(normalized.toLowerCase()) && next.length < 30) {
                    current.add(normalized.toLowerCase());
                    next.push(normalized);
                }
            }
            return { ...prev, productInterest: next };
        });
        setProductInterestInput('');
    };

    const removeProductInterestTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            productInterest: prev.productInterest.filter((_, i) => i !== index)
        }));
    };

    const addTag = (rawVal: string) => {
        const items = rawVal.split(',').map(s => s.trim()).filter(Boolean);
        if (items.length === 0) return;

        setFormData(prev => {
            const current = new Set(prev.tags.map(t => t.toLowerCase()));
            const next = [...prev.tags];
            for (const item of items) {
                const normalized = normalizeTag(item);
                if (normalized.length > 50) continue;
                if (normalized && !current.has(normalized.toLowerCase()) && next.length < 30) {
                    current.add(normalized.toLowerCase());
                    next.push(normalized);
                }
            }
            return { ...prev, tags: next };
        });
        setTagsInput('');
    };

    const removeTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please select a valid image file (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setPhotoError('Image size must be less than 5MB');
            return;
        }

        setPhotoError(null);
        setIsUploadingPhoto(true);

        try {
            const uploadData = new FormData();
            uploadData.append('photo', file);

            const { data } = await api.post('/contacts/upload-photo', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Clean up uncommitted previous photo uploaded in this session
            if (formData.photo && formData.photo !== editingContact?.photo) {
                try {
                    await api.post('/contacts/delete-photo', { photoUrl: formData.photo });
                } catch (err) {
                    console.warn('Failed to clean up uncommitted previous photo', err);
                }
            }

            setFormData(prev => ({ ...prev, photo: data.url }));
            showToast('Photo uploaded successfully', 'success');
        } catch (err: any) {
            console.error('Photo upload failed:', err);
            const msg = err.response?.data?.msg || 'Failed to upload photo';
            setPhotoError(msg);
            showToast(msg, 'error');
        } finally {
            setIsUploadingPhoto(false);
            if (photoInputRef.current) photoInputRef.current.value = '';
        }
    };

    const handleRemovePhoto = async () => {
        const photoToDelete = formData.photo;
        if (!photoToDelete) return;

        // If the photo was uploaded during this form session and not committed yet, delete from Cloudinary
        if (photoToDelete !== editingContact?.photo) {
            try {
                await api.post('/contacts/delete-photo', { photoUrl: photoToDelete });
            } catch (err) {
                console.warn('Failed to delete temp photo from Cloudinary', err);
            }
        }

        setFormData(prev => ({ ...prev, photo: '' }));
        setPhotoError(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    const handleCloseFormModal = async () => {
        if (formData.photo && formData.photo !== editingContact?.photo) {
            try {
                await api.post('/contacts/delete-photo', { photoUrl: formData.photo });
            } catch (err) {
                console.warn('Failed to clean up uncommitted photo', err);
            }
        }
        setIsFormModalOpen(false);
        setFormData(emptyFormData());
        setProductInterestInput('');
        setTagsInput('');
        setPhotoError(null);
    };

    const handleOpenCreateModal = () => {
        setEditingContact(null);
        setFormData(emptyFormData());
        setFormErrors(emptyErrors());
        setProductInterestInput('');
        setTagsInput('');
        setPhotoError(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            company: contact.company || '',
            jobTitle: contact.jobTitle || '',
            emails: contact.emails && contact.emails.length > 0 ? contact.emails.map(e => ({ ...e })) : [emptyEmail()],
            phones: contact.phones && contact.phones.length > 0 ? contact.phones.map(p => ({ ...p })) : [emptyPhone()],
            street: contact.address?.street || '',
            city: contact.address?.city || '',
            state: contact.address?.state || '',
            postalCode: contact.address?.postalCode || '',
            country: contact.address?.country || '',
            productInterest: Array.isArray(contact.productInterest) ? [...contact.productInterest] : [],
            tags: Array.isArray(contact.tags) ? [...contact.tags] : [],
            birthday: contact.birthday ? contact.birthday.slice(0, 10) : '',
            photo: contact.photo || '',
            note: contact.note || ''
        });
        setProductInterestInput('');
        setTagsInput('');
        setPhotoError(null);
        setFormErrors(emptyErrors());
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Process any uncommitted text in productInterestInput or tagsInput
        let currentInterests = [...formData.productInterest];
        if (productInterestInput.trim()) {
            const raw = productInterestInput.split(',').map(s => s.trim()).filter(Boolean);
            const set = new Set(currentInterests.map(p => p.toLowerCase()));
            for (const item of raw) {
                const normalized = normalizeTag(item);
                if (normalized && normalized.length <= 50 && !set.has(normalized.toLowerCase()) && currentInterests.length < 30) {
                    set.add(normalized.toLowerCase());
                    currentInterests.push(normalized);
                }
            }
        }

        let currentTags = [...formData.tags];
        if (tagsInput.trim()) {
            const raw = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
            const set = new Set(currentTags.map(t => t.toLowerCase()));
            for (const item of raw) {
                const normalized = normalizeTag(item);
                if (normalized && normalized.length <= 50 && !set.has(normalized.toLowerCase()) && currentTags.length < 30) {
                    set.add(normalized.toLowerCase());
                    currentTags.push(normalized);
                }
            }
        }

        const dataToValidate = {
            ...formData,
            productInterest: currentInterests,
            tags: currentTags
        };

        const errors = validateForm(dataToValidate);
        setFormErrors(errors);
        if (hasErrors(errors)) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                firstName: dataToValidate.firstName.trim(),
                lastName: dataToValidate.lastName.trim(),
                company: dataToValidate.company.trim(),
                jobTitle: dataToValidate.jobTitle.trim(),
                emails: dataToValidate.emails.filter(e => e.value.trim()).map(e => ({ label: e.label, value: e.value.trim() })),
                phones: dataToValidate.phones.filter(p => p.value.trim()).map(p => ({ label: p.label, value: p.value.trim() })),
                address: {
                    street: dataToValidate.street.trim(),
                    city: dataToValidate.city.trim(),
                    state: dataToValidate.state.trim(),
                    postalCode: dataToValidate.postalCode.trim(),
                    country: dataToValidate.country.trim()
                },
                productInterest: dataToValidate.productInterest,
                tags: dataToValidate.tags,
                birthday: dataToValidate.birthday || undefined,
                photo: dataToValidate.photo || undefined,
                note: dataToValidate.note.trim()
            };

            if (editingContact) {
                await api.put(`/contacts/${editingContact._id}`, payload);
                showToast('Contact updated successfully', 'success');
            } else {
                await api.post('/contacts', payload);
                showToast('Contact added successfully', 'success');
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

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
        setImportContent('');
        setImportFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                            <div className="flex items-center gap-3">
                                {viewingContact.photo ? (
                                    <img
                                        src={viewingContact.photo}
                                        alt={`${viewingContact.firstName} ${viewingContact.lastName || ''}`}
                                        className="size-11 rounded-full object-cover border-2 border-teal-500 shadow-xs shrink-0"
                                    />
                                ) : (
                                    <div className="size-11 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">
                                        {initials(viewingContact)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                                        {viewingContact.firstName} {viewingContact.lastName}
                                    </h3>
                                    {(viewingContact.company || viewingContact.jobTitle) && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {[viewingContact.jobTitle, viewingContact.company].filter(Boolean).join(' @ ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setViewingContact(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 text-sm">
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseFormModal}>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h3>
                            <button type="button" onClick={handleCloseFormModal} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* First Name & Last Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={60}
                                        placeholder="John"
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
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={60}
                                        placeholder="Doe"
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

                            {/* Company & Job Title */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                                    <CompanySelect
                                        value={formData.company}
                                        onChange={(companyName) => {
                                            setFormData(prev => ({ ...prev, company: companyName }));
                                            if (formErrors.company) setFormErrors(prev => ({ ...prev, company: undefined }));
                                        }}
                                        placeholder="Company"
                                        size="sm"
                                    />
                                    {formErrors.company && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.company}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        maxLength={80}
                                        placeholder="e.g. Procurement Manager"
                                        value={formData.jobTitle}
                                        onChange={(e) => {
                                            setFormData({ ...formData, jobTitle: e.target.value });
                                            if (formErrors.jobTitle) setFormErrors(prev => ({ ...prev, jobTitle: undefined }));
                                        }}
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 outline-none ${
                                            formErrors.jobTitle
                                                ? 'border-red-400 dark:border-red-600 focus:ring-red-500'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500'
                                        }`}
                                    />
                                    {formErrors.jobTitle && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.jobTitle}</p>
                                    )}
                                </div>
                            </div>

                            {/* Emails */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Emails <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">At least 1 valid email required</span>
                                </div>
                                {formErrors.emailsGeneral && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 mb-1.5">{formErrors.emailsGeneral}</p>
                                )}
                                <div className="space-y-2">
                                    {formData.emails.map((email, idx) => (
                                        <div key={idx}>
                                            <div className="flex gap-2">
                                                <select
                                                    value={email.label}
                                                    onChange={(e) => updateEmailRow(idx, 'label', e.target.value)}
                                                    className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none shrink-0"
                                                >
                                                    <option value="work">Work</option>
                                                    <option value="personal">Personal</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <input
                                                    type="email"
                                                    maxLength={100}
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
                                                    disabled={formData.emails.length <= 1}
                                                    onClick={() => {
                                                        if (formData.emails.length <= 1) return;
                                                        setFormData(p => ({ ...p, emails: p.emails.filter((_, i) => i !== idx) }));
                                                        setFormErrors(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== idx) }));
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg transition-colors"
                                                    title={formData.emails.length <= 1 ? "At least one email is required" : "Remove email"}
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            {formErrors.emails[idx] && (
                                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.emails[idx]}</p>
                                            )}
                                        </div>
                                    ))}
                                    {formData.emails.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, emails: [...p.emails, emptyEmail()] }))}
                                            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
                                        >
                                            <Plus className="size-3.5" /> Add email
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Phones */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Phones <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">At least 1 valid phone required (7-15 digits)</span>
                                </div>
                                {formErrors.phonesGeneral && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 mb-1.5">{formErrors.phonesGeneral}</p>
                                )}
                                <div className="space-y-2">
                                    {formData.phones.map((phone, idx) => (
                                        <div key={idx}>
                                            <div className="flex gap-2">
                                                <select
                                                    value={phone.label}
                                                    onChange={(e) => updatePhoneRow(idx, 'label', e.target.value)}
                                                    className="px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none shrink-0"
                                                >
                                                    <option value="mobile">Mobile</option>
                                                    <option value="work">Work</option>
                                                    <option value="home">Home</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <input
                                                    type="tel"
                                                    maxLength={20}
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
                                                    disabled={formData.phones.length <= 1}
                                                    onClick={() => {
                                                        if (formData.phones.length <= 1) return;
                                                        setFormData(p => ({ ...p, phones: p.phones.filter((_, i) => i !== idx) }));
                                                        setFormErrors(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg transition-colors"
                                                    title={formData.phones.length <= 1 ? "At least one phone is required" : "Remove phone"}
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            {formErrors.phones[idx] && (
                                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.phones[idx]}</p>
                                            )}
                                        </div>
                                    ))}
                                    {formData.phones.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, phones: [...p.phones, emptyPhone()] }))}
                                            className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1"
                                        >
                                            <Plus className="size-3.5" /> Add phone
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        maxLength={150}
                                        placeholder="Street address (max 150 chars)"
                                        value={formData.street}
                                        onChange={(e) => {
                                            setFormData({ ...formData, street: e.target.value });
                                            if (formErrors.street) setFormErrors(prev => ({ ...prev, street: undefined }));
                                        }}
                                        className="col-span-2 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    {formErrors.street && <p className="col-span-2 text-[11px] text-red-600 dark:text-red-400">{formErrors.street}</p>}

                                    <div>
                                        <input
                                            type="text"
                                            maxLength={80}
                                            placeholder="City (max 80)"
                                            value={formData.city}
                                            onChange={(e) => {
                                                setFormData({ ...formData, city: e.target.value });
                                                if (formErrors.city) setFormErrors(prev => ({ ...prev, city: undefined }));
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {formErrors.city && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.city}</p>}
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            maxLength={80}
                                            placeholder="State / Region (max 80)"
                                            value={formData.state}
                                            onChange={(e) => {
                                                setFormData({ ...formData, state: e.target.value });
                                                if (formErrors.state) setFormErrors(prev => ({ ...prev, state: undefined }));
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {formErrors.state && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.state}</p>}
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            maxLength={20}
                                            placeholder="Postal Code (max 20)"
                                            value={formData.postalCode}
                                            onChange={(e) => {
                                                setFormData({ ...formData, postalCode: e.target.value });
                                                if (formErrors.postalCode) setFormErrors(prev => ({ ...prev, postalCode: undefined }));
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {formErrors.postalCode && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.postalCode}</p>}
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            maxLength={80}
                                            placeholder="Country (max 80)"
                                            value={formData.country}
                                            onChange={(e) => {
                                                setFormData({ ...formData, country: e.target.value });
                                                if (formErrors.country) setFormErrors(prev => ({ ...prev, country: undefined }));
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {formErrors.country && <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.country}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Product Interest & Tags */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Product Interest
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={50}
                                            placeholder="Type and press Enter or comma (,)"
                                            value={productInterestInput}
                                            onFocus={() => setIsInterestFocused(true)}
                                            onBlur={() => {
                                                setIsInterestFocused(false);
                                                if (productInterestInput.trim()) {
                                                    addProductInterestTag(productInterestInput);
                                                }
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.includes(',')) {
                                                    addProductInterestTag(val);
                                                } else {
                                                    setProductInterestInput(val);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addProductInterestTag(productInterestInput);
                                                } else if (e.key === ',') {
                                                    e.preventDefault();
                                                    addProductInterestTag(productInterestInput);
                                                } else if (e.key === 'Backspace' && !productInterestInput && formData.productInterest.length > 0) {
                                                    removeProductInterestTag(formData.productInterest.length - 1);
                                                }
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        />

                                        {isInterestFocused && interestSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-44 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-700/60">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/40">
                                                    Suggestions
                                                </div>
                                                {interestSuggestions.slice(0, 6).map((suggestion, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            addProductInterestTag(suggestion);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 flex items-center justify-between transition-colors cursor-pointer"
                                                    >
                                                        <span>{suggestion}</span>
                                                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-900/50 px-1.5 py-0.5 rounded">
                                                            + Add
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                        Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">,</kbd> to add
                                    </span>
                                    {formData.productInterest.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto p-1.5 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                            {formData.productInterest.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-xs"
                                                >
                                                    <span>{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProductInterestTag(idx)}
                                                        className="p-0.5 hover:bg-teal-200/50 dark:hover:bg-teal-800/60 rounded text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Tags
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={50}
                                            placeholder="Type and press Enter or comma (,)"
                                            value={tagsInput}
                                            onFocus={() => setIsTagFocused(true)}
                                            onBlur={() => {
                                                setIsTagFocused(false);
                                                if (tagsInput.trim()) {
                                                    addTag(tagsInput);
                                                }
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.includes(',')) {
                                                    addTag(val);
                                                } else {
                                                    setTagsInput(val);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag(tagsInput);
                                                } else if (e.key === ',') {
                                                    e.preventDefault();
                                                    addTag(tagsInput);
                                                } else if (e.key === 'Backspace' && !tagsInput && formData.tags.length > 0) {
                                                    removeTag(formData.tags.length - 1);
                                                }
                                            }}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                        />

                                        {isTagFocused && tagSuggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-44 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-700/60">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/40">
                                                    Suggestions
                                                </div>
                                                {tagSuggestions.slice(0, 6).map((suggestion, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            addTag(suggestion);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-between transition-colors cursor-pointer"
                                                    >
                                                        <span>{suggestion}</span>
                                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                                                            + Add
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                                        Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">Enter</kbd> or <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[9px]">,</kbd> to add
                                    </span>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto p-1.5 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                            {formData.tags.map((item, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs"
                                                >
                                                    <span>{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(idx)}
                                                        className="p-0.5 hover:bg-indigo-200/50 dark:hover:bg-indigo-800/60 rounded text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Birthday & Photo Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-teal-500 ${
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
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Contact Photo
                                    </label>
                                    <input
                                        ref={photoInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    {formData.photo ? (
                                        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                                            <div className="relative size-12 rounded-full overflow-hidden border-2 border-teal-500 shrink-0 bg-slate-200 dark:bg-slate-700 shadow-xs">
                                                <img
                                                    src={formData.photo}
                                                    alt="Contact preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Photo uploaded</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => photoInputRef.current?.click()}
                                                        disabled={isUploadingPhoto}
                                                        className="px-2.5 py-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {isUploadingPhoto ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                                                        Change
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemovePhoto}
                                                        disabled={isUploadingPhoto}
                                                        className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="size-3" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => !isUploadingPhoto && photoInputRef.current?.click()}
                                            className={`border-2 border-dashed rounded-xl p-2.5 flex items-center justify-center gap-3 cursor-pointer transition-colors ${
                                                photoError
                                                    ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                                                    : 'border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/50'
                                            }`}
                                        >
                                            <div className="size-9 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                                                {isUploadingPhoto ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                                            </div>
                                            <div className="text-left">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                                    {isUploadingPhoto ? 'Uploading to Cloudinary...' : 'Upload Contact Photo'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                    JPG, PNG, or WebP (max 5MB)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {photoError && (
                                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{photoError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Admin Note */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                        <AlertCircle className="size-3.5" /> Admin Note (private — never shown to non-admins)
                                    </label>
                                    <span className={`text-[10px] font-mono ${formData.note.length > 2000 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {formData.note.length} / 2000
                                    </span>
                                </div>
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    value={formData.note}
                                    onChange={(e) => {
                                        setFormData({ ...formData, note: e.target.value });
                                        if (formErrors.note) setFormErrors(prev => ({ ...prev, note: undefined }));
                                    }}
                                    placeholder="Internal notes about this contact..."
                                    className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none ${
                                        formErrors.note ? 'border-red-400 dark:border-red-600' : 'border-amber-200 dark:border-amber-800/60'
                                    }`}
                                />
                                {formErrors.note && (
                                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.note}</p>
                                )}
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800">
                            <button
                                type="button"
                                onClick={handleCloseFormModal}
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseImportModal}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Import Contacts</h3>
                            <button onClick={handleCloseImportModal} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
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
                                onClick={handleCloseImportModal}
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
