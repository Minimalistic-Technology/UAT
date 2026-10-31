import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Invoice, { IInvoice, IInvoiceItem } from '../models/Invoice';
import Settings from '../models/Settings';
import Client from '../models/Client';
import Product from '../models/Product';
import NotificationService from '../services/notification.service';
import {
    SUPPORTED_INVOICE_CURRENCIES,
    ALLOWED_GST_RATES,
    ALLOWED_INVOICE_STATUSES,
    ALLOWED_DISCOUNT_TYPES,
    INVOICE_NUMBER_REGEX,
    EMAIL_REGEX,
    isValidCalendarDate,
    validateInvoiceDates,
    validateClientDetails,
    validateSellerDetails,
    validateLineItems,
    validateDiscount,
    validateTaxRate,
    validateCurrency,
    validatePaymentDetails
} from '../utils/invoiceValidation';

const DEFAULT_SELLER = {
    name: 'DDTEC Solutions',
    email: 'contact@ddtec.in',
    phone: '+91 98765 43210',
    address: '123 Tech Lane, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560038',
    country: 'India',
    taxId: process.env.COMPANY_GSTIN || '29AABBD1234F1Z5',
    logo: ''
};

const DEFAULT_PAYMENT_DETAILS = {
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    accountName: 'DDTEC SOLUTIONS PVT LTD',
    ifscCode: 'HDFC0001234',
    swiftCode: 'HDFCINBB',
    routingCode: '123456',
    upiId: 'ddtec@hdfcbank'
};

const ADMIN_ROLES = ['super_admin', 'product_manager', 'order_manager', 'customer_support', 'finance', 'marketing', 'admin'];

function isAuthorized(req: Request): boolean {
    const role = (req as any).user?.role;
    return !!role && ADMIN_ROLES.includes(role);
}

// In-memory window for duplicate submission prevention (4 seconds threshold)
const recentInvoiceSubmissions = new Map<string, number>();
setInterval(() => {
    const cutoff = Date.now() - 10000;
    for (const [key, timestamp] of recentInvoiceSubmissions.entries()) {
        if (timestamp < cutoff) {
            recentInvoiceSubmissions.delete(key);
        }
    }
}, 60000);

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitsToWords(n: number): string {
    if (n < 20) return ONES[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return `${TENS[tens]}${ones ? ' ' + ONES[ones] : ''}`;
}

function threeDigitsToWords(n: number): string {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundreds) str += `${ONES[hundreds]} Hundred${rest ? ' ' : ''}`;
    if (rest) str += twoDigitsToWords(rest);
    return str;
}

function numberToWordsIndian(num: number): string {
    if (num === 0) return 'Zero';
    let n = Math.floor(num);
    const crore = Math.floor(n / 10000000); n %= 10000000;
    const lakh = Math.floor(n / 100000); n %= 100000;
    const thousand = Math.floor(n / 1000); n %= 1000;
    const hundred = n;
    const parts: string[] = [];
    if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
    if (lakh) parts.push(`${threeDigitsToWords(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigitsToWords(thousand)} Thousand`);
    if (hundred) parts.push(threeDigitsToWords(hundred));
    return parts.join(' ').trim();
}

function amountInWords(amount: number): string {
    const whole = Math.floor(amount);
    const fraction = Math.round((amount - whole) * 100);
    const words = `INR ${numberToWordsIndian(whole)}`;
    if (fraction > 0) {
        return `${words} and ${numberToWordsIndian(fraction)} Paise Only`;
    }
    return `${words} Only`;
}

