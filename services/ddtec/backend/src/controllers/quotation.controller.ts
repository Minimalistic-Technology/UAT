import { Request, Response } from 'express';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QuotationItem from '../models/QuotationItem';
import NotificationService from '../services/notification.service';

const COMPANY = {
    name: 'DDTEC',
    addressLine1: '123 Tech Lane, Silicon Valley',
    addressLine2: 'Contact: +91 98765 43210',
    gstin: process.env.COMPANY_GSTIN || 'N/A',
    stateName: process.env.COMPANY_STATE || 'N/A',
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER || ''
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
    const rupees = Math.floor(amount);
    return `INR ${numberToWordsIndian(rupees)} Only`;
}

function sanitizeForFilename(str: string): string {
    return str.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function buildQuotationPdfHelper(items: any[], buyer: any): Promise<{ pdfBuffer: Buffer; downloadFilename: string }> {
    const itemIds = items.map((i: any) => i.itemId).filter(Boolean);
    const dbItems = await QuotationItem.find({ _id: { $in: itemIds } });
    const dbItemMap = new Map(dbItems.map((i: any) => [String(i._id), i]));

    const lineItems = items.map((i: any, idx: number) => {
        const dbItem = i.itemId ? dbItemMap.get(String(i.itemId)) : null;

        const quantity = Number(i.quantity) || 1;
        const price = i.price !== undefined && i.price !== null && i.price !== ''
            ? Number(i.price)
            : (dbItem ? (dbItem as any).price : 0);
        const name = i.name || (dbItem ? (dbItem as any).name : `Item #${idx + 1}`);
        const hsnCode = i.hsnCode !== undefined ? i.hsnCode : (dbItem ? ((dbItem as any).hsnCode || '') : '');
        const unit = i.unit || (dbItem ? ((dbItem as any).unit || 'Nos') : 'Nos');
        const itemCgstRate = i.cgst !== undefined && i.cgst !== null && i.cgst !== ''
            ? Number(i.cgst)
            : (dbItem ? ((dbItem as any).cgst || 0) : 0);
        const itemSgstRate = i.sgst !== undefined && i.sgst !== null && i.sgst !== ''
            ? Number(i.sgst)
            : (dbItem ? ((dbItem as any).sgst || 0) : 0);

        const amount = price * quantity;
        return {
            name,
            hsnCode,
            unit,
            price,
            quantity,
            amount,
            cgstRate: itemCgstRate,
            sgstRate: itemSgstRate,
            cgstAmount: (amount * itemCgstRate) / 100,
            sgstAmount: (amount * itemSgstRate) / 100
        };
    });

    const totalQuantity = lineItems.reduce((sum, i) => sum + i.quantity, 0);
    const taxableValue = lineItems.reduce((sum, i) => sum + i.amount, 0);
    const cgstAmount = lineItems.reduce((sum, i) => sum + i.cgstAmount, 0);
    const sgstAmount = lineItems.reduce((sum, i) => sum + i.sgstAmount, 0);
    const grandTotal = taxableValue + cgstAmount + sgstAmount;

    const taxGroups = new Map<string, { cgstRate: number; sgstRate: number; taxableValue: number; cgstAmount: number; sgstAmount: number }>();
    for (const item of lineItems) {
        const key = `${item.cgstRate}-${item.sgstRate}`;
        const group = taxGroups.get(key) || { cgstRate: item.cgstRate, sgstRate: item.sgstRate, taxableValue: 0, cgstAmount: 0, sgstAmount: 0 };
        group.taxableValue += item.amount;
        group.cgstAmount += item.cgstAmount;
        group.sgstAmount += item.sgstAmount;
        taxGroups.set(key, group);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Invoice', pageWidth / 2, 15, { align: 'center' });

    doc.setDrawColor(0);
    doc.rect(margin, 20, pageWidth - margin * 2, 30);
    doc.line(pageWidth / 2, 20, pageWidth / 2, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY.name, margin + 2, 26);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY.addressLine1, margin + 2, 31);
    doc.text(COMPANY.addressLine2, margin + 2, 36);
    doc.text(`GSTIN/UIN: ${COMPANY.gstin}`, margin + 2, 41);
    doc.text(`State Name: ${COMPANY.stateName}`, margin + 2, 46);

    const rightX = pageWidth / 2 + 2;
    const invoiceNo = `QT-${Date.now()}`;
    const dateForFilename = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const buyerNameForFilename = sanitizeForFilename(buyer?.name || '') || 'Customer';
    const downloadFilename = `QT-${buyerNameForFilename}-${dateForFilename}.pdf`;
    doc.text(`Invoice No.: ${invoiceNo}`, rightX, 26);
    doc.text(`Dated: ${new Date().toLocaleDateString('en-IN')}`, rightX, 31);

    doc.rect(margin, 50, pageWidth - margin * 2, 24);
    doc.setFont('helvetica', 'bold');
    doc.text('Buyer:', margin + 2, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(buyer?.name || '', margin + 2, 61, { maxWidth: pageWidth - margin * 2 - 4 });
    doc.text(buyer?.address || '', margin + 2, 66, { maxWidth: pageWidth - margin * 2 - 4 });
    doc.text(`GSTIN/UIN: ${buyer?.gstin || 'N/A'}   State Name: ${buyer?.stateName || 'N/A'}`, margin + 2, 71);

    const tableBody = lineItems.map((item, idx) => [
        idx + 1,
        item.name,
        item.hsnCode,
        `${item.quantity} ${item.unit}`,
        item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        item.unit,
        item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
    ]);

    autoTable(doc, {
        startY: 78,
        head: [['Sl No.', 'Description of Goods', 'HSN/SAC', 'Quantity', 'Rate', 'per', 'Amount']],
        body: tableBody,
        foot: [
            ['', '', '', '', '', 'Output CGST', cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })],
            ['', '', '', '', '', 'Output SGST', sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })],
            [`Total`, '', '', `${totalQuantity}`, '', '', grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })]
        ],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], halign: 'center' },
        footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
        columnStyles: {
            0: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'right' },
            6: { halign: 'right' }
        },
        styles: { fontSize: 9 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Chargeable (in words):', margin, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(amountInWords(grandTotal), margin, finalY + 5, { maxWidth: pageWidth - margin * 2 });

    finalY += 12;
    autoTable(doc, {
        startY: finalY,
        head: [['Taxable Value', `Central Tax Rate`, 'Central Tax Amount', 'State Tax Rate', 'State Tax Amount', 'Total Tax Amount']],
        body: Array.from(taxGroups.values()).map(g => [
            g.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            `${g.cgstRate}%`,
            g.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            `${g.sgstRate}%`,
            g.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            (g.cgstAmount + g.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        ]),
        foot: [[
            'Total',
            '', cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            '', sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            (cgstAmount + sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })
        ]],
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], halign: 'center' },
        footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, halign: 'center' }
    });

    finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Amount (in words):', margin, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(amountInWords(cgstAmount + sgstAmount), margin, finalY + 5, { maxWidth: pageWidth - margin * 2 });

    finalY += 15;
    doc.setFontSize(8);
    doc.text('Declaration: We declare that this quotation shows the actual price of the goods described and that all particulars are true and correct.', margin, finalY, { maxWidth: (pageWidth - margin * 2) / 2 });
    doc.text(`for ${COMPANY.name}`, pageWidth - margin - 40, finalY);
    doc.text('Authorised Signatory', pageWidth - margin - 40, finalY + 20);

    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('This is a Computer Generated Quotation', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return { pdfBuffer, downloadFilename };
}

