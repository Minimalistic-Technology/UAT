"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Receipt,
    Plus,
    Trash2,
    Copy,
    Check,
    Download,
    Eye,
    ExternalLink,
    Search,
    RefreshCw,
    Filter,
    Calendar,
    Building2,
    User,
    CreditCard,
    FileText,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Sparkles,
    ShoppingBag,
    Loader2,
    Mail,
    Send,
    X
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/app/_context/ToastContext";
import { useConfirm } from "@/app/_context/ConfirmContext";
import Pagination from "@/app/_components/Pagination";

interface InvoiceItem {
    productId?: string;
    itemDescription: string;
    hsnCode: string;
    qty: number;
    price: number;
    amount: number;
}

interface ClientOption {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    gstin?: string;
    currency?: string;
}

interface ProductOption {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
}

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const INDIAN_PIN_REGEX = /^[1-9][0-9]{5}$/;
const HSN_REGEX = /^[0-9]{2,8}$/;
const INVOICE_NUMBER_REGEX = /^[A-Za-z0-9\-_/]{3,50}$/;
const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

const DEFAULT_SELLER = {
    name: "DDTEC Solutions",
    email: "contact@ddtec.in",
    phone: "+91 98765 43210",
    address: "123 Tech Lane, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    zip: "560038",
    country: "India",
    taxId: "29AABBD1234F1Z5"
};

const DEFAULT_PAYMENT = {
    bankName: "HDFC Bank",
    accountNumber: "50200012345678",
    accountName: "DDTEC SOLUTIONS PVT LTD",
    ifscCode: "HDFC0001234",
    upiId: "ddtec@hdfcbank"
};