// Helper to compute subtotal, discount, tax, and grand total independently on backend
export function calculateInvoiceTotals(
    items: any[],
    discountRaw: any,
    discountTypeRaw: any,
    taxRateRaw: any,
    sellerState?: string,
    clientState?: string
) {
    const lineValidation = validateLineItems(items);
    if (!lineValidation.valid) {
        throw new Error(lineValidation.error);
    }

    const sanitizedItems: IInvoiceItem[] = lineValidation.sanitized!;
    const subtotal = Number(sanitizedItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));

    const discountCheck = validateDiscount(discountRaw, discountTypeRaw, subtotal);
    if (!discountCheck.valid) {
        throw new Error(discountCheck.error);
    }
    const discountVal = discountCheck.discount || 0;
    const discountType = discountCheck.discountType || 'fixed';

    const computedDiscount = discountType === 'percentage'
        ? Number(((subtotal * discountVal) / 100).toFixed(2))
        : Math.min(subtotal, discountVal);

    const taxableAmount = Math.max(0, Number((subtotal - computedDiscount).toFixed(2)));

    const taxCheck = validateTaxRate(taxRateRaw);
    if (!taxCheck.valid) {
        throw new Error(taxCheck.error);
    }
    const taxRate = taxCheck.taxRate ?? 18;
    const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    const isInterState = Boolean(
        sellerState &&
        clientState &&
        sellerState.trim().toLowerCase() !== clientState.trim().toLowerCase()
    );

    const cgstAmount = !isInterState ? Number((taxAmount / 2).toFixed(2)) : 0;
    const sgstAmount = !isInterState ? Number((taxAmount - cgstAmount).toFixed(2)) : 0;
    const igstAmount = isInterState ? taxAmount : 0;
    const taxType = isInterState ? 'inter_state' : 'intra_state';

    return {
        items: sanitizedItems,
        subtotal,
        discount: computedDiscount,
        discountType,
        taxRate,
        taxableAmount,
        taxAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        taxType,
        totalAmount,
        isInterState
    };
}

/**
 * POST /api/invoices
 * Create and persist a new invoice with comprehensive multi-layer validation
 */
