"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Calendar, Clock, Send, Eye, Edit3, Trash2, Plus, RefreshCw,
    CheckCircle2, AlertCircle, XCircle, Users, Code, Layout, Sparkles,
    Check, ArrowRight, Zap, FileText, SendHorizontal, Info, Search
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "../../_context/ToastContext";

interface EmailTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    subject: string;
    previewText: string;
    badge: string;
    html: string;
}

interface ScheduledEmailItem {
    _id: string;
    title: string;
    subject: string;
    recipientType: "all_users" | "custom";
    customRecipients?: string[];
    templateId?: string;
    htmlContent: string;
    scheduledAt: string;
    status: "pending" | "sent" | "failed" | "cancelled";
    sentAt?: string;
    sentCount: number;
    failedCount: number;
    errorMessage?: string;
    createdBy?: {
        name?: string;
        email?: string;
    };
    createdAt: string;
}

export default function ScheduleMailView() {
    const { showToast } = useToast();
    const [emails, setEmails] = useState<ScheduledEmailItem[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal state for Create/Edit Scheduled Email
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
    const [editorTab, setEditorTab] = useState<"templates" | "editor" | "preview">("templates");
    const [htmlMode, setHtmlMode] = useState<"visual" | "code">("code");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form state
    const [title, setTitle] = useState<string>("");
    const [subject, setSubject] = useState<string>("");
    const [recipientType, setRecipientType] = useState<"all_users" | "custom" | "contacts">("all_users");
    const [customRecipientsInput, setCustomRecipientsInput] = useState<string>("");

    // "From Contacts" recipient picker state
    const [contactCompanies, setContactCompanies] = useState<string[]>([]);
    const [contactProductInterests, setContactProductInterests] = useState<string[]>([]);
    const [contactCompanyFilter, setContactCompanyFilter] = useState<string>("");
    const [contactProductInterestFilter, setContactProductInterestFilter] = useState<string>("");
    const [isLoadingContactMatches, setIsLoadingContactMatches] = useState<boolean>(false);
    const [matchedContactsCount, setMatchedContactsCount] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("custom");
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [scheduledDateTime, setScheduledDateTime] = useState<string>("");

    // Test send modal / input state
    const [testEmailAddress, setTestEmailAddress] = useState<string>("");
    const [sendingTest, setSendingTest] = useState<boolean>(false);

    // Preview Modal state
    const [previewItem, setPreviewItem] = useState<ScheduledEmailItem | null>(null);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [emailsRes, templatesRes] = await Promise.all([
                api.get("/admin/scheduled-emails"),
                api.get("/admin/scheduled-emails/templates")
            ]);

            if (emailsRes.data?.success) {
                setEmails(emailsRes.data.emails || []);
                setActiveUsersCount(emailsRes.data.activeUsersCount || 0);
            }
            if (templatesRes.data?.success) {
                setTemplates(templatesRes.data.templates || []);
            }
        } catch (error: any) {
            console.error("Error fetching scheduled email data:", error);
            showToast("Failed to load scheduled emails data", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (recipientType === "contacts" && contactCompanies.length === 0 && contactProductInterests.length === 0) {
            api.get("/contacts/meta")
                .then(({ data }) => {
                    setContactCompanies(data.companies || []);
                    setContactProductInterests(data.productInterests || []);
                })
                .catch((error) => {
                    console.error("Failed to load contact filters", error);
                    showToast("Failed to load contact filters", "error");
                });
        }
    }, [recipientType]);

    const handleLoadMatchingContacts = async () => {
        setIsLoadingContactMatches(true);
        try {
            const { data } = await api.get("/contacts/emails", {
                params: {
                    company: contactCompanyFilter || undefined,
                    productInterest: contactProductInterestFilter || undefined
                }
            });
            setCustomRecipientsInput((data.emails || []).join(", "));
            setMatchedContactsCount(data.matchedContacts ?? data.emails?.length ?? 0);
            if (!data.emails || data.emails.length === 0) {
                showToast("No contacts matched these filters", "info");
            } else {
                showToast(`Loaded ${data.emails.length} recipient email(s) from ${data.matchedContacts} matching contact(s)`, "success");
            }
        } catch (error: any) {
            console.error("Failed to resolve contact emails", error);
            showToast(error.response?.data?.msg || "Failed to load matching contacts", "error");
        } finally {
            setIsLoadingContactMatches(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setSubject("");
        setRecipientType("all_users");
        setCustomRecipientsInput("");
        setSelectedTemplateId("custom");
        setHtmlContent("");
        setEditingEmailId(null);
        
        // Default datetime to 1 hour from now formatted for datetime-local input
        const defaultDate = new Date(Date.now() + 3600000);
        setScheduledDateTime(formatForDateTimeInput(defaultDate));
        setEditorTab("templates");
    };

    const formatForDateTimeInput = (date: Date): string => {
        const pad = (n: number) => n < 10 ? '0' + n : n;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleSelectTemplate = (template: EmailTemplate) => {
        setSelectedTemplateId(template.id);
        setTitle(template.name);
        setSubject(template.subject);
        setHtmlContent(template.html);
        setEditorTab("editor");
        showToast(`Loaded "${template.name}" template`, "info");
    };

    const handleQuickPresetTime = (minutesFromNow: number) => {
        const targetDate = new Date(Date.now() + minutesFromNow * 60 * 1000);
        setScheduledDateTime(formatForDateTimeInput(targetDate));
    };

    const handleSaveSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !subject.trim() || !htmlContent.trim() || !scheduledDateTime) {
            showToast("Please fill in Title, Subject, HTML Content and Schedule Date/Time", "error");
            return;
        }

        if ((recipientType === "custom" || recipientType === "contacts") && !customRecipientsInput.trim()) {
            showToast(
                recipientType === "contacts"
                    ? "Please load matching contacts before scheduling"
                    : "Please enter at least one recipient email address for custom targets",
                "error"
            );
            return;
        }

        try {
            setIsSubmitting(true);
            const isCustomLike = recipientType === "custom" || recipientType === "contacts";
            const payload = {
                title: title.trim(),
                subject: subject.trim(),
                recipientType: recipientType === "contacts" ? "custom" : recipientType,
                customRecipients: isCustomLike ? customRecipientsInput.split(",").map(e => e.trim()).filter(Boolean) : [],
                templateId: selectedTemplateId,
                htmlContent,
                scheduledAt: new Date(scheduledDateTime).toISOString()
            };

            if (editingEmailId) {
                const res = await api.put(`/admin/scheduled-emails/${editingEmailId}`, payload);
                if (res.data?.success) {
                    showToast("Scheduled email updated successfully!", "success");
                    setIsCreateModalOpen(false);
                    fetchData();
                }
            } else {
                const res = await api.post("/admin/scheduled-emails", payload);
                if (res.data?.success) {
                    showToast("New email scheduled successfully!", "success");
                    setIsCreateModalOpen(false);
                    fetchData();
                }
            }
        } catch (error: any) {
            console.error("Save schedule error:", error);
            showToast(error.response?.data?.msg || "Failed to schedule email", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditItem = (item: ScheduledEmailItem) => {
        setEditingEmailId(item._id);
        setTitle(item.title);
        setSubject(item.subject);
        setRecipientType(item.recipientType);
        setCustomRecipientsInput(item.customRecipients ? item.customRecipients.join(", ") : "");
        setSelectedTemplateId(item.templateId || "custom");
        setHtmlContent(item.htmlContent);
        setScheduledDateTime(formatForDateTimeInput(new Date(item.scheduledAt)));
        setEditorTab("editor");
        setIsCreateModalOpen(true);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Are you sure you want to cancel and delete this scheduled email task?")) return;

        try {
            const res = await api.delete(`/admin/scheduled-emails/${id}`);
            if (res.data?.success) {
                showToast("Scheduled email deleted", "success");
                setEmails(prev => prev.filter(item => item._id !== id));
            }
        } catch (error: any) {
            console.error("Delete schedule error:", error);
            showToast(error.response?.data?.msg || "Failed to delete schedule", "error");
        }
    };

    const handleSendNow = async (id: string) => {
        if (!confirm("Are you sure you want to dispatch this email immediately to all target recipients?")) return;

        try {
            showToast("Dispatching email now...", "info");
            const res = await api.post(`/admin/scheduled-emails/${id}/send-now`);
            if (res.data?.success) {
                showToast("Email dispatched successfully!", "success");
                fetchData();
            }
        } catch (error: any) {
            console.error("Send now error:", error);
            showToast(error.response?.data?.msg || "Failed to dispatch email", "error");
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmailAddress.trim()) {
            showToast("Please enter a test recipient email address", "error");
            return;
        }
        if (!htmlContent.trim()) {
            showToast("No HTML content to test", "error");
            return;
        }

        try {
            setSendingTest(true);
            const res = await api.post("/admin/scheduled-emails/test-send", {
                testEmail: testEmailAddress.trim(),
                subject: subject || "DDTEC Email Preview Test",
                htmlContent
            });
            if (res.data?.success) {
                showToast(res.data.msg || `Test email sent to ${testEmailAddress}`, "success");
            }
        } catch (error: any) {
            console.error("Test send error:", error);
            showToast(error.response?.data?.msg || "Failed to send test email", "error");
        } finally {
            setSendingTest(false);
        }
    };

    // Filtered list
    const filteredEmails = emails.filter(item => {
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesSearch = searchQuery === "" ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = emails.filter(e => e.status === "pending").length;
    const sentCount = emails.filter(e => e.status === "sent").length;
    const failedCount = emails.filter(e => e.status === "failed").length;

    return (
        <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Email Scheduler
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Schedule marketing dispatches, newsletters, and automated emails with pre-built HTML templates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Refresh list"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>Sync</span>
                    </button>

                    <button
                        onClick={handleOpenCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-teal-500/25 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Schedule New Mail</span>
                    </button>
                </div>
            </div>

            {/* Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Audience</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeUsersCount}</h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Verified customer accounts</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Schedules</p>
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
                        <p className="text-xs text-slate-500 mt-1">Awaiting dispatch window</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Successfully Sent</p>
                        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{sentCount}</h3>
                        <p className="text-xs text-slate-500 mt-1">Completed dispatches</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Templates Available</p>
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{templates.length}</h3>
                        <p className="text-xs text-slate-500 mt-1">Predesigned HTML layouts</p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Layout className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    {["all", "pending", "sent", "failed"].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                                statusFilter === status
                                    ? "bg-slate-900 text-white dark:bg-teal-600"
                                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                        >
                            {status === "all" ? "All Schedules" : status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Main Email Schedules Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-3" />
                        <p className="text-slate-500 text-sm">Loading scheduled email tasks...</p>
                    </div>
                ) : filteredEmails.length === 0 ? (
                    <div className="p-12 text-center">
                        <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Scheduled Emails Found</h3>
                        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                            {searchQuery || statusFilter !== "all"
                                ? "No scheduled emails match your current filter criteria."
                                : "Create your first email schedule by selecting a predefined HTML template or drafting a custom message."}
                        </p>
                        <button
                            onClick={handleOpenCreateModal}
                            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Email Schedule</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Campaign & Subject</th>
                                    <th className="px-6 py-4">Recipients Target</th>
                                    <th className="px-6 py-4">Scheduled Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                                {filteredEmails.map((item) => {
                                    const isPending = item.status === "pending";
                                    const isSent = item.status === "sent";
                                    const isFailed = item.status === "failed";
                                    const isCancelled = item.status === "cancelled";

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <span>{item.title}</span>
                                                    {item.templateId && item.templateId !== "custom" && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                                            {item.templateId.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                                    Subject: "{item.subject}"
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {item.recipientType === "all_users" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                                                        <Users className="w-3.5 h-3.5" />
                                                        All Users ({activeUsersCount})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50" title={item.customRecipients?.join(", ")}>
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {item.customRecipients?.length || 0} Custom Recipient(s)
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>{new Date(item.scheduledAt).toLocaleString()}</span>
                                                </div>
                                                {isSent && item.sentAt && (
                                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                        Sent at: {new Date(item.sentAt).toLocaleTimeString()}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                                                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                                        Pending
                                                    </span>
                                                )}
                                                {isSent && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Sent ({item.sentCount})
                                                    </span>
                                                )}
                                                {isFailed && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200/60 dark:border-red-800" title={item.errorMessage}>
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Failed
                                                    </span>
                                                )}
                                                {isCancelled && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                        Cancelled
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => setPreviewItem(item)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                                    title="Preview HTML"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {isPending && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSendNow(item._id)}
                                                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 transition-colors"
                                                            title="Dispatch Immediately"
                                                        >
                                                            <Zap className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                                            title="Edit Schedule"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                                    title="Delete Schedule"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT SCHEDULE MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {editingEmailId ? "Edit Scheduled Email" : "Schedule New Email Dispatch"}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Tab Controls */}
                            <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 bg-slate-100/50 dark:bg-slate-800">
                                <button
                                    onClick={() => setEditorTab("templates")}
                                    className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer ${
                                        editorTab === "templates"
                                            ? "border-teal-600 text-teal-600 dark:text-teal-400"
                                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    1. Predefined Templates ({templates.length})
                                </button>

                                <button
                                    onClick={() => setEditorTab("editor")}
                                    className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer ${
                                        editorTab === "editor"
                                            ? "border-teal-600 text-teal-600 dark:text-teal-400"
                                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                >
                                    <Edit3 className="w-4 h-4" />
                                    2. Configure & HTML Content
                                </button>

                                <button
                                    onClick={() => setEditorTab("preview")}
                                    className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 cursor-pointer ${
                                        editorTab === "preview"
                                            ? "border-teal-600 text-teal-600 dark:text-teal-400"
                                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    3. Live Preview & Test
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 max-h-[75vh] overflow-y-auto">
                                {/* TAB 1: PREDEFINED TEMPLATES */}
                                {editorTab === "templates" && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl flex items-start gap-3">
                                            <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-teal-800 dark:text-teal-200 leading-relaxed">
                                                Select one of our professionally crafted, mobile-responsive HTML email templates below to jumpstart your campaign, or select "Custom HTML" to write your own code.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            {templates.map((tpl) => (
                                                <div
                                                    key={tpl.id}
                                                    onClick={() => handleSelectTemplate(tpl)}
                                                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                                                        selectedTemplateId === tpl.id
                                                            ? "border-teal-600 bg-teal-50/20 dark:bg-teal-900/10"
                                                            : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600"
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                                {tpl.badge}
                                                            </span>
                                                            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                                                Use Template <ArrowRight className="w-3.5 h-3.5" />
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                            {tpl.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                                            {tpl.description}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                                                        <span>Subject: {tpl.subject}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: CONFIGURE & EDITOR */}
                                {editorTab === "editor" && (
                                    <form onSubmit={handleSaveSchedule} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    Campaign Title (Internal Reference) *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Summer Flash Sale Announcement"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    Email Subject Line *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. 🔥 Exclusive 50% Off Code Inside"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Recipient Selection */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                Target Audience / Recipients *
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                                <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                    recipientType === "all_users"
                                                        ? "border-teal-600 bg-teal-50/30 dark:bg-teal-900/20 text-slate-900 dark:text-white"
                                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="recipientType"
                                                        value="all_users"
                                                        checked={recipientType === "all_users"}
                                                        onChange={() => setRecipientType("all_users")}
                                                        className="text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-sm">All Active Users</div>
                                                        <div className="text-xs text-slate-400">Sends to all {activeUsersCount} registered user accounts</div>
                                                    </div>
                                                </label>

                                                <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                    recipientType === "custom"
                                                        ? "border-teal-600 bg-teal-50/30 dark:bg-teal-900/20 text-slate-900 dark:text-white"
                                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="recipientType"
                                                        value="custom"
                                                        checked={recipientType === "custom"}
                                                        onChange={() => setRecipientType("custom")}
                                                        className="text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-sm">Custom Recipient List</div>
                                                        <div className="text-xs text-slate-400">Specify custom email addresses manually</div>
                                                    </div>
                                                </label>

                                                <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                    recipientType === "contacts"
                                                        ? "border-teal-600 bg-teal-50/30 dark:bg-teal-900/20 text-slate-900 dark:text-white"
                                                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="recipientType"
                                                        value="contacts"
                                                        checked={recipientType === "contacts"}
                                                        onChange={() => { setRecipientType("contacts"); setMatchedContactsCount(null); }}
                                                        className="text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-sm">From Contacts</div>
                                                        <div className="text-xs text-slate-400">Filter your Contacts by company / product interest</div>
                                                    </div>
                                                </label>
                                            </div>

                                            {recipientType === "contacts" && (
                                                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 mb-3">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <select
                                                            value={contactCompanyFilter}
                                                            onChange={(e) => setContactCompanyFilter(e.target.value)}
                                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                        >
                                                            <option value="">Any Company</option>
                                                            {contactCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <select
                                                            value={contactProductInterestFilter}
                                                            onChange={(e) => setContactProductInterestFilter(e.target.value)}
                                                            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                        >
                                                            <option value="">Any Product Interest</option>
                                                            {contactProductInterests.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleLoadMatchingContacts}
                                                        disabled={isLoadingContactMatches}
                                                        className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 flex items-center gap-2"
                                                    >
                                                        {isLoadingContactMatches ? <RefreshCw className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                                                        Load Matching Contacts
                                                    </button>
                                                    {matchedContactsCount !== null && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {matchedContactsCount} contact(s) matched — emails populated below, still editable.
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {(recipientType === "custom" || recipientType === "contacts") && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter comma-separated emails e.g. john@example.com, sara@example.com"
                                                    value={customRecipientsInput}
                                                    onChange={(e) => setCustomRecipientsInput(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                />
                                            )}
                                        </div>

                                        {/* Scheduled Date Time & Quick Presets */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                    Scheduled Dispatch Date & Time *
                                                </label>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickPresetTime(10)}
                                                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                                                    >
                                                        +10 Mins
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickPresetTime(60)}
                                                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                                                    >
                                                        +1 Hour
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickPresetTime(1440)}
                                                        className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                                                    >
                                                        Tomorrow
                                                    </button>
                                                </div>
                                            </div>

                                            <input
                                                type="datetime-local"
                                                required
                                                value={scheduledDateTime}
                                                onChange={(e) => setScheduledDateTime(e.target.value)}
                                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                            />
                                        </div>

                                        {/* HTML Code Editor */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                    Predefined HTML Source Code *
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditorTab("preview")}
                                                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Preview Rendered Layout
                                                </button>
                                            </div>
                                            <textarea
                                                required
                                                rows={12}
                                                placeholder="<html><body><h1>Your HTML Code...</h1></body></html>"
                                                value={htmlContent}
                                                onChange={(e) => setHtmlContent(e.target.value)}
                                                className="w-full p-4 text-xs font-mono bg-slate-900 text-teal-400 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => setIsCreateModalOpen(false)}
                                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span>{isSubmitting ? "Saving..." : (editingEmailId ? "Update Schedule" : "Confirm Schedule")}</span>
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* TAB 3: LIVE PREVIEW & TEST */}
                                {editorTab === "preview" && (
                                    <div className="space-y-6">
                                        {/* Test email dispatch bar */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
                                            <div className="flex-1 w-full">
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                    Send Test Email Preview
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="Enter your email address (e.g. admin@ddtec.com)"
                                                    value={testEmailAddress}
                                                    onChange={(e) => setTestEmailAddress(e.target.value)}
                                                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSendTestEmail}
                                                disabled={sendingTest}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 mt-auto"
                                            >
                                                <SendHorizontal className="w-4 h-4" />
                                                <span>{sendingTest ? "Sending Test..." : "Send Test Now"}</span>
                                            </button>
                                        </div>

                                        {/* HTML Render Preview Container */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                Visual HTML Rendering Preview
                                            </h4>
                                            <div className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white">
                                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center justify-between">
                                                    <span>Subject: <strong>{subject || "(No subject set)"}</strong></span>
                                                    <span>Viewport: 600px Responsive Email</span>
                                                </div>
                                                <div className="p-4 bg-slate-100/50 flex justify-center min-h-[400px]">
                                                    <iframe
                                                        srcDoc={htmlContent || "<p style='text-align:center; color:#999;'>No HTML content to render yet.</p>"}
                                                        className="w-full max-w-[650px] min-h-[450px] bg-white border border-slate-200 shadow-sm rounded-lg"
                                                        title="Email Live Preview"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <button
                                                type="button"
                                                onClick={() => setEditorTab("editor")}
                                                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                &larr; Back to Editor
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleSaveSchedule}
                                                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span>Confirm & Schedule</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PREVIEW HTML MODAL (For existing schedules in table) */}
            <AnimatePresence>
                {previewItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8"
                        >
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        {previewItem.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Subject: "{previewItem.subject}"
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 bg-slate-100/50 flex justify-center max-h-[70vh] overflow-y-auto">
                                <iframe
                                    srcDoc={previewItem.htmlContent}
                                    className="w-full max-w-[620px] min-h-[480px] bg-white border border-slate-200 shadow-sm rounded-xl"
                                    title="Schedule Email Preview"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
