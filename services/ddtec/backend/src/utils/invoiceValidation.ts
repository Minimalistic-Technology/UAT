export const SUPPORTED_INVOICE_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'] as const;
export type SupportedInvoiceCurrency = typeof SUPPORTED_INVOICE_CURRENCIES[number];

export const ALLOWED_GST_RATES = [0, 5, 12, 18, 28] as const;
export type AllowedGstRate = typeof ALLOWED_GST_RATES[number];

export const ALLOWED_INVOICE_STATUSES = ['draft', 'unpaid', 'paid', 'cancelled'] as const;
export type AllowedInvoiceStatus = typeof ALLOWED_INVOICE_STATUSES[number];

export const ALLOWED_DISCOUNT_TYPES = ['fixed', 'percentage'] as const;
export type AllowedDiscountType = typeof ALLOWED_DISCOUNT_TYPES[number];

// Standard validation regexes
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const INDIAN_PIN_REGEX = /^[1-9][0-9]{5}$/;
export const HSN_REGEX = /^[0-9]{2,8}$/;
export const INVOICE_NUMBER_REGEX = /^[A-Za-z0-9\-_/]{3,50}$/;
export const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

/**
 * Validates whether a date string is a real, valid calendar date (e.g. YYYY-MM-DD)
 * and guards against impossible dates such as February 31st.
 */