export const createInvoice = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to create invoices.' });
        }

        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ msg: 'Request body must be a valid JSON object' });
        }

        const {
            invoiceNumber,
            issueDate,
            dueDate,
            status,
            currency,
            sellerDetails,
            clientDetails,
            items,
            discount,
            discountType,
            taxRate,
            paymentDetails,
            notes,
            clientId
        } = req.body;

        const isDraft = status === 'draft';

        // 1. Status validation & transition rules
        if (status && !ALLOWED_INVOICE_STATUSES.includes(status)) {
            return res.status(400).json({ msg: `Invalid invoice status. Must be one of: ${ALLOWED_INVOICE_STATUSES.join(', ')}` });
        }
        const userRole = (req as any).user?.role;
        if (status === 'paid' && !['super_admin', 'finance'].includes(userRole)) {
            return res.status(400).json({ msg: "New invoices cannot be directly created as 'paid'. Use the payment recording workflow." });
        }

        // 2. Client Details validation
        const clientCheck = validateClientDetails(clientDetails, isDraft);
        if (!clientCheck.valid) {
            return res.status(400).json({ msg: clientCheck.error });
        }

        // Verify referenced client exists if clientId is supplied
        if (clientId || clientDetails?.clientId) {
            const targetId = clientId || clientDetails?.clientId;
            if (mongoose.isValidObjectId(targetId)) {
                const clientExists = await Client.findById(targetId);
                if (!clientExists) {
                    return res.status(400).json({ msg: 'Referenced client does not exist' });
                }
            }
        }

        // 3. Seller Details validation (Merge with default seller / Company settings)
        const settings = await Settings.findOne();
        const effectiveSeller = {
            ...DEFAULT_SELLER,
            ...(sellerDetails || {}),
            logo: sellerDetails?.logo || settings?.quotationLogoUrl || ''
        };
        const sellerCheck = validateSellerDetails(effectiveSeller);
        if (!sellerCheck.valid) {
            return res.status(400).json({ msg: sellerCheck.error });
        }

        // 4. Date validation
        const dateCheck = validateInvoiceDates(issueDate, dueDate, isDraft);
        if (!dateCheck.valid) {
            return res.status(400).json({ msg: dateCheck.error });
        }

        // 5. Currency validation
        const currencyCheck = validateCurrency(currency);
        if (!currencyCheck.valid) {
            return res.status(400).json({ msg: currencyCheck.error });
        }

        // 6. Line Items validation
        const lineValidation = validateLineItems(items);
        if (!lineValidation.valid) {
            return res.status(400).json({ msg: lineValidation.error });
        }

        // Verify catalog products if productIds are referenced
        for (let i = 0; i < lineValidation.sanitized!.length; i++) {
            const it = lineValidation.sanitized![i];
            if (it.productId) {
                if (mongoose.isValidObjectId(it.productId)) {
                    const prodExists = await Product.findById(it.productId);
                    if (!prodExists) {
                        return res.status(400).json({ msg: `Product referenced in item #${i + 1} does not exist in catalog` });
                    }
                }
            }
        }

        // 7. Totals calculation (server-side authoritative recalculation)
        let totals: any;
        try {
            totals = calculateInvoiceTotals(
                items,
                discount,
                discountType,
                taxRate,
                effectiveSeller.state,
                clientCheck.sanitized.state
            );
        } catch (err: any) {
            return res.status(400).json({ msg: err.message });
        }

        // 8. Payment Details validation
        const effectivePayment = {
            ...DEFAULT_PAYMENT_DETAILS,
            ...(paymentDetails || {})
        };
        const paymentCheck = validatePaymentDetails(effectivePayment);
        if (!paymentCheck.valid) {
            return res.status(400).json({ msg: paymentCheck.error });
        }

        // 9. Invoice Number validation & collision handling
        let finalInvoiceNumber = '';
        if (invoiceNumber && String(invoiceNumber).trim()) {
            const manualNum = String(invoiceNumber).trim();
            if (!INVOICE_NUMBER_REGEX.test(manualNum)) {
                return res.status(400).json({ msg: 'Invoice number must be 3-50 alphanumeric characters (hyphens, slashes, and underscores allowed)' });
            }
            const existing = await Invoice.findOne({ invoiceNumber: manualNum });
            if (existing) {
                return res.status(400).json({ msg: `Invoice number "${manualNum}" is already in use. Please enter a unique invoice number or leave blank to auto-generate.` });
            }
            finalInvoiceNumber = manualNum;
        } else {
            // Auto-generate on backend and ensure uniqueness with controlled retry
            let count = await Invoice.countDocuments();
            let attempts = 0;
            let candidate = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
            while (await Invoice.findOne({ invoiceNumber: candidate })) {
                count++;
                attempts++;
                if (attempts > 30) {
                    return res.status(500).json({ msg: 'Failed to generate a unique invoice number. Please try again or specify one manually.' });
                }
                candidate = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
            }
            finalInvoiceNumber = candidate;
        }

        // 10. Duplicate submission prevention (Safe in-memory window)
        const userId = (req as any).user?._id || (req as any).user?.id || 'admin';
        const submissionKey = `${userId}_${clientCheck.sanitized.name}_${totals.totalAmount}_${totals.items.length}`;
        const nowMs = Date.now();
        const lastSubmitted = recentInvoiceSubmissions.get(submissionKey);
        if (lastSubmitted && (nowMs - lastSubmitted) < 4000) {
            return res.status(409).json({ msg: 'Duplicate invoice submission detected. Please wait a moment.' });
        }
        recentInvoiceSubmissions.set(submissionKey, nowMs);

        // 11. Notes validation
        const sanitizedNotes = notes ? String(notes).trim() : '';
        if (sanitizedNotes.length > 2000) {
            return res.status(400).json({ msg: 'Notes and instructions cannot exceed 2000 characters' });
        }

        // Generate unique URL-safe public ID
        const publicId = `inv_${crypto.randomBytes(6).toString('hex')}`;

        const newInvoice = new Invoice({
            invoiceNumber: finalInvoiceNumber,
            publicId,
            issueDate: dateCheck.issueDate,
            dueDate: dateCheck.dueDate,
            status: status || 'unpaid',
            currency: currencyCheck.currency,
            sellerDetails: sellerCheck.sanitized,
            clientDetails: clientCheck.sanitized,
            items: totals.items,
            subtotal: totals.subtotal,
            discount: totals.discount,
            discountType: totals.discountType,
            taxRate: totals.taxRate,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            paymentDetails: effectivePayment,
            notes: sanitizedNotes,
            createdBy: (req as any).user?._id
        });

        await newInvoice.save();

        res.status(201).json({
            success: true,
            msg: 'Invoice created successfully',
            invoice: newInvoice,
            publicId: newInvoice.publicId,
            publicUrl: `/invoice/${newInvoice.publicId}`
        });
    } catch (err: any) {
        console.error('Error creating invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error while creating invoice' });
    }
};

