"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

import {
    FileText,
    Plus,
    Trash2,
    Loader2,
    Download,
    Search,
    Building,
    MapPin,
    Hash,
    Sparkles,
    RefreshCw,
    CheckCircle2,
    Save,
    Mail,
    Send,
    ChevronDown,
    X,
    Users
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/app/_context/ToastContext";

interface CatalogItem {
    _id: string;
    name: string;
    price: number;
    hsnCode?: string;
    unit?: string;
    description?: string;
    cgst?: number;
    sgst?: number;
}

interface CompanyRecord {
    _id: string;
    name: string;
    location?: string;
    gstNumber?: string;
}

interface ClientRecord {
    _id: string;
    name: string;
    company?: string;
    gstin?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface QuotationLineItem {
    id: string; // Internal temporary ID for React key
    itemId?: string; // Optional reference ID if pre-filled from catalog
    name: string;
    description?: string;
    price: number;
    unit: string;
    quantity: number;
    hsnCode: string;
    cgst: number;
    sgst: number;
}

// Indian states / union territories with their GST state codes
const INDIAN_STATES: { name: string; code: string }[] = [
    { name: "Jammu and Kashmir", code: "01" },
    { name: "Himachal Pradesh", code: "02" },
    { name: "Punjab", code: "03" },
    { name: "Chandigarh", code: "04" },
    { name: "Uttarakhand", code: "05" },
    { name: "Haryana", code: "06" },
    { name: "Delhi", code: "07" },
    { name: "Rajasthan", code: "08" },
    { name: "Uttar Pradesh", code: "09" },
    { name: "Bihar", code: "10" },
    { name: "Sikkim", code: "11" },
    { name: "Arunachal Pradesh", code: "12" },
    { name: "Nagaland", code: "13" },
    { name: "Manipur", code: "14" },
    { name: "Mizoram", code: "15" },
    { name: "Tripura", code: "16" },
    { name: "Meghalaya", code: "17" },
    { name: "Assam", code: "18" },
    { name: "West Bengal", code: "19" },
    { name: "Jharkhand", code: "20" },
    { name: "Odisha", code: "21" },
    { name: "Chhattisgarh", code: "22" },
    { name: "Madhya Pradesh", code: "23" },
    { name: "Gujarat", code: "24" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
    { name: "Maharashtra", code: "27" },
    { name: "Karnataka", code: "29" },
    { name: "Goa", code: "30" },
    { name: "Lakshadweep", code: "31" },
    { name: "Kerala", code: "32" },
    { name: "Tamil Nadu", code: "33" },
    { name: "Puducherry", code: "34" },
    { name: "Andaman and Nicobar Islands", code: "35" },
    { name: "Telangana", code: "36" },
    { name: "Andhra Pradesh", code: "37" },
    { name: "Ladakh", code: "38" },
    { name: "Other Territory", code: "97" }
];

export default function CreateQuotationView() {
    const { showToast } = useToast();
    const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [selectedCatalogId, setSelectedCatalogId] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Searchable catalog combobox state (Local search, zero network calls)
    const [catalogSearch, setCatalogSearch] = useState("");
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const catalogDropdownRef = React.useRef<HTMLDivElement>(null);

    // Searchable state combobox state (Local search, zero network calls)
    const [isStateOpen, setIsStateOpen] = useState(false);
    const stateDropdownRef = useRef<HTMLDivElement>(null);

    // Existing clients & companies (for prefilling company details) + searchable combobox state
    const [companies, setCompanies] = useState<CompanyRecord[]>([]);
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [clientSearch, setClientSearch] = useState("");
    const [isClientOpen, setIsClientOpen] = useState(false);
    const clientDropdownRef = useRef<HTMLDivElement>(null);

    // Company Name autocomplete state
    const [isCompanyNameOpen, setIsCompanyNameOpen] = useState(false);
    const companyNameDropdownRef = useRef<HTMLDivElement>(null);

    // Close catalog / state / client / company dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target as Node)) {
                setIsCatalogOpen(false);
            }
            if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
                setIsStateOpen(false);
            }
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setIsClientOpen(false);
            }
            if (companyNameDropdownRef.current && !companyNameDropdownRef.current.contains(event.target as Node)) {
                setIsCompanyNameOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buyer Information State
    const [buyer, setBuyer] = useState({
        name: "",
        address: "",
        gstin: "",
        stateName: "",
        toEmail: ""
    });
    const [emailInput, setEmailInput] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Helper to add email tag(s)
    const handleAddEmailTag = (rawText: string) => {
        if (!rawText || !rawText.trim()) return;

        const newEmails = rawText
            .split(/[,;\s]+/)
            .map(e => e.trim())
            .filter(e => e.length > 0 && e.includes("@"));

        if (newEmails.length === 0) return;

        const existingEmails = buyer.toEmail
            ? buyer.toEmail.split(/[,;\s]+/).map(e => e.trim()).filter(e => e.includes("@"))
            : [];

        const updatedEmails = Array.from(new Set([...existingEmails, ...newEmails]));
        setBuyer(prev => ({ ...prev, toEmail: updatedEmails.join(", ") }));
        setEmailInput("");
    };

    // Helper to remove an email tag by index
    const handleRemoveEmailTag = (indexToRemove: number) => {
        const existingEmails = buyer.toEmail
            ? buyer.toEmail.split(/[,;\s]+/).map(e => e.trim()).filter(e => e.includes("@"))
            : [];
        const updated = existingEmails.filter((_, idx) => idx !== indexToRemove);
        setBuyer(prev => ({ ...prev, toEmail: updated.join(", ") }));
    };

    // Quotation Line Items State
    const [items, setItems] = useState<QuotationLineItem[]>([]);

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchCatalogItems();
        fetchClientsAndCompanies();
    }, []);

    useEffect(() => {
        const loadId = searchParams?.get("load");
        if (loadId) {
            loadSavedQuotation(loadId);
        }
    }, [searchParams]);

    const loadSavedQuotation = async (id: string) => {
        try {
            const { data } = await api.get(`/quotation/saved/${id}`);
            if (data) {
                if (data.buyer) {
                    setBuyer({
                        name: data.buyer.name || "",
                        address: data.buyer.address || "",
                        gstin: data.buyer.gstin || "",
                        stateName: data.buyer.stateName || "",
                        toEmail: data.buyer.toEmail || ""
                    });
                }
                if (Array.isArray(data.items) && data.items.length > 0) {
                    setItems(
                        data.items.map((i: any, index: number) => ({
                            id: `loaded-${index}-${Date.now()}`,
                            itemId: i.itemId || i._id,
                            name: i.name,
                            description: i.description || "",
                            price: i.price,
                            unit: i.unit || "Nos",
                            quantity: i.quantity || 1,
                            hsnCode: i.hsnCode || "",
                            cgst: i.cgst || 0,
                            sgst: i.sgst || 0
                        }))
                    );
                }
                setSavedQuotationId(data._id);
                showToast(`Loaded quotation template for "${data.buyer?.name || data.title}" into Admin Workspace!`, "success");
            }
        } catch (error) {
            console.error("Failed to load saved quotation into admin view", error);
        }
    };

    const getStateFromGstin = (gstin?: string): string => {
        if (!gstin || typeof gstin !== "string") return "";
        const clean = gstin.trim().replace(/[^0-9A-Za-z]/g, "");
        if (clean.length < 2) return "";
        const code = clean.substring(0, 2);
        const match = INDIAN_STATES.find(s => s.code === code);
        return match ? `${match.name} (${match.code})` : "";
    };

    const fetchClientsAndCompanies = async () => {
        try {
            const [clientsRes, companiesRes] = await Promise.all([
                api.get("/clients").catch(() => ({ data: [] })),
                api.get("/companies").catch(() => ({ data: [] }))
            ]);
            if (Array.isArray(clientsRes.data)) setClients(clientsRes.data);
            if (Array.isArray(companiesRes.data)) setCompanies(companiesRes.data);
        } catch (error) {
            console.error("Failed to load clients and companies", error);
        }
    };

    const fillBuyerDetails = async (params: {
        name?: string;
        gstin?: string;
        address?: string;
        toEmail?: string;
        stateName?: string;
    }) => {
        const compName = params.name?.trim() || "";
        let resolvedGstin = params.gstin?.trim() || "";
        let resolvedAddress = params.address?.trim() || "";
        let resolvedEmail = params.toEmail?.trim() || "";
        let resolvedState = params.stateName?.trim() || "";

        // 1. Look up in companies & clients list if details are missing
        if (compName) {
            const lower = compName.toLowerCase();
            const matchingCompany = companies.find(c => c.name.trim().toLowerCase() === lower);
            const matchingClient = clients.find(c =>
                (c.company && c.company.trim().toLowerCase() === lower) ||
                c.name.trim().toLowerCase() === lower
            );

            if (!resolvedGstin) {
                resolvedGstin = matchingCompany?.gstNumber || matchingClient?.gstin || "";
            }
            if (!resolvedAddress) {
                resolvedAddress = matchingCompany?.location || (matchingClient as any)?.address || "";
            }
            if (!resolvedEmail) {
                resolvedEmail = matchingClient?.email || "";
            }
        }

        // 2. Auto-derive state from GSTIN if state is empty
        if (!resolvedState && resolvedGstin) {
            resolvedState = getStateFromGstin(resolvedGstin);
        }

        // 3. Fallback: match state name inside location text if still empty
        if (!resolvedState && resolvedAddress) {
            const addrLower = resolvedAddress.toLowerCase();
            const match = INDIAN_STATES.find(s => addrLower.includes(s.name.toLowerCase()));
            if (match) {
                resolvedState = `${match.name} (${match.code})`;
            }
        }

        // 4. If email is still empty and we have a company name, fetch from CRM contacts
        if (!resolvedEmail && compName) {
            try {
                const { data } = await api.get("/crm/contacts/emails", {
                    params: { company: compName }
                });
                if (Array.isArray(data) && data.length > 0) {
                    resolvedEmail = data.join(", ");
                }
            } catch (_) {}
        }

        setBuyer(prev => ({
            ...prev,
            name: compName || prev.name,
            gstin: resolvedGstin || prev.gstin,
            address: resolvedAddress || prev.address,
            toEmail: resolvedEmail || prev.toEmail,
            stateName: resolvedState || prev.stateName
        }));

        if (compName) {
            showToast(`Auto-filled details for "${compName}"`, "info");
        }
    };

    const handleSelectUnifiedEntry = (entry: {
        name: string;
        gstin?: string;
        location?: string;
        email?: string;
    }) => {
        fillBuyerDetails({
            name: entry.name,
            gstin: entry.gstin,
            address: entry.location,
            toEmail: entry.email
        });
        setIsClientOpen(false);
        setIsCompanyNameOpen(false);
        setClientSearch("");
    };

    const handleSelectClient = (client: ClientRecord) => {
        const compName = client.company?.trim() || client.name;
        fillBuyerDetails({
            name: compName,
            gstin: client.gstin,
            address: (client as any)?.address,
            toEmail: client.email
        });
        setIsClientOpen(false);
        setClientSearch("");
    };

    const handleSelectCompany = (company: CompanyRecord) => {
        fillBuyerDetails({
            name: company.name,
            gstin: company.gstNumber,
            address: company.location
        });
        setIsCompanyNameOpen(false);
        setIsClientOpen(false);
        setClientSearch("");
    };

    const handleGstinChange = (value: string) => {
        const uppercaseGstin = value.toUpperCase();
        const autoState = getStateFromGstin(uppercaseGstin);

        // Check if any saved company has this GSTIN
        const matchingCompany = companies.find(c => c.gstNumber && c.gstNumber.toUpperCase() === uppercaseGstin);
        const matchingClient = clients.find(c => c.gstin && c.gstin.toUpperCase() === uppercaseGstin);

        setBuyer(prev => ({
            ...prev,
            gstin: uppercaseGstin,
            stateName: autoState || prev.stateName,
            name: prev.name || matchingCompany?.name || matchingClient?.company || matchingClient?.name || "",
            address: prev.address || matchingCompany?.location || (matchingClient as any)?.address || "",
            toEmail: prev.toEmail || matchingClient?.email || ""
        }));
    };

    const fetchCatalogItems = async () => {
        setLoadingCatalog(true);
        try {
            const [quotationItemsRes, mainProductsRes] = await Promise.all([
                api.get("/quotation-items/all").catch(() => ({ data: [] })),
                api.get("/products?includeInactive=true").catch(() => ({ data: [] }))
            ]);

            const list: CatalogItem[] = [];

            if (Array.isArray(quotationItemsRes.data)) {
                quotationItemsRes.data.forEach((item: any) => {
                    list.push({
                        _id: item._id,
                        name: item.name,
                        price: item.price || 0,
                        hsnCode: item.hsnCode || "",
                        description: item.description || "",
                        unit: item.unit || "Nos",
                        cgst: item.cgst || 0,
                        sgst: item.sgst || 0
                    });
                });
            }

            if (Array.isArray(mainProductsRes.data)) {
                mainProductsRes.data.forEach((p: any) => {
                    if (!list.some(existing => existing.name.toLowerCase() === p.name.toLowerCase())) {
                        list.push({
                            _id: p._id,
                            name: p.name,
                            price: p.price || 0,
                            hsnCode: p.hsnCode || "",
                            description: p.description || "",
                            unit: p.packUnit || "Nos",
                            cgst: p.cgst !== undefined ? p.cgst : 9,
                            sgst: p.sgst !== undefined ? p.sgst : 9
                        });
                    }
                });
            }

            setCatalogItems(list);
        } catch (error) {
            console.error("Failed to load catalog items", error);
        } finally {
            setLoadingCatalog(false);
        }
    };

    const handleAddSpecificCatalogItem = (catalogObj: CatalogItem) => {
        const newItem: QuotationLineItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: catalogObj._id,
            name: catalogObj.name,
            description: catalogObj.description || "",
            price: catalogObj.price,
            unit: catalogObj.unit || "Nos",
            quantity: 1,
            hsnCode: catalogObj.hsnCode || "",
            cgst: catalogObj.cgst ?? 9,
            sgst: catalogObj.sgst ?? 9
        };

        setItems(prev => [...prev, newItem]);
        setSelectedCatalogId("");
    };

    const handleAddFromCatalog = () => {
        if (!selectedCatalogId) return;
        const catalogObj = catalogItems.find(c => c._id === selectedCatalogId);
        if (catalogObj) {
            handleAddSpecificCatalogItem(catalogObj);
        }
    };

    const handleAddCustomItem = () => {
        const newItem: QuotationLineItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Custom Product / Service Item",
            description: "",
            price: 1000,
            unit: "Nos",
            quantity: 1,
            hsnCode: "9983",
            cgst: 9,
            sgst: 9
        };
        setItems(prev => [...prev, newItem]);
        showToast("Added blank custom line item", "info");
    };

    const handleItemChange = (id: string, field: keyof QuotationLineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            return {
                ...item,
                [field]: value
            };
        }));
    };

    const handleRemoveItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
        showToast("Removed line item", "info");
    };

    const descTextareaRefs = React.useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

    const handleInsertBullet = (itemId: string) => {
        const textarea = descTextareaRefs.current[itemId];
        const item = items.find(i => i.id === itemId);
        const value = item?.description || "";

        if (!textarea) {
            const nextVal = value ? `${value}\n• ` : "• ";
            handleItemChange(itemId, "description", nextVal);
            return;
        }

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart !== selectionEnd) {
            const selectedText = value.substring(selectionStart, selectionEnd);
            const lines = selectedText.split("\n");
            const bulleted = lines.map(line => /^[\*\-•]\s+/.test(line.trim()) ? line : `• ${line}`).join("\n");
            const nextVal = value.substring(0, selectionStart) + bulleted + value.substring(selectionEnd);
            handleItemChange(itemId, "description", nextVal);
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = selectionStart;
                textarea.selectionEnd = selectionStart + bulleted.length;
            }, 0);
        } else {
            const textBefore = value.substring(0, selectionStart);
            const needsNewline = textBefore.length > 0 && !textBefore.endsWith("\n");
            const insertion = needsNewline ? "\n• " : "• ";
            const nextVal = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
            handleItemChange(itemId, "description", nextVal);
            setTimeout(() => {
                textarea.focus();
                const newPos = selectionStart + insertion.length;
                textarea.selectionStart = textarea.selectionEnd = newPos;
            }, 0);
        }
    };

    const handleInsertBold = (itemId: string) => {
        const textarea = descTextareaRefs.current[itemId];
        const item = items.find(i => i.id === itemId);
        const value = item?.description || "";
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const selected = value.substring(selectionStart, selectionEnd) || "bold text";
        const insertion = `**${selected}**`;
        const nextVal = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
        handleItemChange(itemId, "description", nextVal);
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = selectionStart + 2;
            textarea.selectionEnd = selectionStart + 2 + selected.length;
        }, 0);
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, itemId: string) => {
        if (e.key === "Enter" && !e.shiftKey) {
            const textarea = e.currentTarget;
            const { selectionStart, selectionEnd, value } = textarea;
            if (selectionStart !== selectionEnd) return;

            const textBeforeCursor = value.substring(0, selectionStart);
            const lastNewline = textBeforeCursor.lastIndexOf("\n");
            const currentLine = textBeforeCursor.substring(lastNewline + 1);

            const bulletMatch = currentLine.match(/^(\s*)([•\-\*])\s+/);
            if (bulletMatch) {
                e.preventDefault();
                // If current line has ONLY the bullet and no content, pressing Enter clears the bullet (exits list)
                if (currentLine.trim() === bulletMatch[2]) {
                    const startOfCurrentLine = lastNewline === -1 ? 0 : lastNewline + 1;
                    const newValue = value.substring(0, startOfCurrentLine) + value.substring(selectionStart);
                    handleItemChange(itemId, "description", newValue);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = startOfCurrentLine;
                    }, 0);
                    return;
                }

                // Otherwise, automatically start next line with bullet
                const indent = bulletMatch[1];
                const insertion = `\n${indent}• `;
                const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
                handleItemChange(itemId, "description", newValue);
                setTimeout(() => {
                    const nextPos = selectionStart + insertion.length;
                    textarea.selectionStart = textarea.selectionEnd = nextPos;
                }, 0);
            }
        }
    };

    // Filter out catalog items that are already added to quotation line items
    const availableCatalogItems = catalogItems.filter(c =>
        !items.some(item => (item.itemId && item.itemId === c._id) || item.name.trim().toLowerCase() === c.name.trim().toLowerCase())
    );

    // Filter available catalog items locally in-memory by search query (zero backend calls)
    const filteredCatalogItems = availableCatalogItems.filter(c =>
        c.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (c.hsnCode && c.hsnCode.toLowerCase().includes(catalogSearch.toLowerCase()))
    );

    // Filter existing clients locally in-memory by search query
    const filteredClients = clients.filter(c => {
        const q = clientSearch.toLowerCase();
        if (!q) return true;
        return (
            c.name?.toLowerCase().includes(q) ||
            c.company?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.gstin?.toLowerCase().includes(q)
        );
    });

    // Unified list of saved clients and companies matching clientSearch
    const filteredClientAndCompanyList = useMemo(() => {
        const q = clientSearch.trim().toLowerCase();
        const results: Array<{
            id: string;
            type: 'company' | 'client';
            name: string;
            secondaryName?: string;
            gstin?: string;
            location?: string;
            email?: string;
        }> = [];

        companies.forEach(comp => {
            if (!q || comp.name.toLowerCase().includes(q) || (comp.location && comp.location.toLowerCase().includes(q)) || (comp.gstNumber && comp.gstNumber.toLowerCase().includes(q))) {
                const cl = clients.find(c => c.company && c.company.trim().toLowerCase() === comp.name.trim().toLowerCase());
                results.push({
                    id: `comp-${comp._id}`,
                    type: 'company',
                    name: comp.name,
                    gstin: comp.gstNumber,
                    location: comp.location,
                    email: cl?.email
                });
            }
        });

        clients.forEach(cl => {
            const clientMatch = !q || cl.name.toLowerCase().includes(q) || (cl.company && cl.company.toLowerCase().includes(q)) || (cl.email && cl.email.toLowerCase().includes(q)) || (cl.gstin && cl.gstin.toLowerCase().includes(q));
            if (clientMatch) {
                const displayName = cl.company?.trim() || cl.name;
                if (!results.some(r => r.name.toLowerCase() === displayName.toLowerCase())) {
                    results.push({
                        id: `client-${cl._id}`,
                        type: 'client',
                        name: displayName,
                        secondaryName: cl.company ? cl.name : undefined,
                        gstin: cl.gstin,
                        email: cl.email
                    });
                }
            }
        });

        return results;
    }, [clientSearch, companies, clients]);

    // Suggestions matching typed buyer.name
    const matchingCompanySuggestions = useMemo(() => {
        const q = buyer.name.trim().toLowerCase();
        if (!q || q.length < 1) return [];

        const results: Array<{
            id: string;
            name: string;
            gstin?: string;
            location?: string;
            email?: string;
        }> = [];

        companies.forEach(comp => {
            if (comp.name.toLowerCase().includes(q)) {
                const cl = clients.find(c => c.company && c.company.trim().toLowerCase() === comp.name.trim().toLowerCase());
                results.push({
                    id: `comp-${comp._id}`,
                    name: comp.name,
                    gstin: comp.gstNumber,
                    location: comp.location,
                    email: cl?.email
                });
            }
        });

        clients.forEach(cl => {
            const displayName = cl.company?.trim() || cl.name;
            if (displayName.toLowerCase().includes(q) && !results.some(r => r.name.toLowerCase() === displayName.toLowerCase())) {
                results.push({
                    id: `client-${cl._id}`,
                    name: displayName,
                    gstin: cl.gstin,
                    email: cl.email
                });
            }
        });

        return results.slice(0, 6);
    }, [buyer.name, companies, clients]);

    // Filter predefined Indian states locally in-memory by search query
    const filteredStates = INDIAN_STATES.filter(s =>
        s.name.toLowerCase().includes(buyer.stateName.toLowerCase()) ||
        s.code.includes(buyer.stateName.trim())
    );

    // Financial Calculations
    const taxableTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    const cgstTotal = items.reduce((sum, item) => {
        const lineVal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        return sum + (lineVal * (Number(item.cgst) || 0)) / 100;
    }, 0);
    const sgstTotal = items.reduce((sum, item) => {
        const lineVal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
        return sum + (lineVal * (Number(item.sgst) || 0)) / 100;
    }, 0);
    const grandTotal = taxableTotal + cgstTotal + sgstTotal;

    const [isSaving, setIsSaving] = useState(false);
    const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);

    const persistQuotation = async () => {
        const { data } = await api.post("/quotation/save", {
            id: savedQuotationId,
            title: `Quotation for ${buyer.name.trim()}`,
            buyer,
            items: items.map(i => ({
                itemId: i.itemId || i.id,
                name: i.name,
                description: i.description || "",
                price: i.price,
                unit: i.unit,
                quantity: i.quantity,
                cgst: i.cgst,
                sgst: i.sgst,
                hsnCode: i.hsnCode
            }))
        });

        if (data.quotation) {
            setSavedQuotationId(data.quotation._id);
        }
        return data;
    };

    const handleSaveQuotation = async () => {
        if (items.length === 0) {
            showToast("Please add at least one line item to save quotation.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please specify Company Name to save.", "warning");
            return;
        }

        setIsSaving(true);
        try {
            const data = await persistQuotation();
            showToast(data.msg || "Quotation saved successfully!", "success");
        } catch (error: any) {
            console.error("Save quotation error:", error);
            showToast(error.response?.data?.msg || "Failed to save quotation.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGeneratePdf = async () => {

        if (items.length === 0) {
            showToast("Please add at least one line item to generate a quotation.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please specify Company Name.", "warning");
            return;
        }

        setIsGenerating(true);
        try {
            // First save/persist the Quotation to the database
            const saveData = await persistQuotation();
            const quotationNumber = saveData?.quotation?.quotationNumber;

            const payloadItems = items.map(item => {
                const obj: any = {
                    name: item.name,
                    description: item.description || "",
                    price: Number(item.price) || 0,
                    unit: item.unit || "Nos",
                    quantity: Number(item.quantity) || 1,
                    hsnCode: item.hsnCode || "",
                    cgst: Number(item.cgst) || 0,
                    sgst: Number(item.sgst) || 0
                };
                if (item.itemId && typeof item.itemId === 'string' && /^[0-9a-fA-F]{24}$/.test(item.itemId)) {
                    obj.itemId = item.itemId;
                }
                return obj;
            });

            const response = await api.post(
                "/quotation/generate",
                { items: payloadItems, buyer, title: "Quotation", quotationNumber },
                { responseType: "blob" }
            );

            const disposition = response.headers["content-disposition"];
            const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `${quotationNumber || 'QT'}-${(buyer.name || 'Quotation').replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast("Quotation saved & PDF downloaded successfully!", "success");
        } catch (error: any) {
            console.error("Quotation generation error:", error);
            let errMsg = "Failed to generate quotation PDF.";
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    errMsg = json.msg || json.message || errMsg;
                } catch (_) {}
            } else if (error.response?.data?.msg) {
                errMsg = error.response.data.msg;
            }
            showToast(errMsg, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendEmail = async () => {
        if (items.length === 0) {
            showToast("Please add at least one line item to send a quotation email.", "warning");
            return;
        }
        if (!buyer.name.trim()) {
            showToast("Please specify Company Name.", "warning");
            return;
        }

        const emailList = buyer.toEmail
            ? buyer.toEmail.split(/[,;\s]+/).map(e => e.trim()).filter(e => e.includes("@"))
            : [];

        if (emailList.length === 0) {
            showToast("Please enter at least one valid Recipient Email Address (TO).", "warning");
            return;
        }

        setIsSendingEmail(true);
        try {
            // First save/persist the Quotation to the database
            const saveData = await persistQuotation();
            const quotationNumber = saveData?.quotation?.quotationNumber;

            const payloadItems = items.map(item => {
                const obj: any = {
                    name: item.name,
                    description: item.description || "",
                    price: Number(item.price) || 0,
                    unit: item.unit || "Nos",
                    quantity: Number(item.quantity) || 1,
                    hsnCode: item.hsnCode || "",
                    cgst: Number(item.cgst) || 0,
                    sgst: Number(item.sgst) || 0
                };
                if (item.itemId && typeof item.itemId === 'string' && /^[0-9a-fA-F]{24}$/.test(item.itemId)) {
                    obj.itemId = item.itemId;
                }
                return obj;
            });

            const { data } = await api.post("/quotation/send-email", {
                items: payloadItems,
                buyer,
                toEmail: buyer.toEmail,
                title: "Quotation",
                quotationNumber
            });

            showToast(data.msg || `Quotation saved & emailed to ${emailList.join(", ")}.`, "success");
        } catch (error: any) {
            console.error("Email sending error:", error);
            showToast(error.response?.data?.msg || "Failed to send quotation email.", "error");
        } finally {
            setIsSendingEmail(false);
        }
    };

    return (
        <div className="space-y-5 text-sm">
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Build a GST quotation, save it, and share it with the buyer.
                </p>

                <button
                    onClick={fetchCatalogItems}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
                    title="Reload catalog items"
                >
                    <RefreshCw className={`size-3.5 ${loadingCatalog ? 'animate-spin' : ''}`} /> Refresh Catalog
                </button>
            </div>

            {/* Company Info Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <Building className="size-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Company Details</h3>
                </div>

                {/* Select Existing Client / Company (prefills company details below) */}
                <div className="relative" ref={clientDropdownRef}>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Select Existing Client / Company</span>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 font-normal">Auto-fills details below</span>
                    </label>
                    <div className="relative flex items-center">
                        <Users className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder={clients.length === 0 && companies.length === 0 ? "-- No saved records --" : "Search saved clients or companies by name, GSTIN, location, email..."}
                            value={clientSearch}
                            onChange={(e) => { setClientSearch(e.target.value); setIsClientOpen(true); }}
                            onFocus={() => setIsClientOpen(true)}
                            disabled={clients.length === 0 && companies.length === 0}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50 transition"
                        />
                        {clientSearch ? (
                            <button
                                type="button"
                                onClick={() => setClientSearch("")}
                                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                title="Clear search"
                            >
                                <X className="size-3.5" />
                            </button>
                        ) : (
                            <ChevronDown className="absolute right-2.5 size-3.5 text-slate-400 pointer-events-none" />
                        )}
                    </div>

                    {isClientOpen && (clients.length > 0 || companies.length > 0) && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredClientAndCompanyList.length === 0 ? (
                                <div className="px-4 py-4 text-xs text-slate-400 text-center">
                                    No matching clients or companies found
                                </div>
                            ) : (
                                filteredClientAndCompanyList.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectUnifiedEntry({
                                            name: item.name,
                                            gstin: item.gstin,
                                            location: item.location,
                                            email: item.email
                                        })}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center justify-between gap-3 group cursor-pointer"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                                    {item.name}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                                    item.type === 'company'
                                                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-slate-400">
                                                {item.secondaryName && (
                                                    <span className="truncate">Contact: {item.secondaryName}</span>
                                                )}
                                                {item.gstin && (
                                                    <span className="font-mono text-slate-500 dark:text-slate-400">• GST: {item.gstin}</span>
                                                )}
                                                {item.location && (
                                                    <span className="truncate">• {item.location}</span>
                                                )}
                                            </div>
                                        </div>
                                        {item.email && (
                                            <span className="text-xs text-slate-400 shrink-0 truncate max-w-[12rem]">{item.email}</span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name (with autocomplete suggestions) */}
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                            <span>Company Name <span className="text-rose-500">*</span></span>
                            {matchingCompanySuggestions.length > 0 && isCompanyNameOpen && (
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">Found in records</span>
                            )}
                        </label>
                        <div className="relative" ref={companyNameDropdownRef}>
                            <Building className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="e.g. Bhavin and Co"
                                value={buyer.name}
                                onChange={(e) => {
                                    setBuyer(prev => ({ ...prev, name: e.target.value }));
                                    setIsCompanyNameOpen(true);
                                }}
                                onFocus={() => {
                                    if (buyer.name.trim()) setIsCompanyNameOpen(true);
                                }}
                                onBlur={() => {
                                    // If exact match found in companies or clients, auto-fill any missing fields
                                    if (buyer.name.trim()) {
                                        const lower = buyer.name.trim().toLowerCase();
                                        const foundComp = companies.find(c => c.name.trim().toLowerCase() === lower);
                                        const foundCl = clients.find(c =>
                                            (c.company && c.company.trim().toLowerCase() === lower) ||
                                            c.name.trim().toLowerCase() === lower
                                        );
                                        if (foundComp || foundCl) {
                                            fillBuyerDetails({
                                                name: foundComp?.name || foundCl?.company || buyer.name,
                                                gstin: buyer.gstin || foundComp?.gstNumber || foundCl?.gstin,
                                                address: buyer.address || foundComp?.location || (foundCl as any)?.address,
                                                toEmail: buyer.toEmail || foundCl?.email
                                            });
                                        }
                                    }
                                }}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />

                            {/* Autocomplete suggestions dropdown when typing */}
                            {isCompanyNameOpen && matchingCompanySuggestions.length > 0 && (
                                <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 divide-y divide-slate-100 dark:divide-slate-800">
                                    {matchingCompanySuggestions.map(sug => (
                                        <button
                                            key={sug.id}
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSelectUnifiedEntry({
                                                    name: sug.name,
                                                    gstin: sug.gstin,
                                                    location: sug.location,
                                                    email: sug.email
                                                });
                                            }}
                                            className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center justify-between gap-2 group cursor-pointer"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                                    {sug.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400 mt-0.5">
                                                    {sug.gstin && (
                                                        <span className="font-mono text-slate-500 dark:text-slate-400">GST: {sug.gstin}</span>
                                                    )}
                                                    {sug.location && (
                                                        <span className="truncate">• {sug.location}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {sug.email && (
                                                <span className="text-xs text-slate-400 shrink-0 truncate max-w-[12rem]">{sug.email}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GSTIN / UIN Number (auto-detects State Name on change) */}
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                            <span>GSTIN / UIN Number</span>
                            {buyer.gstin && getStateFromGstin(buyer.gstin) && (
                                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">
                                    State: {getStateFromGstin(buyer.gstin)}
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="27AAACG0000A1Z5"
                                value={buyer.gstin}
                                onChange={(e) => handleGstinChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* State Name */}
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                            State Name
                        </label>
                        <div className="relative" ref={stateDropdownRef}>
                            <input
                                type="text"
                                placeholder="Search state... e.g. Maharashtra (27)"
                                value={buyer.stateName}
                                onChange={(e) => {
                                    setBuyer({ ...buyer, stateName: e.target.value });
                                    setIsStateOpen(true);
                                }}
                                onFocus={() => setIsStateOpen(true)}
                                className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                            {buyer.stateName ? (
                                <button
                                    type="button"
                                    onClick={() => setBuyer({ ...buyer, stateName: "" })}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title="Clear"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : (
                                <ChevronDown className="absolute right-2.5 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
                            )}

                            {isStateOpen && (
                                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1 divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredStates.length === 0 ? (
                                        <div className="px-4 py-4 text-xs text-slate-400 text-center">
                                            No matching state found
                                        </div>
                                    ) : (
                                        filteredStates.map(s => (
                                            <button
                                                key={s.code}
                                                type="button"
                                                onClick={() => {
                                                    setBuyer({ ...buyer, stateName: `${s.name} (${s.code})` });
                                                    setIsStateOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center justify-between gap-2 group cursor-pointer"
                                            >
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                                    {s.name}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono shrink-0">
                                                    {s.code}
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recipient Email(s) (TO) */}
                    <div className="col-span-1">
                        {(() => {
                            const parsedEmails = buyer.toEmail
                                ? buyer.toEmail.split(/[,;\s]+/).map(e => e.trim()).filter(e => e.includes("@"))
                                : [];

                            return (
                                <>
                                    <label className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                                        <span>Recipient Email(s) (TO)</span>
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-400">
                                            Press Enter to add
                                        </span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder={parsedEmails.length > 0 ? "Add another email & press Enter..." : "e.g. client@acme.com (Press Enter)"}
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',' || e.key === ';') {
                                                    e.preventDefault();
                                                    handleAddEmailTag(emailInput);
                                                } else if (e.key === 'Backspace' && emailInput === '') {
                                                    if (parsedEmails.length > 0) {
                                                        handleRemoveEmailTag(parsedEmails.length - 1);
                                                    }
                                                }
                                            }}
                                            onBlur={() => handleAddEmailTag(emailInput)}
                                            onPaste={(e) => {
                                                const pastedText = e.clipboardData.getData('text');
                                                if (pastedText && pastedText.includes('@')) {
                                                    e.preventDefault();
                                                    handleAddEmailTag(pastedText);
                                                }
                                            }}
                                            className="w-full pl-9 pr-16 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        />
                                        {emailInput.trim() && (
                                            <button
                                                type="button"
                                                onClick={() => handleAddEmailTag(emailInput)}
                                                className="absolute right-2 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-md transition cursor-pointer"
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>

                                    {/* Email Badges List */}
                                    {parsedEmails.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {parsedEmails.map((email, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-100 dark:border-teal-900"
                                                >
                                                    <span className="truncate max-w-[200px]">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEmailTag(idx)}
                                                        className="text-teal-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                                        title={`Remove ${email}`}
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            Type an email address and press <kbd className="px-1 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">Enter</kbd> to add.
                                        </p>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Address / Location */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                            Address / Location
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 size-4 text-slate-400" />
                            <textarea
                                rows={3}
                                placeholder="Plot 42, Tech Park, Pune..."
                                value={buyer.address}
                                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-y"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Selector & Manipulation Workspace */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-700 space-y-4">

                {/* Bar to Add from Catalog or Custom */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <FileText className="size-4 text-teal-600 dark:text-teal-400" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quotation Line Items</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Searchable Catalog Items Combobox */}
                        <div className="relative w-full sm:w-72" ref={catalogDropdownRef}>
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={availableCatalogItems.length === 0 ? "-- All items added --" : "Search catalog items..."}
                                    value={catalogSearch}
                                    onChange={(e) => {
                                        setCatalogSearch(e.target.value);
                                        setIsCatalogOpen(true);
                                    }}
                                    onFocus={() => setIsCatalogOpen(true)}
                                    disabled={availableCatalogItems.length === 0}
                                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-50 transition"
                                />
                                {catalogSearch ? (
                                    <button
                                        type="button"
                                        onClick={() => setCatalogSearch("")}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        title="Clear search"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                ) : (
                                    <ChevronDown className="absolute right-2.5 size-3.5 text-slate-400 pointer-events-none" />
                                )}
                            </div>

                            {/* Dropdown Menu Popup */}
                            {isCatalogOpen && availableCatalogItems.length > 0 && (
                                <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1 divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-medium text-slate-400">
                                        <span>Catalog Items ({filteredCatalogItems.length})</span>
                                        <span>Click to add</span>
                                    </div>
                                    {filteredCatalogItems.length === 0 ? (
                                        <div className="px-4 py-4 text-xs text-slate-400 text-center">
                                            No matching catalog items found
                                        </div>
                                    ) : (
                                        filteredCatalogItems.map(item => (
                                            <button
                                                key={item._id}
                                                type="button"
                                                onClick={() => handleAddSpecificCatalogItem(item)}
                                                className="w-full text-left px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center justify-between gap-2 group cursor-pointer"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                                        {item.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {item.hsnCode && (
                                                            <span className="text-xs text-slate-400 font-mono">
                                                                HSN: {item.hsnCode}
                                                            </span>
                                                        )}
                                                        {item.unit && (
                                                            <span className="text-xs text-slate-400">
                                                                • {item.unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-md">
                                                        ₹{item.price}
                                                    </span>
                                                    <Plus className="size-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Add Custom Ad-Hoc Item */}
                        <button
                            type="button"
                            onClick={handleAddCustomItem}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5 w-full sm:w-auto justify-center"
                        >
                            <Sparkles className="size-3.5 text-teal-600 dark:text-teal-400" /> Add Custom Item
                        </button>
                    </div>
                </div>

                {/* Items Line Items Workspace */}
                {items.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        No items added yet. Search the catalog or add a custom line item above.
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {items.map((item, index) => {
                            const qty = Number(item.quantity) || 0;
                            const rate = Number(item.price) || 0;
                            const lineTaxable = qty * rate;
                            const cgstVal = (lineTaxable * (Number(item.cgst) || 0)) / 100;
                            const sgstVal = (lineTaxable * (Number(item.sgst) || 0)) / 100;
                            const lineTotal = lineTaxable + cgstVal + sgstVal;

                            return (
                                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 hover:border-teal-500/40 transition-all space-y-3">
                                    {/* Line 1: Item # Badge, Description (Wide Focus), Line Total & Delete Button */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 shrink-0">
                                            #{index + 1}
                                        </span>

                                        <div className="flex-1 min-w-[200px]">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Item title / product name..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 block">Line Total</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                                                    ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                title="Remove item"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Line Item Description / Specifications (with bullet & formatting tools) */}
                                    <div className="space-y-1.5 pt-0.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                <span>Description / Specifications</span>
                                                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(printed on PDF under item name)</span>
                                            </label>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertBullet(item.id)}
                                                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                                    title="Insert bullet point (Enter continues list)"
                                                >
                                                    <span className="font-bold text-teal-600 dark:text-teal-400">•</span> Bullet
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInsertBold(item.id)}
                                                    className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                                                    title="Bold text"
                                                >
                                                    B
                                                </button>
                                            </div>
                                        </div>

                                        <textarea
                                            ref={(el) => { descTextareaRefs.current[item.id] = el; }}
                                            rows={4}
                                            value={item.description || ""}
                                            onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                            onKeyDown={(e) => handleDescriptionKeyDown(e, item.id)}
                                            placeholder="Item specifications, bullet points (e.g. • 800W Motor), warranty notes..."
                                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 outline-none resize-y min-h-[100px] leading-relaxed"
                                        />
                                    </div>

                                    {/* Line 2: Segregated Parameters Grid (Rate, Qty, Unit, HSN Code (Wider), CGST %, SGST %) */}
                                    <div className="grid grid-cols-12 gap-2 pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
                                        {/* Rate (₹) */}
                                        <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Rate (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                                                    className="w-full pl-6 pr-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                                                    placeholder="0"
                                                    min="0"
                                                    step="any"
                                                />
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-3 sm:col-span-2 lg:col-span-1">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                min="1"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="col-span-3 sm:col-span-2 lg:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Unit</label>
                                            <input
                                                type="text"
                                                value={item.unit}
                                                onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="Nos"
                                            />
                                        </div>

                                        {/* HSN Code (Wider Field for 8-digit HSN/SAC codes) */}
                                        <div className="col-span-6 sm:col-span-5 lg:col-span-3">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">HSN / SAC Code</label>
                                            <input
                                                type="text"
                                                maxLength={8}
                                                value={item.hsnCode}
                                                onChange={(e) => handleItemChange(item.id, "hsnCode", e.target.value)}
                                                className="w-full px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono uppercase focus:ring-2 focus:ring-teal-500 outline-none"
                                                placeholder="e.g. 84713010"
                                            />
                                        </div>

                                        {/* CGST % */}
                                        <div className="col-span-3 sm:col-span-2 lg:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">CGST %</label>
                                            <input
                                                type="number"
                                                value={item.cgst}
                                                onChange={(e) => handleItemChange(item.id, "cgst", parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                min="0"
                                                step="0.5"
                                            />
                                        </div>

                                        {/* SGST % */}
                                        <div className="col-span-3 sm:col-span-2 lg:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SGST %</label>
                                            <input
                                                type="number"
                                                value={item.sgst}
                                                onChange={(e) => handleItemChange(item.id, "sgst", parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                                min="0"
                                                step="0.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Financial Summary & Actions Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Left Column: Quick Notes / Verification */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500" /> Summary
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Generating this quotation calculates taxes and produces a GST quotation PDF with quotation number <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">QT-{Date.now()}</span>.
                        </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => {
                                setItems([]);
                                setBuyer({ name: "", address: "", gstin: "", stateName: "", toEmail: "" });
                                showToast("Cleared quotation form", "info");
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition"
                        >
                            Reset Form
                        </button>
                    </div>
                </div>

                {/* Right Column: Grand Total Calculations & Download PDF */}
                <div className="lg:col-span-7 bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
                    <h4 className="text-xs font-medium uppercase tracking-wide text-slate-400">Financial Summary</h4>

                    <div className="space-y-2 text-sm border-b border-slate-800 pb-4">
                        <div className="flex justify-between text-slate-300 text-sm">
                            <span>Taxable Value (Subtotal)</span>
                            <span className="font-mono font-medium text-white">₹{taxableTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-sm">
                            <span>Central Tax (CGST)</span>
                            <span className="font-mono font-medium text-teal-400">₹{cgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-sm">
                            <span>State Tax (SGST)</span>
                            <span className="font-mono font-medium text-teal-400">₹{sgstTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                        <span className="text-sm font-medium uppercase tracking-wide text-teal-300">Grand Total</span>
                        <span className="text-2xl font-semibold text-emerald-400 font-mono tracking-tight">
                            ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Action Buttons: Save Quotation, Download PDF & Send Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                        <button
                            type="button"
                            onClick={handleSaveQuotation}
                            disabled={isSaving || isGenerating || isSendingEmail || items.length === 0}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Save</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleGeneratePdf}
                            disabled={isGenerating || isSaving || isSendingEmail || items.length === 0}
                            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-lg border border-slate-700 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Saving & Downloading...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="size-4 text-teal-400" />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={isSendingEmail || isSaving || isGenerating || items.length === 0}
                            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed text-slate-950 font-medium rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            {isSendingEmail ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>Saving & Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="size-4" />
                                    <span>Send Email</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