function InvoiceStatusDropdown({
    status,
    onChange
}: {
    status: string;
    onChange: (next: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleToggle = () => {
        if (!open && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUpward(spaceBelow < 190);
        }
        setOpen(!open);
    };

    const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
        unpaid: {
            label: "Unpaid",
            dot: "bg-amber-500",
            badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        },
        paid: {
            label: "Paid",
            dot: "bg-emerald-500",
            badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
        },
        draft: {
            label: "Draft",
            dot: "bg-slate-400",
            badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        },
        cancelled: {
            label: "Cancelled",
            dot: "bg-rose-500",
            badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900/50"
        }
    };

    const current = statusConfig[status] || statusConfig.unpaid;

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider transition-all cursor-pointer shadow-xs ${current.badge}`}
            >
                <span className={`size-1.5 rounded-full ${current.dot}`} />
                {current.label}
                <ChevronDown className={`size-3 transition-transform duration-200 opacity-70 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className={`absolute left-0 ${openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"} w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 divide-y-0 overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
                    {(["unpaid", "paid", "draft", "cancelled"] as const).map((s) => {
                        const conf = statusConfig[s];
                        const isSelected = s === status;
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    onChange(s);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-left ${
                                    isSelected
                                        ? "bg-slate-100 dark:bg-slate-700/80 text-slate-900 dark:text-white"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full shrink-0 ${conf.dot}`} />
                                    <span>{conf.label}</span>
                                </div>
                                {isSelected && <Check className="size-3.5 text-teal-600 dark:text-teal-400" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AdminInvoicesContent() {
    const { showToast } = useToast();
    const confirm = useConfirm();
    const searchParams = useSearchParams();

    // Active Tab: 'create' | 'list' - initialized from URL query param if present
    const queryTab = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState<"create" | "list">(
        queryTab === "list" ? "list" : "create"
    );

    const handleTabChange = (tab: "create" | "list") => {
        setActiveTab(tab);
        try {
            localStorage.setItem("admin_invoices_tab", tab);
            const url = new URL(window.location.href);
            url.searchParams.set("tab", tab);
            window.history.replaceState(null, "", url.toString());
        } catch (e) {
            console.error("Failed to update tab URL/storage", e);
        }
    };

    // Keep tab in sync with URL searchParams or fallback to saved localStorage value
    useEffect(() => {
        const currentParamTab = searchParams.get("tab");
        if (currentParamTab === "list" || currentParamTab === "create") {
            setActiveTab(currentParamTab);
            try {
                localStorage.setItem("admin_invoices_tab", currentParamTab);
            } catch (e) {}
        } else {
            try {
                const savedTab = localStorage.getItem("admin_invoices_tab");
                if (savedTab === "list" || savedTab === "create") {
                    setActiveTab(savedTab);
                    const url = new URL(window.location.href);
                    url.searchParams.set("tab", savedTab);
                    window.history.replaceState(null, "", url.toString());
                }
            } catch (e) {}
        }
    }, [searchParams]);

    // Client & Product catalogs for auto-picker
    const [clientsList, setClientsList] = useState<ClientOption[]>([]);
    const [productsList, setProductsList] = useState<ProductOption[]>([]);
    const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<string>("");

    // Invoices list state
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [invoicePage, setInvoicePage] = useState(1);
    const [invoicePageSize] = useState(25);
    const [invoiceTotal, setInvoiceTotal] = useState(0);
    const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);

    // Creation form state
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split("T")[0];
    });
    const [currency, setCurrency] = useState("INR");
    const [status, setStatus] = useState<"draft" | "unpaid" | "paid">("unpaid");

    const [sellerDetails, setSellerDetails] = useState(DEFAULT_SELLER);
    const [showSellerConfig, setShowSellerConfig] = useState(false);

    const [clientDetails, setClientDetails] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        taxId: ""
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { itemDescription: "", hsnCode: "", qty: 1, price: 0, amount: 0 }
    ]);

    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
    const [taxRate, setTaxRate] = useState<number>(18);

    const [paymentDetails, setPaymentDetails] = useState(DEFAULT_PAYMENT);
    const [notes, setNotes] = useState(
        "Payment is due within 15 days of invoice date. Thank you for doing business with DDTEC Solutions!"
    );

    // Save states
    const [isSaving, setIsSaving] = useState(false);
    const [createdInvoiceData, setCreatedInvoiceData] = useState<any | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedListId, setCopiedListId] = useState<string | null>(null);

    // Email dispatch state
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [emailModalData, setEmailModalData] = useState<{ id: string; email: string; invoiceNumber: string } | null>(null);
    const [customEmail, setCustomEmail] = useState("");

    // Fetch initial auxiliary data
    useEffect(() => {
        fetchClients();
        fetchProducts();
        fetchCompanySettings();
    }, []);

    const fetchCompanySettings = async () => {
        try {
            const res = await api.get("/companies");
            const companies = Array.isArray(res.data) ? res.data : (res.data?.companies || []);
            if (companies.length > 0) {
                const company = companies[0];
                setSellerDetails(prev => ({
                    ...prev,
                    name: company.name || prev.name,
                    taxId: company.gstNumber || prev.taxId,
                    address: company.location || prev.address
                }));
            }
        } catch (err) {
            console.error("Failed to fetch company details:", err);
        }
    };

    // Fetch invoices whenever switching to list tab or filters/pagination change
    useEffect(() => {
        if (activeTab === "list") {
            fetchInvoices(invoicePage, invoicePageSize);
        }
    }, [activeTab, statusFilter, invoicePage, invoicePageSize]);

    const fetchClients = async () => {
        try {
            const res = await api.get("/clients");
            const data = Array.isArray(res.data) ? res.data : (res.data?.clients || []);
            setClientsList(data);
        } catch (err) {
            console.error("Failed to fetch clients:", err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
            setProductsList(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    const fetchInvoices = async (targetPage = invoicePage, targetLimit = invoicePageSize) => {
        setLoadingInvoices(true);
        try {
            const params: any = { page: targetPage, limit: targetLimit };
            if (statusFilter !== "all") params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await api.get("/invoices", { params });
            setInvoices(res.data?.invoices || []);
            setInvoiceTotal(res.data?.total || 0);
            setInvoiceTotalPages(res.data?.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            showToast("Failed to load invoices", "error");
        } finally {
            setLoadingInvoices(false);
        }
    };

    // Client auto-filler handler
    const handleSelectClient = (clientId: string) => {
        if (!clientId) return;
        const selected = clientsList.find((c) => c._id === clientId);
        if (selected) {
            setClientDetails((prev) => ({
                ...prev,
                name: selected.name,
                email: selected.email || prev.email,
                phone: selected.phone || prev.phone,
                taxId: selected.gstin || prev.taxId,
            }));
            if (selected.currency) {
                setCurrency(selected.currency);
            }
            showToast(`Filled details for ${selected.name}`, "info");
        }
    };

    // Product item adder
    const handleAddCatalogProduct = (productId: string) => {
        if (!productId) return;
        const prod = productsList.find((p) => p._id === productId);
        if (!prod) return;

        const newItem: InvoiceItem = {
            productId: prod._id,
            itemDescription: prod.name,
            hsnCode: prod.hsnCode || "",
            qty: 1,
            price: prod.price || 0,
            amount: prod.price || 0
        };

        // If the first row is completely empty, replace it; otherwise append
        if (
            items.length === 1 &&
            !items[0].itemDescription &&
            items[0].price === 0
        ) {
            setItems([newItem]);
        } else {
            setItems((prev) => [...prev, newItem]);
        }

        setSelectedCatalogProduct("");
        showToast(`Added ${prod.name}`, "info");
    };

    // Filter out products already present in line items so they cannot be selected twice
    const availableProducts = useMemo(() => {
        return productsList.filter((p) => {
            const isAlreadyAdded = items.some((item) => {
                if (item.productId && item.productId === p._id) return true;
                if (
                    item.itemDescription &&
                    item.itemDescription.trim().toLowerCase() === p.name.trim().toLowerCase()
                ) {
                    return true;
                }
                return false;
            });
            return !isAlreadyAdded;
        });
    }, [productsList, items]);

    // Line item editing handlers
    const updateItem = (index: number, patch: Partial<InvoiceItem>) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                const updated = { ...item, ...patch };
                // If user edited the description away from the catalog product name, detach productId
                if (patch.itemDescription !== undefined && updated.productId) {
                    const prod = productsList.find((p) => p._id === updated.productId);
                    if (prod && prod.name.trim().toLowerCase() !== patch.itemDescription.trim().toLowerCase()) {
                        delete updated.productId;
                    }
                }
                const qty = Number(updated.qty);
                const price = Number(updated.price);
                const validQty = !isNaN(qty) && isFinite(qty) ? qty : 0;
                const validPrice = !isNaN(price) && isFinite(price) ? price : 0;
                updated.amount = Number((validQty * validPrice).toFixed(2));
                return updated;
            })
        );
    };

    const addItem = () => {
        if (items.length >= 100) {
            showToast("Maximum 100 line items allowed per invoice", "warning");
            return;
        }
        setItems((prev) => [
            ...prev,
            { itemDescription: "", hsnCode: "", qty: 1, price: 0, amount: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) {
            showToast("At least one line item is required on an invoice", "warning");
            return;
        }
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Calculate totals on the fly for the preview & summary
    const calculatedTotals = useMemo(() => {
        const subtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
        const discountVal = Math.max(0, Number(discount) || 0);
        const computedDiscount =
            discountType === "percentage"
                ? Number(((subtotal * discountVal) / 100).toFixed(2))
                : Math.min(subtotal, discountVal);

        const taxableAmount = Math.max(0, subtotal - computedDiscount);
        const rate = Math.max(0, Number(taxRate) || 0);
        const taxAmount = Number(((taxableAmount * rate) / 100).toFixed(2));
        const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

        const sellerStateClean = (sellerDetails.state || "").trim().toLowerCase();
        const clientStateClean = (clientDetails.state || "").trim().toLowerCase();
        const isIntraState = Boolean(sellerStateClean && clientStateClean && sellerStateClean === clientStateClean);

        const cgstAmount = isIntraState ? Number((taxAmount / 2).toFixed(2)) : 0;
        const sgstAmount = isIntraState ? Number((taxAmount - cgstAmount).toFixed(2)) : 0;
        const igstAmount = !isIntraState ? taxAmount : 0;

        return {
            subtotal: Number(subtotal.toFixed(2)),
            discount: computedDiscount,
            taxAmount,
            grandTotal,
            isIntraState,
            cgstAmount,
            sgstAmount,
            igstAmount
        };
    }, [items, discount, discountType, taxRate, sellerDetails.state, clientDetails.state]);

    // Check if form is empty for reset button state
    const isFormEmpty = useMemo(() => {
        return (
            !invoiceNumber.trim() &&
            !clientDetails.name.trim() &&
            !clientDetails.email.trim() &&
            !clientDetails.phone.trim() &&
            !clientDetails.address.trim() &&
            !clientDetails.city.trim() &&
            !clientDetails.state.trim() &&
            !clientDetails.zip.trim() &&
            !clientDetails.taxId.trim() &&
            discount === 0 &&
            (items.length === 1 && !items[0].itemDescription && items[0].price === 0)
        );
    }, [invoiceNumber, clientDetails, discount, items]);

    // Check if all required fields are filled to enable the Save & Generate button
    const isFormValid = useMemo(() => {
        if (!issueDate) return false;
        const todayStr = new Date().toISOString().split("T")[0];
        if (issueDate > todayStr) return false;

        if (status !== "draft" && !dueDate) return false;
        if (dueDate && dueDate < issueDate) return false;

        if (!clientDetails.name.trim()) return false;
        if (status !== "draft") {
            if (!clientDetails.address.trim()) return false;
            if (!clientDetails.state.trim()) return false;
            if (!clientDetails.city.trim()) return false;
        }

        if (!sellerDetails.name.trim()) return false;

        if (!items || items.length === 0) return false;
        const allItemsValid = items.every((it) => {
            const desc = (it.itemDescription || "").trim();
            const q = Number(it.qty);
            const p = Number(it.price);
            return desc.length > 0 && !isNaN(q) && isFinite(q) && q > 0 && !isNaN(p) && isFinite(p) && p >= 0;
        });
        if (!allItemsValid) return false;

        const discNum = Number(discount);
        if (isNaN(discNum) || !isFinite(discNum) || discNum < 0) return false;
        if (discountType === "percentage" && discNum > 100) return false;
        if (discountType === "fixed" && discNum > calculatedTotals.subtotal) return false;

        return true;
    }, [
        issueDate,
        dueDate,
        status,
        clientDetails.name,
        clientDetails.address,
        clientDetails.state,
        clientDetails.city,
        sellerDetails.name,
        items,
        discount,
        discountType,
        calculatedTotals.subtotal
    ]);

    // Currency symbol helper
    const getCurrencySymbol = (cur: string) => {
        switch (cur) {
            case "INR":
                return "₹";
            case "USD":
                return "$";
            case "EUR":
                return "€";
            case "GBP":
                return "£";
            case "AED":
                return "AED ";
            default:
                return `${cur} `;
        }
    };

    const currSym = getCurrencySymbol(currency);

    // Form submit / save invoice with comprehensive validation
    const handleSaveInvoice = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Invoice Number format check if manually provided
        if (invoiceNumber.trim() && !INVOICE_NUMBER_REGEX.test(invoiceNumber.trim())) {
            showToast("Invoice number must be 3-50 characters (alphanumeric, -, _, /)", "warning");
            return;
        }

        // 2. Date checks
        const todayStr = new Date().toISOString().split("T")[0];
        if (!issueDate) {
            showToast("Issue date is required", "warning");
            return;
        }
        if (issueDate > todayStr) {
            showToast("Issue date cannot be in the future", "warning");
            return;
        }
        if (dueDate && dueDate < issueDate) {
            showToast("Due date must be on or after the issue date", "warning");
            return;
        }
        if (status !== "draft" && !dueDate) {
            showToast("Due date is required for finalized invoices", "warning");
            return;
        }

        // 3. Client details checks
        const trimmedClientName = clientDetails.name.trim();
        if (!trimmedClientName) {
            showToast("Please enter the client / customer name", "warning");
            return;
        }
        if (trimmedClientName.length > 150) {
            showToast("Client name cannot exceed 150 characters", "warning");
            return;
        }
        if (clientDetails.email && !EMAIL_REGEX.test(clientDetails.email.trim())) {
            showToast("Please enter a valid client email address", "warning");
            return;
        }
        if (clientDetails.phone && !PHONE_REGEX.test(clientDetails.phone.trim())) {
            showToast("Please enter a valid client phone number (7-20 digits)", "warning");
            return;
        }
        if (
            clientDetails.taxId &&
            clientDetails.country.toLowerCase() === "india" &&
            !GSTIN_REGEX.test(clientDetails.taxId.trim())
        ) {
            showToast("Invalid client GSTIN format (expected 15 characters, e.g. 29ABCDE1234F1Z5)", "warning");
            return;
        }
        if (status !== "draft") {
            if (!clientDetails.address.trim()) {
                showToast("Client street address is required for finalized invoices", "warning");
                return;
            }
            if (!clientDetails.city.trim()) {
                showToast("Client city is required for finalized invoices", "warning");
                return;
            }
            if (!clientDetails.state.trim()) {
                showToast("Client state is required for finalized invoices", "warning");
                return;
            }
            if (
                clientDetails.zip &&
                clientDetails.country.toLowerCase() === "india" &&
                !INDIAN_PIN_REGEX.test(clientDetails.zip.trim())
            ) {
                showToast("Invalid Indian PIN code (must be 6 digits)", "warning");
                return;
            }
        }

        // 4. Seller details checks
        if (!sellerDetails.name.trim()) {
            showToast("Seller name is required", "warning");
            return;
        }
        if (sellerDetails.email && !EMAIL_REGEX.test(sellerDetails.email.trim())) {
            showToast("Please enter a valid seller email address", "warning");
            return;
        }
        if (sellerDetails.phone && !PHONE_REGEX.test(sellerDetails.phone.trim())) {
            showToast("Please enter a valid seller phone number", "warning");
            return;
        }
        if (
            sellerDetails.taxId &&
            sellerDetails.country.toLowerCase() === "india" &&
            !GSTIN_REGEX.test(sellerDetails.taxId.trim())
        ) {
            showToast("Invalid seller GSTIN format", "warning");
            return;
        }

        // 5. Line items checks
        if (!items || items.length === 0) {
            showToast("At least one line item is required", "warning");
            return;
        }
        if (items.length > 100) {
            showToast("An invoice cannot contain more than 100 line items", "warning");
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const row = i + 1;
            const desc = (it.itemDescription || "").trim();
            if (!desc) {
                showToast(`Line item #${row}: description is required and cannot be empty`, "warning");
                return;
            }
            if (desc.length > 500) {
                showToast(`Line item #${row}: description cannot exceed 500 characters`, "warning");
                return;
            }
            const q = Number(it.qty);
            if (typeof q !== "number" || isNaN(q) || !isFinite(q) || q <= 0) {
                showToast(`Line item #${row}: quantity must be a valid number greater than zero`, "warning");
                return;
            }
            const p = Number(it.price);
            if (typeof p !== "number" || isNaN(p) || !isFinite(p) || p < 0) {
                showToast(`Line item #${row}: price must be a valid non-negative number`, "warning");
                return;
            }
            if (it.hsnCode && !HSN_REGEX.test(it.hsnCode.trim())) {
                showToast(`Line item #${row}: HSN code must be 2 to 8 digits`, "warning");
                return;
            }
        }

        // 6. Discount checks
        const discNum = Number(discount);
        if (isNaN(discNum) || !isFinite(discNum) || discNum < 0) {
            showToast("Discount must be a valid non-negative number", "warning");
            return;
        }
        if (discountType === "percentage" && discNum > 100) {
            showToast("Percentage discount cannot exceed 100%", "warning");
            return;
        }
        if (discountType === "fixed" && discNum > calculatedTotals.subtotal) {
            showToast(`Fixed discount (${discNum}) cannot exceed subtotal (${calculatedTotals.subtotal.toFixed(2)})`, "warning");
            return;
        }

        // 7. Tax rate check
        if (![0, 5, 12, 18, 28].includes(Number(taxRate))) {
            showToast("Please select a supported GST rate (0%, 5%, 12%, 18%, 28%)", "warning");
            return;
        }

        // 8. Payment details checks
        if (paymentDetails.accountNumber && !BANK_ACCOUNT_REGEX.test(paymentDetails.accountNumber.trim())) {
            showToast("Invalid bank account number (must be 9 to 18 digits)", "warning");
            return;
        }
        if (paymentDetails.ifscCode && !IFSC_REGEX.test(paymentDetails.ifscCode.trim().toUpperCase())) {
            showToast("Invalid Indian IFSC code format (e.g. HDFC0001234)", "warning");
            return;
        }
        if (paymentDetails.upiId && !UPI_REGEX.test(paymentDetails.upiId.trim())) {
            showToast("Invalid UPI ID format (e.g. username@bank)", "warning");
            return;
        }
        if (notes && notes.trim().length > 2000) {
            showToast("Notes cannot exceed 2000 characters", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                invoiceNumber: invoiceNumber.trim() || undefined,
                issueDate,
                dueDate: dueDate || undefined,
                currency,
                status,
                sellerDetails,
                clientDetails,
                items,
                discount: Number(discount) || 0,
                discountType,
                taxRate: Number(taxRate) || 0,
                paymentDetails,
                notes: notes.trim()
            };

            const res = await api.post("/invoices", payload);
            if (res.data?.success) {
                setCreatedInvoiceData(res.data);
                showToast("Invoice created successfully!", "success");
            } else {
                showToast(res.data?.msg || "Failed to create invoice", "error");
            }
        } catch (err: any) {
            console.error("Error creating invoice:", err);
            showToast(err.response?.data?.msg || "Failed to create invoice", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendInvoiceEmail = async (invoiceId: string, recipientEmail: string) => {
        if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail.trim())) {
            showToast("Please enter a valid recipient email address", "warning");
            return;
        }

        setSendingEmailId(invoiceId);
        try {
            const res = await api.post(`/invoices/${invoiceId}/send-email`, { toEmail: recipientEmail.trim() });
            if (res.data?.success) {
                showToast(`Invoice emailed successfully to ${recipientEmail}`, "success");
                setEmailModalData(null);
            } else {
                showToast(res.data?.msg || "Failed to send invoice email", "error");
            }
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to send invoice email", "error");
        } finally {
            setSendingEmailId(null);
        }
    };

    const handleCopyCreatedLink = async () => {
        if (!createdInvoiceData?.publicId) return;
        const origin = window.location.origin;
        const url = `${origin}/invoice/${createdInvoiceData.publicId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedLink(true);
            showToast("Public invoice link copied to clipboard!", "success");
            setTimeout(() => setCopiedLink(false), 2500);
        } catch (e) {
            showToast("Could not copy link", "error");
        }
    };

    const handleCopyListLink = async (publicId: string) => {
        const origin = window.location.origin;
        const url = `${origin}/invoice/${publicId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopiedListId(publicId);
            showToast("Public link copied to clipboard!", "success");
            setTimeout(() => setCopiedListId(null), 2500);
        } catch (e) {
            showToast("Could not copy link", "error");
        }
    };

    const getPdfDownloadUrl = (publicId: string) => {
        const backendBase =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            (process.env.NODE_ENV === "production"
                ? "https://uat-dd.onrender.com"
                : "http://localhost:5000");
        return `${backendBase.replace(/\/$/, "")}/invoices/public/${publicId}/pdf`;
    };

    const handleResetForm = () => {
        setCreatedInvoiceData(null);
        setInvoiceNumber("");
        setIssueDate(new Date().toISOString().split("T")[0]);
        const d = new Date();
        d.setDate(d.getDate() + 15);
        setDueDate(d.toISOString().split("T")[0]);
        setClientDetails({
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zip: "",
            country: "India",
            taxId: ""
        });
        setItems([{ itemDescription: "", hsnCode: "", qty: 1, price: 0, amount: 0 }]);
        setSelectedCatalogProduct("");
        setDiscount(0);
        setTaxRate(18);
    };

    const handleDeleteInvoice = async (invoice: any) => {
        const ok = await confirm({
            title: `Delete Invoice ${invoice.invoiceNumber}?`,
            message: `This will permanently remove the invoice for ${invoice.clientDetails?.name || "client"}. Its public link will no longer be accessible.`,
            confirmLabel: "Delete Invoice",
            variant: "danger"
        });
        if (!ok) return;

        try {
            await api.delete(`/invoices/${invoice._id}`);
            showToast(`Invoice ${invoice.invoiceNumber} deleted`, "success");
            setInvoices((prev) => prev.filter((i) => i._id !== invoice._id));
        } catch (err: any) {
            showToast(err.response?.data?.msg || "Failed to delete invoice", "error");
        }
    };

    const handleUpdateStatus = async (invoiceId: string, nextStatus: string) => {
        try {
            await api.put(`/invoices/${invoiceId}`, { status: nextStatus });
            setInvoices((prev) =>
                prev.map((i) => (i._id === invoiceId ? { ...i, status: nextStatus } : i))
            );
            showToast(`Status updated to ${nextStatus}`, "success");
        } catch (err) {
            showToast("Failed to update status", "error");
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Receipt className="size-7 text-teal-600 dark:text-teal-400" />
                        Invoices & Billing
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Create dashed-border A4 invoices with unique public share links, persistent DB storage, and instant PDF downloads.
                    </p>
                </div>

                {/* Tab Switcher Buttons */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                    <button
                        type="button"
                        onClick={() => handleTabChange("create")}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === "create"
                                ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        <Plus className="size-3.5" />
                        Create Invoice
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("list")}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === "list"
                                ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        <Receipt className="size-3.5" />
                        All Invoices
                    </button>
                </div>
            </div>

            {/* TAB 1: CREATE INVOICE */}
            {activeTab === "create" && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Input Form (7 cols on xl) */}
                    <form
                        onSubmit={handleSaveInvoice}
                        className="xl:col-span-7 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
                    >
                        {/* Section: Invoice Terms / Meta */}
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="size-4 text-teal-600 dark:text-teal-400" />
                                Invoice Details & Terms
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Invoice No. <span className="text-[11px] text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Issue Date <span className="text-red-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        max={new Date().toISOString().split("T")[0]}
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        min={issueDate}
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="AED">AED</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section: Client (To / Buyer) */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <User className="size-4 text-teal-600 dark:text-teal-400" />
                                    <span>Bill To (Client / Customer)</span>
                                </h2>
                                {clientsList.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Quick fill:</span>
                                        <select
                                            onChange={(e) => handleSelectClient(e.target.value)}
                                            defaultValue=""
                                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                                        >
                                            <option value="" disabled>
                                                Select Client...
                                            </option>
                                            {clientsList.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name} {c.company ? `(${c.company})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Client / Company Name <span className="text-red-500 font-bold ml-0.5">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Acme Corporation or Jane Doe"
                                        value={clientDetails.name}
                                        onChange={(e) =>
                                            setClientDetails({ ...clientDetails, name: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Client Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="billing@acme.com"
                                        value={clientDetails.email}
                                        onChange={(e) =>
                                            setClientDetails({ ...clientDetails, email: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+91 98765 00000"
                                        value={clientDetails.phone}
                                        onChange={(e) =>
                                            setClientDetails({ ...clientDetails, phone: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        GSTIN / Tax ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 29ABCDE1234F1Z5"
                                        value={clientDetails.taxId}
                                        onChange={(e) =>
                                            setClientDetails({ ...clientDetails, taxId: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Street Address {status !== "draft" && <span className="text-red-500 font-bold ml-0.5">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        required={status !== "draft"}
                                        placeholder="Floor 4, Tower B, Business Park"
                                        value={clientDetails.address}
                                        onChange={(e) =>
                                            setClientDetails({ ...clientDetails, address: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        State & City {status !== "draft" && <span className="text-red-500 font-bold ml-0.5">*</span>}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {clientDetails.country.toLowerCase() === "india" ? (
                                            <select
                                                required={status !== "draft"}
                                                value={clientDetails.state}
                                                onChange={(e) => {
                                                    const nextState = e.target.value;
                                                    setClientDetails({
                                                        ...clientDetails,
                                                        state: nextState,
                                                        city: nextState ? clientDetails.city : ""
                                                    });
                                                }}
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            >
                                                <option value="">Select State...</option>
                                                {INDIAN_STATES.map((st) => (
                                                    <option key={st} value={st}>
                                                        {st}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                required={status !== "draft"}
                                                placeholder="State / Province"
                                                value={clientDetails.state}
                                                onChange={(e) => {
                                                    const nextState = e.target.value;
                                                    setClientDetails({
                                                        ...clientDetails,
                                                        state: nextState,
                                                        city: nextState ? clientDetails.city : ""
                                                    });
                                                }}
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            required={status !== "draft"}
                                            disabled={!clientDetails.state.trim()}
                                            placeholder={!clientDetails.state.trim() ? "Select state first..." : "City"}
                                            value={clientDetails.city}
                                            onChange={(e) =>
                                                setClientDetails({ ...clientDetails, city: e.target.value })
                                            }
                                            className={`w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                                                !clientDetails.state.trim()
                                                    ? "bg-slate-100 dark:bg-slate-800/50 opacity-60 cursor-not-allowed text-slate-400 placeholder:text-slate-400"
                                                    : "bg-white dark:bg-slate-800"
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Postal Code & Country
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="Zip/PIN"
                                            value={clientDetails.zip}
                                            onChange={(e) =>
                                                setClientDetails({ ...clientDetails, zip: e.target.value })
                                            }
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Country"
                                            value={clientDetails.country}
                                            onChange={(e) =>
                                                setClientDetails({ ...clientDetails, country: e.target.value })
                                            }
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Seller Details (Collapsible) */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowSellerConfig(!showSellerConfig)}
                                className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 py-1 cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Building2 className="size-3.5 text-slate-400" />
                                    Seller Details: {sellerDetails.name} (Click to customize)
                                </span>
                                {showSellerConfig ? (
                                    <ChevronUp className="size-4" />
                                ) : (
                                    <ChevronDown className="size-4" />
                                )}
                            </button>

                            {showSellerConfig && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Seller Name
                                        </label>
                                        <input
                                            type="text"
                                            value={sellerDetails.name}
                                            onChange={(e) =>
                                                setSellerDetails({ ...sellerDetails, name: e.target.value })
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Seller Email
                                        </label>
                                        <input
                                            type="text"
                                            value={sellerDetails.email}
                                            onChange={(e) =>
                                                setSellerDetails({ ...sellerDetails, email: e.target.value })
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Seller Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={sellerDetails.phone}
                                            onChange={(e) =>
                                                setSellerDetails({ ...sellerDetails, phone: e.target.value })
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Seller GSTIN / Tax ID
                                        </label>
                                        <input
                                            type="text"
                                            value={sellerDetails.taxId}
                                            onChange={(e) =>
                                                setSellerDetails({ ...sellerDetails, taxId: e.target.value })
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Address, City, State, Zip
                                        </label>
                                        <input
                                            type="text"
                                            value={`${sellerDetails.address}, ${sellerDetails.city}, ${sellerDetails.state} - ${sellerDetails.zip}`}
                                            onChange={(e) =>
                                                setSellerDetails({ ...sellerDetails, address: e.target.value })
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section: Line Items */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <ShoppingBag className="size-4 text-teal-600 dark:text-teal-400" />
                                    <span>Line Items</span>
                                </h2>

                                {/* Quick Catalog Picker */}
                                {productsList.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Add from catalog:</span>
                                        <select
                                            value={selectedCatalogProduct}
                                            onChange={(e) => handleAddCatalogProduct(e.target.value)}
                                            disabled={availableProducts.length === 0}
                                            className={`px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 max-w-[200px] ${
                                                availableProducts.length === 0 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                            }`}
                                        >
                                            <option value="">
                                                {availableProducts.length > 0 ? "Select a product..." : "All products added"}
                                            </option>
                                            {availableProducts.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} ({currSym}{p.price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-12 gap-2 items-center"
                                    >
                                        <div className="col-span-12 sm:col-span-5">
                                            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                                Item Description <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Apple iPhone 16 Pro 128GB"
                                                value={item.itemDescription}
                                                onChange={(e) =>
                                                    updateItem(idx, { itemDescription: e.target.value })
                                                }
                                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                                HSN Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 8517"
                                                value={item.hsnCode}
                                                onChange={(e) =>
                                                    updateItem(idx, { hsnCode: e.target.value })
                                                }
                                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            />
                                        </div>
                                        <div className="col-span-3 sm:col-span-1">
                                            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                                Qty <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0.001"
                                                step="any"
                                                required
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateItem(idx, { qty: Number(e.target.value) })
                                                }
                                                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-center"
                                            />
                                        </div>
                                        <div className="col-span-3 sm:col-span-2">
                                            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                                                Price ({currSym}) <span className="text-red-500 font-bold ml-0.5">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                required
                                                value={item.price}
                                                onChange={(e) =>
                                                    updateItem(idx, { price: Number(e.target.value) })
                                                }
                                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-right font-mono"
                                            />
                                        </div>
                                        <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-4">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                                                {currSym}
                                                {item.amount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                disabled={items.length <= 1}
                                                className={`p-1 rounded transition ${items.length <= 1 ? "opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600" : "text-slate-400 hover:text-red-500 cursor-pointer"}`}
                                                title={items.length <= 1 ? "At least one item is required" : "Remove item"}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 py-1 cursor-pointer"
                                >
                                    <Plus className="size-3.5" />
                                    Add Another Item
                                </button>
                            </div>
                        </div>

                        {/* Section: Discount, Tax & Summary */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Sparkles className="size-4 text-teal-600 dark:text-teal-400" />
                                Adjustments & Taxes
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Discount */}
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Discount
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="any"
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                        />
                                        <select
                                            value={discountType}
                                            onChange={(e) =>
                                                setDiscountType(e.target.value as "fixed" | "percentage")
                                            }
                                            className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        >
                                            <option value="fixed">Flat ({currSym})</option>
                                            <option value="percentage">%</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tax / GST Rate */}
                                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        GST / Tax Rate (%)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="any"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(Number(e.target.value))}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                        />
                                        <div className="flex gap-1">
                                            {[0, 5, 12, 18, 28].map((rate) => (
                                                <button
                                                    key={rate}
                                                    type="button"
                                                    onClick={() => setTaxRate(rate)}
                                                    className={`px-2 py-1 text-[11px] rounded border transition cursor-pointer ${
                                                        taxRate === rate
                                                            ? "bg-teal-600 text-white border-teal-600 font-bold"
                                                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                    }`}
                                                >
                                                    {rate}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Payment Details & Notes */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <CreditCard className="size-4 text-teal-600 dark:text-teal-400" />
                                Payment Info & Terms
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDetails.bankName}
                                        onChange={(e) =>
                                            setPaymentDetails({ ...paymentDetails, bankName: e.target.value })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDetails.accountNumber}
                                        onChange={(e) =>
                                            setPaymentDetails({
                                                ...paymentDetails,
                                                accountNumber: e.target.value
                                            })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentDetails.accountName}
                                        onChange={(e) =>
                                            setPaymentDetails({
                                                ...paymentDetails,
                                                accountName: e.target.value
                                            })
                                        }
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        IFSC / Branch Code & UPI
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="IFSC"
                                            value={paymentDetails.ifscCode}
                                            onChange={(e) =>
                                                setPaymentDetails({
                                                    ...paymentDetails,
                                                    ifscCode: e.target.value
                                                })
                                            }
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="UPI ID"
                                            value={paymentDetails.upiId}
                                            onChange={(e) =>
                                                setPaymentDetails({ ...paymentDetails, upiId: e.target.value })
                                            }
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Notes & Instructions
                                </label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter additional terms, notes, or payment instructions..."
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={isFormEmpty}
                                onClick={handleResetForm}
                                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || !isFormValid}
                                title={
                                    !isFormValid
                                        ? "Fill in all required fields (Client Name, Street Address, State, City, Line Items) to enable"
                                        : "Save & Generate Invoice"
                                }
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="size-3.5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-3.5" />
                                        Save & Generate Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Right Column: Live A4 Preview Card (5 cols on xl) */}
                    <div className="xl:col-span-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Eye className="size-3.5 text-teal-600 dark:text-teal-400" />
                                Live A4 Preview
                            </span>
                            <span className="text-[11px] text-slate-400">
                                Updates live as you fill the form
                            </span>
                        </div>

                        {/* Dashed Border Card Matching invoice-generator.prolab.sh */}
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 shadow-sm text-slate-800 dark:text-slate-100 text-xs">
                            {/* Terms Header */}
                            <div className="border-b border-dashed border-slate-200 dark:border-slate-700/80 pb-4 mb-4 grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                        Invoice No
                                    </p>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                                        {invoiceNumber || "INV-YYYY-XXXX"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                        Total Amount
                                    </p>
                                    <p className="font-bold text-sm text-teal-600 dark:text-teal-400 font-mono">
                                        {currSym}
                                        {calculatedTotals.grandTotal.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Seller & Client Grid */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700/80">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                        From
                                    </p>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {sellerDetails.name}
                                    </p>
                                    <p className="text-slate-500 text-[11px]">{sellerDetails.email}</p>
                                    <p className="text-slate-500 text-[11px]">{sellerDetails.phone}</p>
                                    {sellerDetails.taxId && (
                                        <p className="text-slate-400 text-[10px] mt-1 font-mono">
                                            GST: {sellerDetails.taxId}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">
                                        Billed To
                                    </p>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {clientDetails.name || "(Client Name)"}
                                    </p>
                                    {clientDetails.email && (
                                        <p className="text-slate-500 text-[11px]">{clientDetails.email}</p>
                                    )}
                                    {clientDetails.phone && (
                                        <p className="text-slate-500 text-[11px]">{clientDetails.phone}</p>
                                    )}
                                    {clientDetails.city && (
                                        <p className="text-slate-500 text-[11px]">
                                            {clientDetails.city}, {clientDetails.state}
                                        </p>
                                    )}
                                    {clientDetails.taxId && (
                                        <p className="text-slate-400 text-[10px] mt-1 font-mono">
                                            GST: {clientDetails.taxId}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Items List Preview */}
                            <div className="py-4 border-b border-dashed border-slate-200 dark:border-slate-700/80">
                                <table className="w-full text-[11px]">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left pb-2">Description</th>
                                            <th className="text-center pb-2">Qty</th>
                                            <th className="text-right pb-2">Price</th>
                                            <th className="text-right pb-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {items.map((it, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 pr-2">
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                                        {it.itemDescription || "Item name"}
                                                    </p>
                                                    {it.hsnCode && (
                                                        <span className="text-[9px] text-slate-400">
                                                            HSN: {it.hsnCode}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 text-center text-slate-600 dark:text-slate-400">
                                                    {it.qty}
                                                </td>
                                                <td className="py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                                                    {currSym}
                                                    {it.price.toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-2 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                                                    {currSym}
                                                    {it.amount.toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Summary */}
                            <div className="py-4 border-b border-dashed border-slate-200 dark:border-slate-700/80 space-y-1.5 text-[11px]">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-mono">
                                        {currSym}
                                        {calculatedTotals.subtotal.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                                {calculatedTotals.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span className="font-mono">
                                            -{currSym}
                                            {calculatedTotals.discount.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                )}
                                {taxRate > 0 ? (
                                    calculatedTotals.isIntraState ? (
                                        <>
                                            <div className="flex justify-between text-slate-500">
                                                <span>CGST ({(taxRate / 2).toFixed(1)}%)</span>
                                                <span className="font-mono">
                                                    +{currSym}
                                                    {calculatedTotals.cgstAmount.toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>SGST ({(taxRate / 2).toFixed(1)}%)</span>
                                                <span className="font-mono">
                                                    +{currSym}
                                                    {calculatedTotals.sgstAmount.toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2
                                                    })}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-slate-500">
                                            <span>IGST ({taxRate}%)</span>
                                            <span className="font-mono">
                                                +{currSym}
                                                {calculatedTotals.igstAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2
                                                })}
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex justify-between text-slate-500">
                                        <span>GST (0% - Exempt/Zero-Rated)</span>
                                        <span className="font-mono">{currSym}0.00</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span>Grand Total</span>
                                    <span className="font-mono text-teal-600 dark:text-teal-400">
                                        {currSym}
                                        {calculatedTotals.grandTotal.toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Bank Details Snippet */}
                            <div className="pt-3 text-[10px] text-slate-400 space-y-0.5">
                                <p className="font-semibold text-slate-600 dark:text-slate-300">
                                    Bank: {paymentDetails.bankName} | A/C: {paymentDetails.accountNumber}
                                </p>
                                <p>IFSC: {paymentDetails.ifscCode} | UPI: {paymentDetails.upiId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS MODAL AFTER CREATION */}
            {createdInvoiceData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="size-6" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Invoice Generated Successfully!
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Invoice #{createdInvoiceData.invoice?.invoiceNumber} has been saved to the database.
                            </p>
                        </div>

                        {/* Public Link Box */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Unique Public Link
                            </p>
                            <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                                <span className="truncate">
                                    {typeof window !== "undefined"
                                        ? `${window.location.origin}/invoice/${createdInvoiceData.publicId}`
                                        : `/invoice/${createdInvoiceData.publicId}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyCreatedLink}
                                    className="p-1.5 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 rounded transition shrink-0 cursor-pointer"
                                    title="Copy link"
                                >
                                    {copiedLink ? (
                                        <Check className="size-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                            <a
                                href={`/invoice/${createdInvoiceData.publicId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition shadow-sm"
                            >
                                <ExternalLink className="size-4" />
                                Open Public Invoice View
                            </a>

                            <a
                                href={getPdfDownloadUrl(createdInvoiceData.publicId)}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
                            >
                                <Download className="size-4" />
                                Download PDF Directly
                            </a>

                            <button
                                type="button"
                                onClick={() => {
                                    setEmailModalData({
                                        id: createdInvoiceData.invoice?._id || createdInvoiceData._id,
                                        email: clientDetails.email || "",
                                        invoiceNumber: createdInvoiceData.invoice?.invoiceNumber || ""
                                    });
                                    setCustomEmail(clientDetails.email || "");
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold transition border border-teal-200 dark:border-teal-800 cursor-pointer"
                            >
                                <Mail className="size-4" />
                                Email Invoice to Client
                            </button>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                >
                                    Create Another
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCreatedInvoiceData(null);
                                        handleTabChange("list");
                                    }}
                                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-right cursor-pointer"
                                >
                                    View All Invoices →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ALL INVOICES LIST */}
            {activeTab === "list" && (
                <div className="space-y-4">
                    {/* Filter and Search Bar */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by invoice #, client name, or public ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setInvoicePage(1);
                                        fetchInvoices(1, invoicePageSize);
                                    }
                                }}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setInvoicePage(1);
                                }}
                                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-teal-500/20"
                            >
                                <option value="all">All Statuses</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="draft">Draft</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => fetchInvoices(invoicePage, invoicePageSize)}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                title="Refresh"
                            >
                                <RefreshCw
                                    className={`size-4 text-teal-600 dark:text-teal-400 ${loadingInvoices ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Table / List View */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        {loadingInvoices ? (
                            <div className="py-16 text-center text-slate-400 text-xs">
                                <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                                Loading invoices...
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                                <Receipt className="size-10 mx-auto text-slate-300 dark:text-slate-600" />
                                <p className="font-semibold text-slate-700 dark:text-slate-300">
                                    No invoices found
                                </p>
                                <p className="text-slate-400">
                                    Create your first invoice using the "Create Invoice" tab above.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px]">
                                                Invoice No
                                            </th>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px]">
                                                Client
                                            </th>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px]">
                                                Issued
                                            </th>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px]">
                                                Total
                                            </th>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px]">
                                                Status
                                            </th>
                                            <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">
                                                Public Link & Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {invoices.map((inv) => {
                                            const sym = getCurrencySymbol(inv.currency || "INR");
                                            return (
                                                <tr
                                                    key={inv._id}
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                                                >
                                                    <td className="py-3 px-4">
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {inv.invoiceNumber}
                                                        </span>
                                                        <span className="block text-[10px] text-slate-400 font-mono">
                                                            {inv.publicId}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                                            {inv.clientDetails?.name || "N/A"}
                                                        </p>
                                                        {inv.clientDetails?.email && (
                                                            <p className="text-[11px] text-slate-400">
                                                                {inv.clientDetails.email}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                                        {new Date(inv.issueDate).toLocaleDateString("en-GB", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-white">
                                                        {sym}
                                                        {Number(inv.totalAmount || 0).toLocaleString("en-IN", {
                                                            minimumFractionDigits: 2
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <InvoiceStatusDropdown
                                                            status={inv.status}
                                                            onChange={(next) => handleUpdateStatus(inv._id, next)}
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyListLink(inv.publicId)}
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                                                title="Copy public link"
                                                            >
                                                                {copiedListId === inv.publicId ? (
                                                                    <Check className="size-3.5 text-emerald-600" />
                                                                ) : (
                                                                    <Copy className="size-3.5" />
                                                                )}
                                                            </button>

                                                            <a
                                                                href={`/invoice/${inv.publicId}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                                                title="Open public view"
                                                            >
                                                                <Eye className="size-3.5" />
                                                            </a>

                                                            <a
                                                                href={getPdfDownloadUrl(inv.publicId)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer"
                                                                title="Download PDF"
                                                            >
                                                                <Download className="size-3.5" />
                                                            </a>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEmailModalData({
                                                                        id: inv._id,
                                                                        email: inv.clientDetails?.email || "",
                                                                        invoiceNumber: inv.invoiceNumber
                                                                    });
                                                                    setCustomEmail(inv.clientDetails?.email || "");
                                                                }}
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition cursor-pointer"
                                                                title="Email Invoice"
                                                            >
                                                                <Mail className="size-3.5" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteInvoice(inv)}
                                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                                                title="Delete invoice"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {invoices.length > 0 && (
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <Pagination
                                    currentPage={invoicePage}
                                    totalPages={invoiceTotalPages}
                                    totalItems={invoiceTotal}
                                    pageSize={invoicePageSize}
                                    itemName="invoices"
                                    alwaysShow={true}
                                    onPageChange={(p) => setInvoicePage(p)}
                                    variant="admin"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* EMAIL DISPATCH MODAL */}
            {emailModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Mail className="size-4 text-teal-600 dark:text-teal-400" />
                                Send Invoice by Email
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEmailModalData(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500">
                            Sending PDF attachment for invoice <strong>{emailModalData.invoiceNumber}</strong>.
                        </p>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Recipient Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={customEmail}
                                onChange={(e) => setCustomEmail(e.target.value)}
                                placeholder="client@example.com"
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEmailModalData(null)}
                                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={sendingEmailId === emailModalData.id}
                                onClick={() => handleSendInvoiceEmail(emailModalData.id, customEmail)}
                                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {sendingEmailId === emailModalData.id ? (
                                    <>
                                        <RefreshCw className="size-3.5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-3.5" />
                                        Send Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminInvoicesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-teal-600" />
                </div>
            }
        >
            <AdminInvoicesContent />
        </Suspense>
    );
}