/**
 * GET /api/invoices/public/:publicId
 * Fetch invoice publicly by unique publicId (no authentication required)
 */
export const getPublicInvoice = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;

        let query: any = { publicId };
        if (mongoose.isValidObjectId(publicId)) {
            query = { $or: [{ publicId }, { _id: publicId }] };
        }

        const invoice = await Invoice.findOne(query);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found or invalid link' });
        }

        res.json({
            success: true,
            invoice
        });
    } catch (err: any) {
        console.error('Error fetching public invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * GET /api/invoices
 * List invoices with pagination, search, and status filtering
 */
export const listInvoices = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to view invoices.' });
        }

        const { page = 1, limit = 10, status, search } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));

        const filter: any = {};
        if (status && status !== 'all' && ALLOWED_INVOICE_STATUSES.includes(status as any)) {
            filter.status = status;
        }

        if (search && String(search).trim()) {
            const term = String(search).trim();
            const regex = new RegExp(term, 'i');
            filter.$or = [
                { invoiceNumber: regex },
                { 'clientDetails.name': regex },
                { 'clientDetails.email': regex },
                { 'clientDetails.taxId': regex }
            ];
        }

        const total = await Invoice.countDocuments(filter);
        const invoices = await Invoice.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        res.json({
            success: true,
            invoices,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum
        });
    } catch (err: any) {
        console.error('Error listing invoices:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * GET /api/invoices/:id
 * Get single invoice by ID
 */
export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to view invoices.' });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        res.json({ success: true, invoice });
    } catch (err: any) {
        console.error('Error getting invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * PUT /api/invoices/:id
 * Update invoice with lifecycle enforcement for finalized states
 */
export const updateInvoice = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to edit invoices.' });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }

        const userRole = (req as any).user?.role;
        const isSuperAdmin = userRole === 'super_admin';

        const {
            status,
            dueDate,
            sellerDetails,
            clientDetails,
            items,
            discount,
            discountType,
            taxRate,
            currency,
            paymentDetails,
            notes
        } = req.body;

        // Prevent unauthorized modifications to finalized invoices
        if ((invoice.status === 'paid' || invoice.status === 'cancelled') && !isSuperAdmin) {
            if (items !== undefined || discount !== undefined || taxRate !== undefined || currency !== undefined) {
                return res.status(400).json({ msg: `Cannot modify financial details of a ${invoice.status} invoice.` });
            }
        }

        // Validate status transition
        if (status) {
            if (!ALLOWED_INVOICE_STATUSES.includes(status)) {
                return res.status(400).json({ msg: `Invalid status. Must be one of: ${ALLOWED_INVOICE_STATUSES.join(', ')}` });
            }
            if (status === 'paid' && invoice.status !== 'paid' && !['super_admin', 'finance'].includes(userRole)) {
                return res.status(403).json({ msg: 'Only super_admin or finance roles can mark an invoice as paid.' });
            }
            invoice.status = status;
        }

        if (dueDate !== undefined) {
            if (dueDate) {
                const dateCheck = isValidCalendarDate(dueDate);
                if (!dateCheck.valid || !dateCheck.parsed) {
                    return res.status(400).json({ msg: dateCheck.error || 'Invalid due date' });
                }
                if (dateCheck.parsed < invoice.issueDate) {
                    return res.status(400).json({ msg: 'Due date must be on or after the issue date' });
                }
                invoice.dueDate = dateCheck.parsed;
            } else {
                invoice.dueDate = undefined;
            }
        }

        if (notes !== undefined) {
            const trimmedNotes = String(notes).trim();
            if (trimmedNotes.length > 2000) {
                return res.status(400).json({ msg: 'Notes cannot exceed 2000 characters' });
            }
            invoice.notes = trimmedNotes;
        }

        if (sellerDetails) {
            const sellerCheck = validateSellerDetails({ ...invoice.sellerDetails, ...sellerDetails });
            if (!sellerCheck.valid) return res.status(400).json({ msg: sellerCheck.error });
            invoice.sellerDetails = sellerCheck.sanitized;
        }

        if (clientDetails) {
            const isDraft = invoice.status === 'draft';
            const clientCheck = validateClientDetails({ ...invoice.clientDetails, ...clientDetails }, isDraft);
            if (!clientCheck.valid) return res.status(400).json({ msg: clientCheck.error });
            invoice.clientDetails = clientCheck.sanitized;
        }

        if (paymentDetails) {
            const paymentCheck = validatePaymentDetails(paymentDetails);
            if (!paymentCheck.valid) return res.status(400).json({ msg: paymentCheck.error });
            invoice.paymentDetails = { ...invoice.paymentDetails, ...paymentDetails };
        }

        if (currency) {
            const currCheck = validateCurrency(currency);
            if (!currCheck.valid) return res.status(400).json({ msg: currCheck.error });
            invoice.currency = currCheck.currency!;
        }

        if (items !== undefined || discount !== undefined || taxRate !== undefined || discountType !== undefined) {
            const currentItems = items !== undefined ? items : invoice.items;
            const currentDiscount = discount !== undefined ? discount : invoice.discount;
            const currentDiscountType = discountType !== undefined ? discountType : invoice.discountType;
            const currentTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;

            let totals: any;
            try {
                totals = calculateInvoiceTotals(
                    currentItems,
                    currentDiscount,
                    currentDiscountType,
                    currentTaxRate,
                    invoice.sellerDetails.state,
                    invoice.clientDetails.state
                );
            } catch (err: any) {
                return res.status(400).json({ msg: err.message });
            }

            invoice.items = totals.items;
            invoice.subtotal = totals.subtotal;
            invoice.discount = totals.discount;
            invoice.discountType = totals.discountType;
            invoice.taxRate = totals.taxRate;
            invoice.taxAmount = totals.taxAmount;
            invoice.totalAmount = totals.totalAmount;
        }

        await invoice.save();
        res.json({ success: true, msg: 'Invoice updated successfully', invoice });
    } catch (err: any) {
        console.error('Error updating invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * DELETE /api/invoices/:id
 * Delete invoice
 */
export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to delete invoices.' });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }

        const userRole = (req as any).user?.role;
        if (invoice.status === 'paid' && userRole !== 'super_admin') {
            return res.status(400).json({ msg: 'Cannot delete a paid invoice. Only super_admin may delete paid invoices.' });
        }

        await invoice.deleteOne();
        res.json({ success: true, msg: 'Invoice deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * Generates an A4 jsPDF instance from a saved invoice
 */
export function buildInvoicePdfDocument(invoice: IInvoice): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // Header Background & Border
    doc.setDrawColor(220, 220, 220);
    doc.setLineDashPattern([2, 2], 0);
    doc.roundedRect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 4, 4);

    // Header Row: Invoice No, Issued, Due Date
    doc.line(margin, margin + 22, pageWidth - margin, margin + 22);

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE NO', margin + 6, margin + 8);
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.invoiceNumber, margin + 6, margin + 15);

    const issueDateStr = new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const dueDateStr = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Upon Receipt';

    const midColX = margin + 100;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('ISSUED', midColX, margin + 8);
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(issueDateStr, midColX, margin + 15);

    const rightColX = pageWidth - margin - 35;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('DUE DATE', rightColX, margin + 8);
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(dueDateStr, rightColX, margin + 15);

    // From (Seller) & To (Client) Section
    const partyTopY = margin + 22;
    doc.line(pageWidth / 2, partyTopY, pageWidth / 2, partyTopY + 45);
    doc.line(margin, partyTopY + 45, pageWidth - margin, partyTopY + 45);

    // FROM
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('FROM', margin + 6, partyTopY + 7);
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.sellerDetails?.name || DEFAULT_SELLER.name, margin + 6, partyTopY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    let sellerY = partyTopY + 20;
    if (invoice.sellerDetails?.email) { doc.text(invoice.sellerDetails.email, margin + 6, sellerY); sellerY += 5; }
    if (invoice.sellerDetails?.address) { doc.text(invoice.sellerDetails.address, margin + 6, sellerY); sellerY += 5; }
    const sellerCityState = [invoice.sellerDetails?.city, invoice.sellerDetails?.state, invoice.sellerDetails?.zip].filter(Boolean).join(', ');
    if (sellerCityState) { doc.text(sellerCityState, margin + 6, sellerY); sellerY += 5; }
    if (invoice.sellerDetails?.taxId) { doc.text(`GSTIN/TAX ID: ${invoice.sellerDetails.taxId}`, margin + 6, sellerY); }

    // TO
    const toX = pageWidth / 2 + 6;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'bold');
    doc.text('TO', toX, partyTopY + 7);
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(invoice.clientDetails?.name || 'Customer', toX, partyTopY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    let clientY = partyTopY + 20;
    if (invoice.clientDetails?.email) { doc.text(invoice.clientDetails.email, toX, clientY); clientY += 5; }
    if (invoice.clientDetails?.address) { doc.text(invoice.clientDetails.address, toX, clientY); clientY += 5; }
    const clientCityState = [invoice.clientDetails?.city, invoice.clientDetails?.state, invoice.clientDetails?.zip].filter(Boolean).join(', ');
    if (clientCityState) { doc.text(clientCityState, toX, clientY); clientY += 5; }
    if (invoice.clientDetails?.taxId) { doc.text(`GSTIN/TAX ID: ${invoice.clientDetails.taxId}`, toX, clientY); }

    // Table of Items
    const tableBody = invoice.items.map((item, idx) => {
        const desc = item.hsnCode ? `${item.itemDescription}\n(HSN/SAC: ${item.hsnCode})` : item.itemDescription;
        return [
            idx + 1,
            desc,
            item.qty,
            `Rs. ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `Rs. ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        ];
    });

    autoTable(doc, {
        startY: partyTopY + 45,
        head: [['#', 'DESCRIPTION', 'QTY', 'PRICE', 'AMOUNT']],
        body: tableBody,
        theme: 'plain',
        margin: { left: margin, right: margin },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [100, 116, 139],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            lineColor: [226, 232, 240],
            lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 }
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: [51, 65, 85],
            lineColor: [226, 232, 240],
            lineWidth: { bottom: 0.5 }
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { halign: 'left', cellWidth: 85 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 32 },
            4: { halign: 'right', cellWidth: 35 }
        }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 8;
    if (finalY > pageHeight - 75) {
        doc.addPage();
        finalY = margin + 10;
    }

    // Notes on Left
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 140, 140);
    doc.text('NOTE', margin + 6, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const notesText = invoice.notes || 'Thank you for your business. Please make payment by the due date.';
    doc.text(notesText, margin + 6, finalY + 6, { maxWidth: 85 });

    // Financial Totals on Right
    const totalsX = pageWidth - margin - 75;
    const totalsValX = pageWidth - margin - 6;

    let curY = finalY;
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal', totalsX, curY);
    doc.text(`Rs. ${invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
    curY += 6;

    if (invoice.discount > 0) {
        doc.text('Discount', totalsX, curY);
        doc.text(`-Rs. ${invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
        curY += 6;
    }

    if (invoice.taxRate > 0) {
        const isInterState = Boolean(
            invoice.sellerDetails?.state &&
            invoice.clientDetails?.state &&
            invoice.sellerDetails.state.trim().toLowerCase() !== invoice.clientDetails.state.trim().toLowerCase()
        );

        if (isInterState) {
            doc.text(`IGST (${invoice.taxRate}%)`, totalsX, curY);
            doc.text(`Rs. ${invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
            curY += 6;
        } else {
            const halfRate = invoice.taxRate / 2;
            const halfAmount = Number((invoice.taxAmount / 2).toFixed(2));
            doc.text(`CGST (${halfRate}%)`, totalsX, curY);
            doc.text(`Rs. ${halfAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
            curY += 6;
            doc.text(`SGST (${halfRate}%)`, totalsX, curY);
            doc.text(`Rs. ${(invoice.taxAmount - halfAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
            curY += 6;
        }
    }

    doc.line(totalsX - 4, curY - 2, pageWidth - margin, curY - 2);
    curY += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    doc.text('Amount Due', totalsX, curY);
    doc.text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });

    // In words below totals
    curY += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Total in words: ${amountInWords(invoice.totalAmount)}`, margin + 6, curY, { maxWidth: pageWidth - margin * 2 - 12 });

    // Bank Details & Footer Box
    curY += 12;
    doc.line(margin, curY, pageWidth - margin, curY);
    curY += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 140, 140);
    doc.text('BANK DETAILS', margin + 6, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const bank = invoice.paymentDetails || DEFAULT_PAYMENT_DETAILS;
    const bankLines = [
        `Bank: ${bank.bankName || 'N/A'}    |    A/C No: ${bank.accountNumber || 'N/A'}`,
        `A/C Name: ${bank.accountName || 'N/A'}    |    IFSC: ${bank.ifscCode || 'N/A'}`
    ];
    doc.text(bankLines[0], margin + 6, curY + 6);
    doc.text(bankLines[1], margin + 6, curY + 11);

    // Status Stamp
    const statusBadge = (invoice.status || 'UNPAID').toUpperCase();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    if (statusBadge === 'PAID') {
        doc.setTextColor(22, 163, 74);
    } else {
        doc.setTextColor(220, 38, 38);
    }
    doc.text(`[ STATUS: ${statusBadge} ]`, pageWidth - margin - 6, curY + 8, { align: 'right' });

    return doc;
}

/**
 * GET /api/invoices/public/:publicId/pdf or /:id/pdf
 * Generate and stream clean, professional A4 PDF invoice
 */
export const generateInvoicePdf = async (req: Request, res: Response) => {
    try {
        const identifier = req.params.publicId || req.params.id;

        let query: any = { publicId: identifier };
        if (mongoose.isValidObjectId(identifier)) {
            query = { $or: [{ publicId: identifier }, { _id: identifier }] };
        }

        const invoice = await Invoice.findOne(query);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }

        const doc = buildInvoicePdfDocument(invoice);
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        const safeInvoiceNo = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice-${safeInvoiceNo}.pdf"`);
        res.send(pdfBuffer);
    } catch (err: any) {
        console.error('Error generating invoice PDF:', err);
        res.status(500).json({ msg: err.message || 'Error generating PDF' });
    }
};

/**
 * POST /api/invoices/:id/send-email
 * Send official invoice PDF email to client
 */
export const sendInvoiceEmail = async (req: Request, res: Response) => {
    try {
        if (!isAuthorized(req)) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to send invoices.' });
        }

        const { id } = req.params;
        const { toEmail } = req.body;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Saved invoice not found' });
        }

        const targetEmail = toEmail ? String(toEmail).trim() : (invoice.clientDetails?.email || '');
        if (!targetEmail || !EMAIL_REGEX.test(targetEmail)) {
            return res.status(400).json({ msg: 'A valid recipient email address (TO field) is required.' });
        }

        const doc = buildInvoicePdfDocument(invoice);
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        const filename = `Invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

        const emailResult = await NotificationService.sendQuotationEmail(
            [targetEmail],
            invoice.clientDetails.name,
            pdfBuffer,
            filename,
            `Invoice ${invoice.invoiceNumber} from ${invoice.sellerDetails.name}`,
            invoice.notes || 'Please find attached your invoice.'
        );

        if (emailResult.success) {
            return res.status(200).json({ success: true, msg: `Invoice emailed successfully to ${targetEmail}` });
        } else {
            return res.status(500).json({ success: false, msg: emailResult.msg || 'Failed to dispatch invoice email.' });
        }
    } catch (err: any) {
        console.error('Error sending invoice email:', err);
        res.status(500).json({ msg: err.message || 'Server error sending invoice email' });
    }
};
