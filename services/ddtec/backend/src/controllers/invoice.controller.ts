import { Request, Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Invoice, { IInvoice, IInvoiceItem } from '../models/Invoice';
import Settings from '../models/Settings';

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

// Helper to compute subtotal, discount, tax, and grand total
function calculateInvoiceTotals(items: any[], discountRaw: any, discountTypeRaw: any, taxRateRaw: any) {
    const sanitizedItems: IInvoiceItem[] = (items || []).map((item: any) => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const price = Math.max(0, Number(item.price) || 0);
        const amount = Number((qty * price).toFixed(2));
        return {
            itemDescription: String(item.itemDescription || item.name || '').trim(),
            hsnCode: item.hsnCode ? String(item.hsnCode).trim() : '',
            qty,
            price,
            amount
        };
    });

    const subtotal = sanitizedItems.reduce((sum, item) => sum + item.amount, 0);

    const discountVal = Math.max(0, Number(discountRaw) || 0);
    const discountType: 'fixed' | 'percentage' = discountTypeRaw === 'percentage' ? 'percentage' : 'fixed';
    const computedDiscount = discountType === 'percentage'
        ? Number(((subtotal * discountVal) / 100).toFixed(2))
        : Math.min(subtotal, discountVal);

    const taxableAmount = Math.max(0, subtotal - computedDiscount);
    const taxRate = Math.max(0, Number(taxRateRaw ?? 18));
    const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
    const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

    return {
        items: sanitizedItems,
        subtotal: Number(subtotal.toFixed(2)),
        discount: computedDiscount,
        discountType,
        taxRate,
        taxAmount,
        totalAmount
    };
}

/**
 * POST /api/invoices
 * Create and persist a new invoice
 */
export const createInvoice = async (req: Request, res: Response) => {
    try {
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
            notes
        } = req.body;

        if (!clientDetails?.name || String(clientDetails.name).trim() === '') {
            return res.status(400).json({ msg: 'Client / Buyer name is required' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'At least one line item is required' });
        }

        // Generate invoice number if not provided
        let finalInvoiceNumber = invoiceNumber ? String(invoiceNumber).trim() : '';
        if (!finalInvoiceNumber) {
            const count = await Invoice.countDocuments();
            finalInvoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        }

        // Check if invoice number is already taken
        const existing = await Invoice.findOne({ invoiceNumber: finalInvoiceNumber });
        if (existing) {
            finalInvoiceNumber = `${finalInvoiceNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        }

        // Generate unique URL-safe public ID
        const publicId = `inv_${crypto.randomBytes(6).toString('hex')}`;

        // Compute items and financial totals
        const totals = calculateInvoiceTotals(items, discount, discountType, taxRate);

        // Fetch settings if logo is needed
        const settings = await Settings.findOne();
        const effectiveSeller = {
            ...DEFAULT_SELLER,
            ...(sellerDetails || {}),
            logo: sellerDetails?.logo || settings?.quotationLogoUrl || ''
        };

        const effectivePayment = {
            ...DEFAULT_PAYMENT_DETAILS,
            ...(paymentDetails || {})
        };

        const newInvoice = new Invoice({
            invoiceNumber: finalInvoiceNumber,
            publicId,
            issueDate: issueDate ? new Date(issueDate) : new Date(),
            dueDate: dueDate ? new Date(dueDate) : undefined,
            status: status || 'unpaid',
            currency: currency || 'INR',
            sellerDetails: effectiveSeller,
            clientDetails: {
                name: String(clientDetails.name).trim(),
                email: clientDetails.email ? String(clientDetails.email).trim() : '',
                phone: clientDetails.phone ? String(clientDetails.phone).trim() : '',
                address: clientDetails.address ? String(clientDetails.address).trim() : '',
                city: clientDetails.city ? String(clientDetails.city).trim() : '',
                state: clientDetails.state ? String(clientDetails.state).trim() : '',
                zip: clientDetails.zip ? String(clientDetails.zip).trim() : '',
                country: clientDetails.country ? String(clientDetails.country).trim() : 'India',
                taxId: clientDetails.taxId ? String(clientDetails.taxId).trim() : ''
            },
            items: totals.items,
            subtotal: totals.subtotal,
            discount: totals.discount,
            discountType: totals.discountType,
            taxRate: totals.taxRate,
            taxAmount: totals.taxAmount,
            totalAmount: totals.totalAmount,
            paymentDetails: effectivePayment,
            notes: notes ? String(notes).trim() : '',
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
 * List invoices with search & pagination
 */
export const listInvoices = async (req: Request, res: Response) => {
    try {
        const { search, status, page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

        const filter: any = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search && String(search).trim()) {
            const regex = new RegExp(String(search).trim(), 'i');
            filter.$or = [
                { invoiceNumber: regex },
                { 'clientDetails.name': regex },
                { 'clientDetails.email': regex },
                { publicId: regex }
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
 * Update invoice
 */
export const updateInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }

        const {
            status,
            dueDate,
            sellerDetails,
            clientDetails,
            items,
            discount,
            discountType,
            taxRate,
            paymentDetails,
            notes
        } = req.body;

        if (status) invoice.status = status;
        if (dueDate !== undefined) invoice.dueDate = dueDate ? new Date(dueDate) : undefined;
        if (notes !== undefined) invoice.notes = String(notes).trim();
        if (sellerDetails) invoice.sellerDetails = { ...invoice.sellerDetails, ...sellerDetails };
        if (clientDetails) invoice.clientDetails = { ...invoice.clientDetails, ...clientDetails };
        if (paymentDetails) invoice.paymentDetails = { ...invoice.paymentDetails, ...paymentDetails };

        if (items || discount !== undefined || taxRate !== undefined) {
            const currentItems = items || invoice.items;
            const currentDiscount = discount !== undefined ? discount : invoice.discount;
            const currentDiscountType = discountType !== undefined ? discountType : invoice.discountType;
            const currentTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;

            const totals = calculateInvoiceTotals(currentItems, currentDiscount, currentDiscountType, currentTaxRate);
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
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) {
            return res.status(404).json({ msg: 'Invoice not found' });
        }
        res.json({ success: true, msg: 'Invoice deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting invoice:', err);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
};

/**
 * GET /api/invoices/public/:publicId/pdf or /:id/pdf
 * Generate and stream clean, professional A4 PDF invoice matching invoice-generator.prolab.sh layout
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
            doc.text(`Tax / GST (${invoice.taxRate}%)`, totalsX, curY);
            doc.text(`Rs. ${invoice.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, totalsValX, curY, { align: 'right' });
            curY += 6;
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
