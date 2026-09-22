"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Target,
    Plus,
    Search,
    Loader2,
    MoreHorizontal,
    Trophy,
    XCircle,
    Trash2,
    Pencil,
    Building2,
    IndianRupee,
    X,
    Settings2,
    ChevronUp,
    ChevronDown,
    MapPin,
    Calendar,
    User as UserIcon,
    Phone,
    LayoutGrid,
    Users,
    ChevronRight,
    UserCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/app/_context/ToastContext';
import { useConfirm } from '@/app/_context/ConfirmContext';

interface LeadStage {
    _id: string;
    name: string;
    color: string;
    order: number;
    isWon: boolean;
    isLost: boolean;
}

interface AssignedUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
}

interface Lead {
    _id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    value: number;
    stage: string;
    source?: string;
    location?: string;
    assignedTo?: AssignedUser | string | null;
    followUpDate?: string;
    note?: string;
    convertedClient?: string | null;
    convertedContact?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface LeadStats {
    open: number;
    pipeline: number;
    wonThisMonth: number;
    winRate: number;
}

interface StaffUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    role: string;
}

const STAGE_COLOR_PRESETS = ['#3b82f6', '#a855f7', '#f59e0b', '#22c55e', '#10b981', '#f43f5e', '#06b6d4', '#94a3b8'];

const SOURCE_OPTIONS = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Email Campaign', 'Trade Show', 'Other'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const MAX_NAME_LEN = 100;
const MAX_COMPANY_LEN = 100;
const MAX_LOCATION_LEN = 150;
const MAX_VALUE = 999999999;
const MAX_NOTE_LEN = 2000;
const MAX_STAGE_NAME_LEN = 40;

interface LeadFormErrors {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    location?: string;
    value?: string;
    stage?: string;
    followUpDate?: string;
    note?: string;
}

const emptyFormData = () => ({
    name: '',
    company: '',
    phone: '',
    email: '',
    location: '',
    source: 'Other',
    value: '',
    stage: '',
    assignedTo: '',
    followUpDate: '',
    followUpTime: '',
    note: '',
});

const formatCurrency = (n: number) => `₹${(n || 0).toLocaleString('en-IN')}`;

const staffLabel = (u: AssignedUser) =>
    u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown';

const initialsFor = (label: string) =>
    label
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('') || '?';