export function isValidCalendarDate(dateStr: any): { valid: boolean; parsed?: Date; error?: string } {
    if (!dateStr || typeof dateStr !== 'string') {
        return { valid: false, error: 'Date must be a valid non-empty string' };
    }

    const trimmed = dateStr.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
        // Check if full ISO string can be parsed
        const parsed = new Date(trimmed);
        if (isNaN(parsed.getTime())) {
            return { valid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
        }
        return { valid: true, parsed };
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    if (month < 1 || month > 12) {
        return { valid: false, error: `Invalid month: ${month}` };
    }
    if (day < 1 || day > 31) {
        return { valid: false, error: `Invalid day: ${day}` };
    }

    // Days per month check including leap years
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (day > daysInMonth) {
        return { valid: false, error: `Invalid calendar date: Day ${day} does not exist in month ${month}/${year}` };
    }

    const parsed = new Date(Date.UTC(year, month - 1, day));
    return { valid: true, parsed };
}

/**
 * Validates invoice dates: issueDate and dueDate ordering and future date restrictions.
 */
export function validateInvoiceDates(
    issueDateRaw: any,
    dueDateRaw: any,
    isDraft = false
): { valid: boolean; issueDate?: Date; dueDate?: Date; error?: string } {
    if (!issueDateRaw) {
        return { valid: false, error: 'Issue date is required' };
    }

    const issueCheck = isValidCalendarDate(issueDateRaw);
    if (!issueCheck.valid || !issueCheck.parsed) {
        return { valid: false, error: issueCheck.error || 'Invalid issue date' };
    }

    const issueDate = issueCheck.parsed;

    // Block future issue dates by default
    const now = new Date();
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    if (issueDate > endOfToday) {
        return { valid: false, error: 'Issue date cannot be in the future' };
    }

    let dueDate: Date | undefined;
    if (dueDateRaw) {
        const dueCheck = isValidCalendarDate(dueDateRaw);
        if (!dueCheck.valid || !dueCheck.parsed) {
            return { valid: false, error: dueCheck.error || 'Invalid due date' };
        }
        dueDate = dueCheck.parsed;

        if (dueDate < issueDate) {
            return { valid: false, error: 'Due date must be on or after the issue date' };
        }
    } else if (!isDraft) {
        return { valid: false, error: 'Due date is required for finalized invoices' };
    }

    return { valid: true, issueDate, dueDate };
}

/**
 * Validates client details according to business rules.
 */
export function validateClientDetails(
    client: any,
    isDraft = false
): { valid: boolean; sanitized?: any; error?: string } {
    if (!client || typeof client !== 'object') {
        return { valid: false, error: 'Client details are required' };
    }

    const name = String(client.name || '').trim();
    if (!name) {
        return { valid: false, error: 'Client / Company name is required' };
    }
    if (name.length > 150) {
        return { valid: false, error: 'Client name cannot exceed 150 characters' };
    }

    const email = client.email ? String(client.email).trim() : '';
    if (email) {
        if (email.length > 254) {
            return { valid: false, error: 'Client email cannot exceed 254 characters' };
        }
        if (!EMAIL_REGEX.test(email)) {
            return { valid: false, error: `Invalid client email format: "${email}"` };
        }
    }

    const phone = client.phone ? String(client.phone).trim() : '';
    if (phone) {
        if (!PHONE_REGEX.test(phone)) {
            return { valid: false, error: `Invalid client phone number: "${phone}". Expected 7-20 digits.` };
        }
    }

    const country = client.country ? String(client.country).trim() : 'India';
    if (country.length > 100) {
        return { valid: false, error: 'Country cannot exceed 100 characters' };
    }

    const taxId = client.taxId ? String(client.taxId).trim().toUpperCase() : '';
    if (taxId) {
        if (taxId.length > 30) {
            return { valid: false, error: 'Tax ID cannot exceed 30 characters' };
        }
        if (country.toLowerCase() === 'india' && !GSTIN_REGEX.test(taxId)) {
            return { valid: false, error: `Invalid GSTIN format: "${taxId}". Expected format: 22AAAAA0000A1Z5.` };
        }
    }

    const address = client.address ? String(client.address).trim() : '';
    const city = client.city ? String(client.city).trim() : '';
    const state = client.state ? String(client.state).trim() : '';
    const zip = client.zip ? String(client.zip).trim() : '';

    if (!isDraft) {
        if (!address) {
            return { valid: false, error: 'Client street address is required for finalized invoices' };
        }
        if (address.length > 250) {
            return { valid: false, error: 'Client address cannot exceed 250 characters' };
        }
        if (!city) {
            return { valid: false, error: 'Client city is required for finalized invoices' };
        }
        if (city.length > 100) {
            return { valid: false, error: 'Client city cannot exceed 100 characters' };
        }
        if (!state) {
            return { valid: false, error: 'Client state is required for finalized invoices' };
        }
        if (state.length > 100) {
            return { valid: false, error: 'Client state cannot exceed 100 characters' };
        }
        if (zip) {
            if (country.toLowerCase() === 'india' && !INDIAN_PIN_REGEX.test(zip)) {
                return { valid: false, error: `Invalid Indian PIN code: "${zip}". Expected 6 digits.` };
            }
        }
    }

    return {
        valid: true,
        sanitized: {
            name,
            email,
            phone,
            address,
            city,
            state,
            zip,
            country,
            taxId
        }
    };
}

/**
 * Validates seller details according to business rules.
 */
export function validateSellerDetails(
    seller: any
): { valid: boolean; sanitized?: any; error?: string } {
    if (!seller || typeof seller !== 'object') {
        return { valid: false, error: 'Seller details are required' };
    }

    const name = String(seller.name || '').trim();
    if (!name) {
        return { valid: false, error: 'Seller name is required' };
    }
    if (name.length > 150) {
        return { valid: false, error: 'Seller name cannot exceed 150 characters' };
    }

    const email = seller.email ? String(seller.email).trim() : '';
    if (email && !EMAIL_REGEX.test(email)) {
        return { valid: false, error: `Invalid seller email format: "${email}"` };
    }

    const phone = seller.phone ? String(seller.phone).trim() : '';
    if (phone && !PHONE_REGEX.test(phone)) {
        return { valid: false, error: `Invalid seller phone number: "${phone}"` };
    }

    const taxId = seller.taxId ? String(seller.taxId).trim().toUpperCase() : '';
    const country = seller.country ? String(seller.country).trim() : 'India';

    if (taxId && country.toLowerCase() === 'india' && !GSTIN_REGEX.test(taxId)) {
        return { valid: false, error: `Invalid seller GSTIN format: "${taxId}"` };
    }

    return {
        valid: true,
        sanitized: {
            name,
            email,
            phone,
            address: String(seller.address || '').trim(),
            city: String(seller.city || '').trim(),
            state: String(seller.state || '').trim(),
            zip: String(seller.zip || '').trim(),
            country,
            taxId,
            logo: seller.logo ? String(seller.logo).trim() : ''
        }
    };
}

/**
 * Validates line items: non-empty array, max 100 items, strict qty > 0 and price >= 0.
 * Rejects NaN, missing, infinite, negative values without silent conversion.
 */
export function validateLineItems(
    items: any[]
): { valid: boolean; sanitized?: any[]; error?: string } {
    if (!Array.isArray(items) || items.length === 0) {
        return { valid: false, error: 'At least one line item is required' };
    }

    if (items.length > 100) {
        return { valid: false, error: 'An invoice cannot contain more than 100 line items' };
    }

    const sanitizedItems: any[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const rowNum = i + 1;

        if (!item || typeof item !== 'object') {
            return { valid: false, error: `Line item #${rowNum} is invalid` };
        }

        const desc = String(item.itemDescription || item.name || '').trim();
        if (!desc) {
            return { valid: false, error: `Item #${rowNum} description is required and cannot be empty` };
        }
        if (desc.length > 500) {
            return { valid: false, error: `Item #${rowNum} description cannot exceed 500 characters` };
        }

        // Validate quantity strictly: no silent defaults
        if (item.qty === undefined || item.qty === null || item.qty === '') {
            return { valid: false, error: `Item #${rowNum} quantity is required` };
        }
        const qtyNum = Number(item.qty);
        if (typeof qtyNum !== 'number' || isNaN(qtyNum) || !isFinite(qtyNum)) {
            return { valid: false, error: `Item #${rowNum} quantity must be a valid number` };
        }
        if (qtyNum <= 0) {
            return { valid: false, error: `Item #${rowNum} quantity must be greater than zero` };
        }

        // Validate price strictly: no silent defaults
        if (item.price === undefined || item.price === null || item.price === '') {
            return { valid: false, error: `Item #${rowNum} price is required` };
        }
        const priceNum = Number(item.price);
        if (typeof priceNum !== 'number' || isNaN(priceNum) || !isFinite(priceNum)) {
            return { valid: false, error: `Item #${rowNum} price must be a valid number` };
        }
        if (priceNum < 0) {
            return { valid: false, error: `Item #${rowNum} price cannot be negative` };
        }

        const hsnCode = item.hsnCode ? String(item.hsnCode).trim() : '';
        if (hsnCode && !HSN_REGEX.test(hsnCode)) {
            return { valid: false, error: `Item #${rowNum} has an invalid HSN code "${hsnCode}". HSN code must be 2 to 8 digits.` };
        }

        const amount = Number((qtyNum * priceNum).toFixed(2));

        sanitizedItems.push({
            productId: item.productId ? String(item.productId).trim() : undefined,
            itemDescription: desc,
            hsnCode,
            qty: qtyNum,
            price: priceNum,
            amount
        });
    }

    return { valid: true, sanitized: sanitizedItems };
}

/**
 * Validates discount and discount type.
 */
export function validateDiscount(
    discountRaw: any,
    discountTypeRaw: any,
    subtotal: number
): { valid: boolean; discount?: number; discountType?: 'fixed' | 'percentage'; error?: string } {
    const discountType: 'fixed' | 'percentage' = discountTypeRaw === 'percentage' ? 'percentage' : 'fixed';

    if (discountTypeRaw !== undefined && discountTypeRaw !== null && !ALLOWED_DISCOUNT_TYPES.includes(discountTypeRaw)) {
        return { valid: false, error: `Invalid discount type: "${discountTypeRaw}". Must be 'fixed' or 'percentage'.` };
    }

    if (discountRaw === undefined || discountRaw === null || discountRaw === '') {
        return { valid: true, discount: 0, discountType };
    }

    const discountVal = Number(discountRaw);
    if (isNaN(discountVal) || !isFinite(discountVal)) {
        return { valid: false, error: 'Discount must be a valid number' };
    }
    if (discountVal < 0) {
        return { valid: false, error: 'Discount cannot be negative' };
    }

    if (discountType === 'percentage') {
        if (discountVal > 100) {
            return { valid: false, error: 'Percentage discount cannot exceed 100%' };
        }
    } else {
        if (discountVal > subtotal) {
            return { valid: false, error: `Fixed discount (${discountVal}) cannot exceed the subtotal (${subtotal.toFixed(2)})` };
        }
    }

    return { valid: true, discount: discountVal, discountType };
}

/**
 * Validates GST rate.
 */
export function validateTaxRate(taxRateRaw: any): { valid: boolean; taxRate?: number; error?: string } {
    if (taxRateRaw === undefined || taxRateRaw === null || taxRateRaw === '') {
        return { valid: true, taxRate: 18 };
    }

    const rate = Number(taxRateRaw);
    if (isNaN(rate) || !isFinite(rate)) {
        return { valid: false, error: 'Tax rate must be a valid number' };
    }

    if (!ALLOWED_GST_RATES.includes(rate as any)) {
        return { valid: false, error: `Invalid GST rate: ${rate}%. Allowed rates are: ${ALLOWED_GST_RATES.join('%, ')}%` };
    }

    return { valid: true, taxRate: rate };
}

/**
 * Validates currency.
 */
export function validateCurrency(currencyRaw: any): { valid: boolean; currency?: string; error?: string } {
    const currency = (currencyRaw ? String(currencyRaw).trim() : 'INR').toUpperCase();
    if (!SUPPORTED_INVOICE_CURRENCIES.includes(currency as any)) {
        return {
            valid: false,
            error: `Currency "${currency}" is not supported. Supported currencies are: ${SUPPORTED_INVOICE_CURRENCIES.join(', ')}`
        };
    }
    return { valid: true, currency };
}

/**
 * Validates payment details.
 */
export function validatePaymentDetails(payment: any): { valid: boolean; error?: string } {
    if (!payment || typeof payment !== 'object') return { valid: true };

    if (payment.accountNumber) {
        const acc = String(payment.accountNumber).trim();
        if (acc && !BANK_ACCOUNT_REGEX.test(acc)) {
            return { valid: false, error: `Invalid bank account number: "${acc}". Expected 9 to 18 digits.` };
        }
    }

    if (payment.ifscCode) {
        const ifsc = String(payment.ifscCode).trim().toUpperCase();
        if (ifsc && !IFSC_REGEX.test(ifsc)) {
            return { valid: false, error: `Invalid Indian IFSC code: "${ifsc}". Expected format: HDFC0001234.` };
        }
    }

    if (payment.upiId) {
        const upi = String(payment.upiId).trim();
        if (upi && !UPI_REGEX.test(upi)) {
            return { valid: false, error: `Invalid UPI ID: "${upi}". Expected format: username@bank.` };
        }
    }

    return { valid: true };
}
