"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Download,
    Printer,
    Share2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft,
    Building2,
    FileText,
    Copy,
    Check
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/app/_context/ToastContext";

interface InvoiceItem {
    itemDescription: string;
    hsnCode?: string;
    qty: number;
    price: number;
    amount: number;
}

interface PartyDetails {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    taxId?: string;
    logo?: string;
}

interface PaymentDetails {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    ifscCode?: string;
    swiftCode?: string;
    routingCode?: string;
    upiId?: string;
}

interface InvoiceData {
    _id: string;
    invoiceNumber: string;
    publicId: string;
    issueDate: string;
    dueDate?: string;
    status: "draft" | "unpaid" | "paid" | "cancelled";
    currency: string;
    sellerDetails: PartyDetails;
    clientDetails: PartyDetails;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    discountType: "fixed" | "percentage";
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paymentDetails?: PaymentDetails;
    notes?: string;
    createdAt: string;
}

export default function PublicInvoicePage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const id = params?.id as string;

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/invoices/public/${id}`);
            if (res.data?.invoice) {
                setInvoice(res.data.invoice);
            } else {
                setError("Invoice details not found.");
            }
        } catch (err: any) {
            console.error("Error fetching invoice:", err);
            setError(err.response?.data?.msg || "Invoice not found or invalid link.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            showToast("Invoice link copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            showToast("Failed to copy link", "error");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!invoice) return;
        setIsDownloading(true);
        try {
            const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === "production" ? "https://uat-dd.onrender.com" : "http://localhost:5000");
            const pdfUrl = `${backendBase.replace(/\/$/, "")}/invoices/public/${invoice.publicId}/pdf`;

            // Open or download directly
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast("Downloading invoice PDF...", "info");
        } catch (err) {
            console.error("Download error:", err);
            showToast("Failed to download PDF. Please try again.", "error");
        } finally {
            setTimeout(() => setIsDownloading(false), 1500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading invoice...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4">
                        <AlertCircle className="size-7" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invoice Not Found</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || "The link you followed may be invalid or expired."}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const isPaid = invoice.status === "paid";
    const issueDateStr = new Date(invoice.issueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
    const dueDateStr = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : "Upon Receipt";

    return (
        <div className="min-h-screen bg-[#f7f7f7] dark:bg-slate-950 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 text-slate-800 dark:text-slate-100 antialiased print:bg-white print:p-0">
            {/* Top Navigation & Action Controls (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (typeof window !== "undefined" && window.history.length > 1) {
                                router.back();
                            } else {
                                router.push("/");
                            }
                        }}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Go back"
                    >
                        <ArrowLeft className="size-4" />
                    </button>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Official Invoice</span>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white font-mono">{invoice.invoiceNumber}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm transition cursor-pointer"
                    >
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        {copied ? "Copied" : "Copy Link"}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm transition cursor-pointer"
                    >
                        <Printer className="size-3.5" />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                        <Download className="size-3.5" />
                        {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* A4 Invoice Card — Styled after invoice-generator.prolab.sh */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none print:max-w-none">
                {/* 1. Invoice Terms Header Row */}
                <div className="border-b border-dashed border-slate-300 dark:border-slate-700 py-4 px-6 sm:px-10 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Invoice No</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white font-mono">{invoice.invoiceNumber}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Issued Date</p>
                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200">{issueDateStr}</p>
                    </div>
                    <div>
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider">Due Date</p>
                        <p className="font-medium text-xs text-slate-800 dark:text-slate-200">{dueDateStr}</p>
                    </div>
                    <div className="flex sm:justify-end">
                        <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1 rounded-full ${isPaid
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                }`}
                        >
                            {isPaid ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
                            {invoice.status}
                        </span>
                    </div>
                </div>

                {/* 2. From & To Details Grid */}
                <div className="border-b border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2">
                    {/* FROM (Seller / DDTEC) */}
                    <div className="py-5 px-6 sm:px-10 border-b sm:border-b-0 sm:border-r border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">From</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{invoice.sellerDetails?.name || "DDTEC Solutions"}</p>
                        {invoice.sellerDetails?.email && (
                            <p className="text-neutral-500 dark:text-slate-400 text-xs mt-1">{invoice.sellerDetails.email}</p>
                        )}
                        <div className="text-xs text-neutral-500 dark:text-slate-400 mt-2 space-y-0.5">
                            {invoice.sellerDetails?.address && <p>{invoice.sellerDetails.address}</p>}
                            <p>
                                {[invoice.sellerDetails?.city, invoice.sellerDetails?.state, invoice.sellerDetails?.zip].filter(Boolean).join(", ")}
                            </p>
                            {invoice.sellerDetails?.country && <p>{invoice.sellerDetails.country}</p>}
                            {invoice.sellerDetails?.taxId && (
                                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                                    GSTIN: {invoice.sellerDetails.taxId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* TO (Client / Customer) */}
                    <div className="py-5 px-6 sm:px-10">
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2">To</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{invoice.clientDetails?.name || "Customer"}</p>
                        {invoice.clientDetails?.email && (
                            <p className="text-neutral-500 dark:text-slate-400 text-xs mt-1">{invoice.clientDetails.email}</p>
                        )}
                        <div className="text-xs text-neutral-500 dark:text-slate-400 mt-2 space-y-0.5">
                            {invoice.clientDetails?.address && <p>{invoice.clientDetails.address}</p>}
                            <p>
                                {[invoice.clientDetails?.city, invoice.clientDetails?.state, invoice.clientDetails?.zip].filter(Boolean).join(", ")}
                            </p>
                            {invoice.clientDetails?.country && <p>{invoice.clientDetails.country}</p>}
                            {invoice.clientDetails?.taxId && (
                                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                                    GSTIN: {invoice.clientDetails.taxId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Items Table */}
                <div className="border-b border-dashed border-slate-300 dark:border-slate-700">
                    {/* Header */}
                    <div className="grid grid-cols-12 items-center py-3.5 px-6 sm:px-10 text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="col-span-6 sm:col-span-7">Description</div>
                        <div className="col-span-2 text-center">QTY</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 sm:col-span-1 text-right">Amount</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800">
                        {invoice.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 items-center py-3.5 px-6 sm:px-10 text-xs">
                                <div className="col-span-6 sm:col-span-7 pr-2">
                                    <p className="font-medium text-slate-800 dark:text-slate-100">{item.itemDescription}</p>
                                    {item.hsnCode && (
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">HSN: {item.hsnCode}</p>
                                    )}
                                </div>
                                <div className="col-span-2 text-center text-slate-600 dark:text-slate-300">{item.qty}</div>
                                <div className="col-span-2 text-right font-mono text-slate-600 dark:text-slate-300">
                                    ₹{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-span-2 sm:col-span-1 text-right font-mono font-medium text-slate-900 dark:text-white">
                                    ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Notes & Financial Summary Grid */}
                <div className="border-b border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2">
                    {/* Notes on Left */}
                    <div className="py-5 px-6 sm:px-10 border-b sm:border-b-0 sm:border-r border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between">
                        <div>
                            <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Note</p>
                            <p className="text-xs text-neutral-600 dark:text-slate-400 leading-relaxed break-words">
                                {invoice.notes || "Thank you for partnering with DDTEC. Please remit payment via bank transfer using the account details below."}
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                            Computer generated invoice. No signature required.
                        </div>
                    </div>

                    {/* Totals on Right */}
                    <div className="py-2 divide-y divide-dashed divide-slate-200 dark:divide-slate-800 text-xs">
                        <div className="flex justify-between items-center py-2.5 px-6 sm:px-10">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                                ₹{invoice.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {invoice.discount > 0 && (
                            <div className="flex justify-between items-center py-2.5 px-6 sm:px-10 text-red-600 dark:text-red-400">
                                <span>Discount</span>
                                <span className="font-mono font-medium">
                                    -₹{invoice.discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        {invoice.taxRate > 0 && (
                            <div className="flex justify-between items-center py-2.5 px-6 sm:px-10">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Tax / GST ({invoice.taxRate}%)</span>
                                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                                    ₹{invoice.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-3.5 px-6 sm:px-10 bg-slate-50/70 dark:bg-slate-800/40">
                            <div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Amount Due</span>
                                <span className="block text-[10px] text-slate-400 font-mono">INR</span>
                            </div>
                            <span className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                                ₹{invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 5. Bank Details & Payable Currency Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {/* Bank Details */}
                    <div className="py-5 px-6 sm:px-10 border-b sm:border-b-0 sm:border-r border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Bank Details</p>
                        <div className="space-y-1 text-xs">
                            <div className="grid grid-cols-3">
                                <span className="text-slate-400">Bank Name</span>
                                <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">{invoice.paymentDetails?.bankName || "HDFC Bank"}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-400">Account No</span>
                                <span className="col-span-2 font-mono font-medium text-slate-700 dark:text-slate-300">{invoice.paymentDetails?.accountNumber || "50200012345678"}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-400">Account Name</span>
                                <span className="col-span-2 font-medium text-slate-700 dark:text-slate-300">{invoice.paymentDetails?.accountName || "DDTEC SOLUTIONS PVT LTD"}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-400">IFSC Code</span>
                                <span className="col-span-2 font-mono font-medium text-slate-700 dark:text-slate-300">{invoice.paymentDetails?.ifscCode || "HDFC0001234"}</span>
                            </div>
                            {invoice.paymentDetails?.upiId && (
                                <div className="grid grid-cols-3">
                                    <span className="text-slate-400">UPI ID</span>
                                    <span className="col-span-2 font-mono font-medium text-slate-700 dark:text-slate-300">{invoice.paymentDetails.upiId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payable Currency */}
                    <div className="py-5 px-6 sm:px-10 flex flex-col justify-between">
                        <div>
                            <p className="text-[11px] text-neutral-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Payable in</p>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    ₹
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Indian Rupee</p>
                                    <p className="text-xs text-slate-400 font-mono">INR (₹)</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <span className="text-[11px] text-slate-400">
                                Powered by <strong className="text-slate-600 dark:text-slate-300">DDTEC</strong>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Action Buttons Bar (Shown only on small mobile screens where top bar wraps) */}
            <div className="max-w-4xl mx-auto mt-6 text-center print:hidden sm:hidden">
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                    <Download className="size-4" />
                    {isDownloading ? "Generating PDF..." : "Download Invoice PDF"}
                </button>
            </div>
        </div>
    );
}