export const generateQuotationPdf = async (req: Request, res: Response) => {
    try {
        const { items, buyer } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'No items provided' });
        }

        const { pdfBuffer, downloadFilename } = await buildQuotationPdfHelper(items, buyer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.send(pdfBuffer);
    } catch (err: any) {
        console.error('Error generating quotation PDF:', err);
        res.status(500).json({ msg: err.message || 'Server error generating quotation' });
    }
};

export const sendQuotationEmail = async (req: Request, res: Response) => {
    try {
        const { items, buyer, toEmail, notes, subject } = req.body;

        const targetEmail = toEmail || buyer?.toEmail;

        if (!targetEmail || !targetEmail.includes('@')) {
            return res.status(400).json({ msg: 'Valid recipient email address (TO field) is required.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'No items provided for quotation email.' });
        }

        const { pdfBuffer, downloadFilename } = await buildQuotationPdfHelper(items, buyer);

        const emailResult = await NotificationService.sendQuotationEmail(
            targetEmail,
            buyer?.name || 'Valued Customer',
            pdfBuffer,
            downloadFilename,
            subject,
            notes
        );

        if (emailResult.success) {
            return res.status(200).json({ success: true, msg: `Quotation email successfully sent to ${targetEmail}` });
        } else {
            return res.status(500).json({ success: false, msg: emailResult.msg || 'Failed to dispatch quotation email.' });
        }
    } catch (err: any) {
        console.error('Error sending quotation email:', err);
        res.status(500).json({ msg: err.message || 'Server error sending quotation email' });
    }
};