export default function LeadsView() {
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [leads, setLeads] = useState<Lead[]>([]);
    const [stages, setStages] = useState<LeadStage[]>([]);
    const [stats, setStats] = useState<LeadStats>({ open: 0, pipeline: 0, wonThisMonth: 0, winRate: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(emptyFormData());
    const [formErrors, setFormErrors] = useState<LeadFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const [isStagesOpen, setIsStagesOpen] = useState(false);
    const [stageDrafts, setStageDrafts] = useState<LeadStage[]>([]);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState(STAGE_COLOR_PRESETS[0]);
    const [savingStages, setSavingStages] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ top: number; bottom: number; right: number } | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    const closeLeadMenu = () => { setOpenMenuId(null); setMenuAnchor(null); setMenuPosition(null); };

    useEffect(() => {
        if (!openMenuId) return;
        const handleScroll = (e: Event) => {
            if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) return;
            closeLeadMenu();
        };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', closeLeadMenu);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', closeLeadMenu);
        };
    }, [openMenuId]);

    useLayoutEffect(() => {
        if (!openMenuId || !menuAnchor) return;
        const margin = 8;
        const width = menuRef.current?.offsetWidth ?? 176;
        const height = menuRef.current?.offsetHeight ?? 0;
        let left = menuAnchor.right - width;
        left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
        let top = menuAnchor.bottom + 4;
        if (top + height > window.innerHeight - margin) {
            top = menuAnchor.top - height - 4;
        }
        top = Math.max(margin, top);
        setMenuPosition({ top, left });
    }, [openMenuId, menuAnchor]);

    const [staffList, setStaffList] = useState<StaffUser[]>([]);
    const [locatingCurrent, setLocatingCurrent] = useState(false);

    const [viewMode, setViewMode] = useState<'board' | 'person'>('board');
    const [personFilter, setPersonFilter] = useState<string>('everyone');
    const [collapsedPersons, setCollapsedPersons] = useState<Set<string>>(new Set());

    const togglePersonCollapsed = (id: string) => {
        setCollapsedPersons(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const fetchStaff = async () => {
        try {
            const res = await api.get('/admin/users');
            setStaffList((res.data || []).filter((u: StaffUser) => u.role !== 'user'));
        } catch (err) {
            console.error('Error fetching staff for assignment:', err);
        }
    };

    const fetchAll = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [leadsRes, stagesRes, statsRes] = await Promise.all([
                api.get('leads', { params: searchQuery ? { search: searchQuery } : {} }),
                api.get('lead-stages'),
                api.get('leads/stats'),
            ]);
            setLeads(leadsRes.data);
            setStages(stagesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching leads data:', err);
            showToast('Failed to load leads', 'error');
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
        fetchStaff();
    }, []);

    const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);
    const boardStages = useMemo(() => sortedStages.filter(s => !s.isWon && !s.isLost), [sortedStages]);

    const boardLeads = useMemo(
        () => leads.filter(l => boardStages.some(s => s._id === l.stage)),
        [leads, boardStages]
    );

    const leadsByStage = (stageId: string) => boardLeads.filter(l => l.stage === stageId);

    const stageMap = useMemo(() => new Map(stages.map(s => [s._id, s])), [stages]);

    const resolvePerson = (lead: Lead): { id: string; label: string } => {
        if (lead.assignedTo && typeof lead.assignedTo === 'object') {
            return { id: lead.assignedTo._id, label: staffLabel(lead.assignedTo) };
        }
        if (lead.assignedTo) {
            const staff = staffList.find(s => s._id === lead.assignedTo);
            return { id: lead.assignedTo as string, label: staff ? staffLabel(staff) : 'Unknown' };
        }
        return { id: 'unassigned', label: 'Unassigned' };
    };

    const personGroups = useMemo(() => {
        const map = new Map<string, { id: string; label: string; leads: Lead[] }>();
        leads.forEach(lead => {
            const { id, label } = resolvePerson(lead);
            if (!map.has(id)) map.set(id, { id, label, leads: [] });
            map.get(id)!.leads.push(lead);
        });
        return Array.from(map.values()).sort((a, b) => {
            if (a.id === 'unassigned') return 1;
            if (b.id === 'unassigned') return -1;
            return a.label.localeCompare(b.label);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leads, staffList]);

    const personGroupStats = (groupLeads: Lead[]) => {
        let open = 0;
        let pipeline = 0;
        let won = 0;
        groupLeads.forEach(l => {
            const stage = stageMap.get(l.stage);
            if (stage?.isWon) won += 1;
            else if (!stage?.isLost) {
                open += 1;
                pipeline += l.value || 0;
            }
        });
        return { open, pipeline, won };
    };

    const visiblePersonGroups = useMemo(
        () => (personFilter === 'everyone' ? personGroups : personGroups.filter(g => g.id === personFilter)),
        [personGroups, personFilter]
    );

    const openNewLeadForm = () => {
        setEditingLead(null);
        setFormData({ ...emptyFormData(), stage: boardStages[0]?._id || '' });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const openEditLeadForm = (lead: Lead) => {
        setOpenMenuId(null);
        setEditingLead(lead);
        const followUp = lead.followUpDate ? new Date(lead.followUpDate) : null;
        const pad = (n: number) => String(n).padStart(2, '0');
        setFormData({
            name: lead.name || '',
            company: lead.company || '',
            phone: lead.phone || '',
            email: lead.email || '',
            location: lead.location || '',
            source: lead.source || 'Other',
            value: lead.value ? String(lead.value) : '',
            stage: lead.stage || '',
            assignedTo: typeof lead.assignedTo === 'object' && lead.assignedTo ? lead.assignedTo._id : (lead.assignedTo || ''),
            followUpDate: followUp ? `${followUp.getFullYear()}-${pad(followUp.getMonth() + 1)}-${pad(followUp.getDate())}` : '',
            followUpTime: followUp ? `${pad(followUp.getHours())}:${pad(followUp.getMinutes())}` : '',
            note: lead.note || '',
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const validateLeadForm = (): boolean => {
        const errors: LeadFormErrors = {};

        const name = formData.name.trim();
        if (!name) {
            errors.name = 'Contact name is required';
        } else if (name.length > MAX_NAME_LEN) {
            errors.name = `Name must be under ${MAX_NAME_LEN} characters`;
        }

        if (formData.company.trim().length > MAX_COMPANY_LEN) {
            errors.company = `Company must be under ${MAX_COMPANY_LEN} characters`;
        }

        if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }

        if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
            errors.phone = 'Enter a valid phone number';
        }

        if (formData.location.trim().length > MAX_LOCATION_LEN) {
            errors.location = `Location must be under ${MAX_LOCATION_LEN} characters`;
        }

        if (formData.value !== '') {
            const numericValue = Number(formData.value);
            if (Number.isNaN(numericValue) || numericValue < 0) {
                errors.value = 'Value must be a positive number';
            } else if (numericValue > MAX_VALUE) {
                errors.value = 'Value is too large';
            }
        }

        if (!formData.stage) {
            errors.stage = 'Select a stage';
        }

        if (formData.followUpTime && !formData.followUpDate) {
            errors.followUpDate = 'Pick a date for the follow-up time';
        }

        if (formData.note.length > MAX_NOTE_LEN) {
            errors.note = `Notes must be under ${MAX_NOTE_LEN} characters`;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLeadForm()) {
            showToast('Please fix the highlighted fields', 'error');
            return;
        }
        try {
            setIsSubmitting(true);
            const followUpDate = formData.followUpDate
                ? new Date(`${formData.followUpDate}T${formData.followUpTime || '09:00'}`).toISOString()
                : '';
            const { followUpTime, ...rest } = formData;
            const payload = {
                ...rest,
                name: formData.name.trim(),
                company: formData.company.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                value: Number(formData.value) || 0,
                followUpDate,
            };
            if (editingLead) {
                await api.put(`leads/${editingLead._id}`, payload);
                showToast('Lead updated', 'success');
            } else {
                await api.post('leads', payload);
                showToast('Lead created', 'success');
            }
            setIsFormOpen(false);
            setEditingLead(null);
            setFormData(emptyFormData());
            setFormErrors({});
            fetchAll();
        } catch (err: any) {
            console.error('Error saving lead:', err);
            showToast(err?.response?.data?.msg || 'Failed to save lead', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported in this browser', 'error');
            return;
        }
        setLocatingCurrent(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await res.json();
                    const city = data.city || data.locality || '';
                    const country = data.countryName || '';
                    const label = [city, country].filter(Boolean).join(', ');
                    setFormData(prev => ({ ...prev, location: label || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
                } catch (err) {
                    console.error('Error reverse geocoding location:', err);
                    showToast('Could not resolve your location', 'error');
                } finally {
                    setLocatingCurrent(false);
                }
            },
            () => {
                showToast('Location permission denied', 'error');
                setLocatingCurrent(false);
            }
        );
    };

    const updateLeadStage = async (id: string, stage: string) => {
        setLeads(prev => prev.map(l => (l._id === id ? { ...l, stage } : l)));
        setOpenMenuId(null);
        try {
            await api.put(`leads/${id}`, { stage });
            fetchAll(true);
        } catch (err) {
            console.error('Error updating lead:', err);
            showToast('Failed to update lead', 'error');
            fetchAll(true);
        }
    };

    const handleDeleteLead = async (id: string) => {
        setOpenMenuId(null);
        const ok = await confirm({
            title: 'Delete Lead',
            message: 'Are you sure you want to delete this lead? This cannot be undone.',
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`leads/${id}`);
            showToast('Lead deleted', 'success');
            fetchAll(true);
        } catch (err) {
            console.error('Error deleting lead:', err);
            showToast('Failed to delete lead', 'error');
        }
    };

    const [convertingId, setConvertingId] = useState<string | null>(null);

    const handleConvertLead = async (lead: Lead) => {
        const ok = await confirm({
            title: 'Convert to Client',
            message: `Convert "${lead.name}" into a Client and add them to Contacts?`,
            confirmLabel: 'Convert',
        });
        if (!ok) return;
        setConvertingId(lead._id);
        try {
            const { data } = await api.post(`leads/${lead._id}/convert`);
            setLeads(prev => prev.map(l => (l._id === lead._id ? { ...l, convertedClient: data.client?._id, convertedContact: data.contact?._id } : l)));
            showToast('Lead converted to Client & Contact', 'success');
        } catch (err: any) {
            console.error('Error converting lead:', err);
            showToast(err?.response?.data?.msg || 'Failed to convert lead', 'error');
        } finally {
            setConvertingId(null);
        }
    };

    const handleDrop = (stageId: string) => {
        setDragOverStage(null);
        if (draggingId) {
            const lead = leads.find(l => l._id === draggingId);
            if (lead && lead.stage !== stageId) {
                updateLeadStage(draggingId, stageId);
            }
        }
        setDraggingId(null);
    };

    // ---- Manage Pipeline Stages modal ----

    const openStagesModal = () => {
        setStageDrafts(sortedStages.map(s => ({ ...s })));
        setNewStageName('');
        setNewStageColor(STAGE_COLOR_PRESETS[0]);
        setIsStagesOpen(true);
    };

    const moveStageDraft = (index: number, dir: -1 | 1) => {
        setStageDrafts(prev => {
            const next = [...prev];
            const swapWith = index + dir;
            if (swapWith < 0 || swapWith >= next.length) return prev;
            [next[index], next[swapWith]] = [next[swapWith], next[index]];
            return next;
        });
    };

    const renameStageDraft = (index: number, name: string) => {
        setStageDrafts(prev => prev.map((s, i) => (i === index ? { ...s, name } : s)));
    };

    const recolorStageDraft = (index: number, color: string) => {
        setStageDrafts(prev => prev.map((s, i) => (i === index ? { ...s, color } : s)));
    };

    const deleteStageDraft = async (stage: LeadStage) => {
        if (stageDrafts.length <= 1) {
            showToast('At least one stage must remain', 'error');
            return;
        }
        const ok = await confirm({
            title: 'Delete Stage',
            message: `Delete "${stage.name}"? Leads in this stage will move to the earliest remaining stage.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!ok) return;
        try {
            await api.delete(`lead-stages/${stage._id}`);
            setStageDrafts(prev => prev.filter(s => s._id !== stage._id));
            fetchAll();
            showToast('Stage deleted', 'success');
        } catch (err) {
            console.error('Error deleting stage:', err);
            showToast('Failed to delete stage', 'error');
        }
    };

    const handleAddStage = async () => {
        const trimmedName = newStageName.trim();
        if (!trimmedName) {
            showToast('Stage name is required', 'error');
            return;
        }
        if (trimmedName.length > MAX_STAGE_NAME_LEN) {
            showToast(`Stage name must be under ${MAX_STAGE_NAME_LEN} characters`, 'error');
            return;
        }
        if (stageDrafts.some(s => s.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
            showToast('A stage with this name already exists', 'error');
            return;
        }
        try {
            const res = await api.post('lead-stages', { name: trimmedName, color: newStageColor });
            setStageDrafts(prev => [...prev, res.data]);
            setNewStageName('');
            setNewStageColor(STAGE_COLOR_PRESETS[0]);
        } catch (err) {
            console.error('Error adding stage:', err);
            showToast('Failed to add stage', 'error');
        }
    };

    const handleSaveStages = async () => {
        const trimmedNames = stageDrafts.map(s => s.name.trim());
        if (trimmedNames.some(n => !n)) {
            showToast('Stage names cannot be empty', 'error');
            return;
        }
        if (trimmedNames.some(n => n.length > MAX_STAGE_NAME_LEN)) {
            showToast(`Stage names must be under ${MAX_STAGE_NAME_LEN} characters`, 'error');
            return;
        }
        const lowerNames = trimmedNames.map(n => n.toLowerCase());
        if (new Set(lowerNames).size !== lowerNames.length) {
            showToast('Stage names must be unique', 'error');
            return;
        }
        try {
            setSavingStages(true);
            await Promise.all(
                stageDrafts.map(s => {
                    const trimmedName = s.name.trim();
                    const original = stages.find(o => o._id === s._id);
                    if (original && (original.name !== trimmedName || original.color !== s.color)) {
                        return api.put(`lead-stages/${s._id}`, { name: trimmedName, color: s.color });
                    }
                    return Promise.resolve();
                })
            );
            const orderedIds = stageDrafts.map(s => s._id);
            const originalOrderedIds = sortedStages.map(s => s._id);
            if (JSON.stringify(orderedIds) !== JSON.stringify(originalOrderedIds)) {
                await api.put('lead-stages/reorder', { orderedIds });
            }
            showToast('Pipeline stages updated', 'success');
            setIsStagesOpen(false);
            fetchAll();
        } catch (err) {
            console.error('Error saving stages:', err);
            showToast('Failed to save stages', 'error');
        } finally {
            setSavingStages(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-11 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600">
                        <Target className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leads</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your sales pipeline</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[76px]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Open</div>
                        <div className="font-bold text-slate-900 dark:text-white">{stats.open}</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[90px]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Pipeline</div>
                        <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(stats.pipeline)}</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[80px]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Won / mo</div>
                        <div className="font-bold text-slate-900 dark:text-white">{stats.wonThisMonth}</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[80px]">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Win rate</div>
                        <div className="font-bold text-slate-900 dark:text-white">{stats.winRate}%</div>
                    </div>

                    <button
                        onClick={openStagesModal}
                        className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Settings2 className="size-4" /> Stages
                    </button>

                    <button
                        onClick={openNewLeadForm}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        <Plus className="size-4" /> New Lead
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 shrink-0">
                        <button
                            type="button"
                            onClick={() => setViewMode('board')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'board'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <LayoutGrid className="size-3.5" /> Board
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('person')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'person'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <Users className="size-3.5" /> By person
                        </button>
                    </div>
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search leads..."
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Active leads {boardLeads.length}
                </div>
            </div>

            {/* Person filter chips */}
            {!loading && viewMode === 'person' && (
                <div className="shrink-0 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPersonFilter('everyone')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${personFilter === 'everyone'
                            ? 'border-teal-400 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-600'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        Everyone
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10">{leads.length}</span>
                    </button>
                    {personGroups.map(g => (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => setPersonFilter(g.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${personFilter === g.id
                                ? 'border-teal-400 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-600'
                                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {g.label}
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-white/10">{g.leads.length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Board / By person */}
            <div className="flex-1 min-h-0">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-teal-600" />
                </div>
            ) : viewMode === 'person' ? (
                <div className="h-full space-y-4 overflow-y-auto pr-1 -mr-1">
                    {visiblePersonGroups.length === 0 ? (
                        <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            No leads found
                        </div>
                    ) : (
                        visiblePersonGroups.map(group => {
                            const { open, pipeline, won } = personGroupStats(group.leads);
                            const collapsed = collapsedPersons.has(group.id);
                            const stagesWithLeads = sortedStages
                                .map(stage => ({ stage, leads: group.leads.filter(l => l.stage === stage._id) }))
                                .filter(s => s.leads.length > 0);
                            return (
                                <div key={group.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => togglePersonCollapsed(group.id)}
                                        className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            {collapsed ? (
                                                <ChevronRight className="size-4 text-slate-400 shrink-0" />
                                            ) : (
                                                <ChevronDown className="size-4 text-slate-400 shrink-0" />
                                            )}
                                            <div className="flex items-center justify-center size-9 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold shrink-0">
                                                {initialsFor(group.label)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white">{group.label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {group.leads.length} lead{group.leads.length === 1 ? '' : 's'} · {open} open · {won} won
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[64px]">
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Open</div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{open}</div>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[80px]">
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Pipeline</div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{formatCurrency(pipeline)}</div>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-center min-w-[64px]">
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Won</div>
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{won}</div>
                                            </div>
                                        </div>
                                    </button>

                                    {!collapsed && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 p-4 space-y-4">
                                            {stagesWithLeads.map(({ stage, leads: stageLeads }) => (
                                                <div key={stage._id}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{stage.name}</span>
                                                        <span className="text-xs text-slate-400">{stageLeads.length}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {stageLeads.map(lead => (
                                                            <div
                                                                key={lead._id}
                                                                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-sm text-slate-900 dark:text-white">{lead.name}</p>
                                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                        {lead.company && (
                                                                            <span className="flex items-center gap-1"><Building2 className="size-3" /> {lead.company}</span>
                                                                        )}
                                                                        {lead.phone && (
                                                                            <span className="flex items-center gap-1"><Phone className="size-3" /> {lead.phone}</span>
                                                                        )}
                                                                        {lead.location && (
                                                                            <span className="flex items-center gap-1"><MapPin className="size-3" /> {lead.location}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {lead.value > 0 && (
                                                                    <p className="font-semibold text-sm text-teal-600 dark:text-teal-400">{formatCurrency(lead.value)}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="flex h-full flex-nowrap items-stretch gap-4 overflow-x-auto pb-2">
                    {boardStages.map(col => {
                        const colLeads = leadsByStage(col._id);
                        return (
                            <div
                                key={col._id}
                                onDragOver={(e) => { e.preventDefault(); setDragOverStage(col._id); }}
                                onDragLeave={() => setDragOverStage(prev => (prev === col._id ? null : prev))}
                                onDrop={(e) => { e.preventDefault(); handleDrop(col._id); }}
                                className={`flex flex-col rounded-xl border p-3 h-full w-72 shrink-0 transition-colors ${dragOverStage === col._id
                                    ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/10'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{col.name}</span>
                                        <span className="text-xs text-slate-400">{colLeads.length}</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2 overflow-y-auto pr-1 -mr-1">
                                    {colLeads.length === 0 ? (
                                        <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
                                            No leads
                                        </div>
                                    ) : (
                                        colLeads.map(lead => (
                                            <div
                                                key={lead._id}
                                                draggable
                                                onDragStart={() => setDraggingId(lead._id)}
                                                onDragEnd={() => setDraggingId(null)}
                                                className={`relative p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing ${draggingId === lead._id ? 'opacity-50' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm text-slate-900 dark:text-white break-words">{lead.name}</p>
                                                    <button
                                                        onClick={(e) => {
                                                            if (openMenuId === lead._id) {
                                                                closeLeadMenu();
                                                            } else {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setMenuAnchor({ top: rect.top, bottom: rect.bottom, right: rect.right });
                                                                setMenuPosition({ top: rect.bottom + 4, left: rect.right - 176 });
                                                                setOpenMenuId(lead._id);
                                                            }
                                                        }}
                                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </button>
                                                </div>
                                                {lead.company && (
                                                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <Building2 className="size-3" /> {lead.company}
                                                    </p>
                                                )}
                                                {lead.value > 0 && (
                                                    <p className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
                                                        <IndianRupee className="size-3" /> {lead.value.toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                                {lead.followUpDate && (
                                                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <Calendar className="size-3" />
                                                        {new Date(lead.followUpDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                                {lead.assignedTo && typeof lead.assignedTo === 'object' && (
                                                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        <UserIcon className="size-3" /> {staffLabel(lead.assignedTo)}
                                                    </p>
                                                )}
                                                {(lead.convertedClient || lead.convertedContact) && (
                                                    <p className={`flex items-center gap-1 text-xs font-semibold mt-1 ${lead.convertedClient && lead.convertedContact ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                        <UserCheck className="size-3" />
                                                        {lead.convertedClient && lead.convertedContact ? 'Converted to Client' : 'Partially converted'}
                                                    </p>
                                                )}

                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>

            {/* Lead card action menu (portal to escape column scroll clipping) */}
            {openMenuId && menuPosition && typeof document !== 'undefined' && createPortal(
                (() => {
                    const lead = leads.find(l => l._id === openMenuId);
                    if (!lead) return null;
                    return (
                        <>
                            <div className="fixed inset-0 z-40" onClick={closeLeadMenu} />
                            <div
                                ref={menuRef}
                                className="fixed z-50 w-44 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1 text-sm max-h-72 overflow-y-auto"
                                style={{ top: menuPosition.top, left: menuPosition.left }}
                            >
                                {sortedStages.filter(s => s._id !== lead.stage).map(s => (
                                    <button
                                        key={s._id}
                                        onClick={() => { updateLeadStage(lead._id, s._id); closeLeadMenu(); }}
                                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                                    >
                                        {s.isWon ? (
                                            <Trophy className="size-3.5 text-emerald-600" />
                                        ) : s.isLost ? (
                                            <XCircle className="size-3.5 text-amber-600" />
                                        ) : (
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                        )}
                                        Move to {s.name}
                                    </button>
                                ))}
                                <div className="my-1 border-t border-slate-100 dark:border-slate-600" />
                                {!(lead.convertedClient && lead.convertedContact) && (
                                    <button
                                        disabled={convertingId === lead._id}
                                        onClick={() => { closeLeadMenu(); handleConvertLead(lead); }}
                                        className="w-full flex items-center gap-2 text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-teal-700 dark:text-teal-400 disabled:opacity-50"
                                    >
                                        <UserCheck className="size-3.5" />
                                        {lead.convertedClient || lead.convertedContact ? 'Finish Conversion' : 'Convert to Client'}
                                    </button>
                                )}
                                <button
                                    onClick={() => { openEditLeadForm(lead); closeLeadMenu(); }}
                                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                                >
                                    <Pencil className="size-3.5" /> Edit
                                </button>
                                <button
                                    onClick={() => { handleDeleteLead(lead._id); closeLeadMenu(); }}
                                    className="w-full flex items-center gap-2 text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 text-red-600"
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </button>
                            </div>
                        </>
                    );
                })(),
                document.body
            )}

            {/* New Lead Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{editingLead ? 'Edit Lead' : 'New Lead'}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {editingLead ? 'Update this prospect\'s details' : 'Add a prospect to your pipeline'}
                                </p>
                            </div>
                            <button onClick={() => { setIsFormOpen(false); setEditingLead(null); setFormErrors({}); }} className="text-slate-400 hover:text-red-500">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitLead} className="p-4 space-y-3 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Contact Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors({ ...formErrors, name: undefined }); }}
                                    placeholder="e.g., Jane Doe"
                                    maxLength={MAX_NAME_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
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
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFormErrors({ ...formErrors, phone: undefined }); }}
                                        placeholder="Phone"
                                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                    />
                                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: undefined }); }}
                                        placeholder="email@example.com"
                                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                    />
                                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Location</label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors({ ...formErrors, location: undefined }); }}
                                            placeholder="City, country"
                                            maxLength={MAX_LOCATION_LEN}
                                            className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.location ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleUseCurrentLocation}
                                            disabled={locatingCurrent}
                                            title="Use current location"
                                            className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 shrink-0"
                                        >
                                            {locatingCurrent ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />}
                                            Current
                                        </button>
                                    </div>
                                    {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Source</label>
                                    <select
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {SOURCE_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Estimated Value</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e) => { setFormData({ ...formData, value: e.target.value }); setFormErrors({ ...formErrors, value: undefined }); }}
                                        placeholder="0.00"
                                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.value ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                    />
                                    {formErrors.value && <p className="text-xs text-red-500 mt-1">{formErrors.value}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Stage</label>
                                    <select
                                        value={formData.stage}
                                        onChange={(e) => { setFormData({ ...formData, stage: e.target.value }); setFormErrors({ ...formErrors, stage: undefined }); }}
                                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.stage ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                    >
                                        <option value="" disabled>Select a stage</option>
                                        {sortedStages.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.stage && <p className="text-xs text-red-500 mt-1">{formErrors.stage}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Assign To</label>
                                    <select
                                        value={formData.assignedTo}
                                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {staffList.map(u => (
                                            <option key={u._id} value={u._id}>{staffLabel(u)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Follow-up Date</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        value={formData.followUpDate}
                                        onChange={(e) => { setFormData({ ...formData, followUpDate: e.target.value }); setFormErrors({ ...formErrors, followUpDate: undefined }); }}
                                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${formErrors.followUpDate ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                    />
                                    <input
                                        type="time"
                                        value={formData.followUpTime}
                                        onChange={(e) => { setFormData({ ...formData, followUpTime: e.target.value }); setFormErrors({ ...formErrors, followUpDate: undefined }); }}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                {formErrors.followUpDate && <p className="text-xs text-red-500 mt-1">{formErrors.followUpDate}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => { setFormData({ ...formData, note: e.target.value }); setFormErrors({ ...formErrors, note: undefined }); }}
                                    placeholder="Anything useful about this lead..."
                                    rows={3}
                                    maxLength={MAX_NOTE_LEN}
                                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 resize-y ${formErrors.note ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-600 focus:ring-teal-500'}`}
                                />
                                {formErrors.note && <p className="text-xs text-red-500 mt-1">{formErrors.note}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsFormOpen(false); setEditingLead(null); setFormErrors({}); }}
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
                                    {editingLead ? 'Save Changes' : 'Add Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Pipeline Stages Modal */}
            {isStagesOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-xl max-h-[85vh] flex flex-col">
                        <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Manage Pipeline Stages</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add, rename, recolor, reorder or remove stages.</p>
                            </div>
                            <button onClick={() => setIsStagesOpen(false)} className="text-slate-400 hover:text-red-500">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-2 overflow-y-auto">
                            {stageDrafts.map((stage, index) => (
                                <div key={stage._id} className="flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() => moveStageDraft(index, -1)}
                                            disabled={index === 0}
                                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronUp className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveStageDraft(index, 1)}
                                            disabled={index === stageDrafts.length - 1}
                                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
                                        >
                                            <ChevronDown className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="color"
                                            value={stage.color}
                                            onChange={(e) => recolorStageDraft(index, e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title="Change color"
                                        />
                                        <span
                                            className="block size-6 rounded-full border border-slate-200 dark:border-slate-600"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        value={stage.name}
                                        onChange={(e) => renameStageDraft(index, e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />

                                    {(stage.isWon || stage.isLost) && (
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">
                                            {stage.isWon ? 'Won' : 'Lost'}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => deleteStageDraft(stage)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                {STAGE_COLOR_PRESETS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setNewStageColor(c)}
                                        className={`size-6 rounded-full border-2 ${newStageColor === c ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                                <input
                                    type="text"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Stage name (e.g., Negotiation)"
                                    className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddStage}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg"
                                >
                                    <Plus className="size-4" /> Add
                                </button>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsStagesOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveStages}
                                    disabled={savingStages}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                                >
                                    {savingStages && <Loader2 className="size-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
