import assert from 'node:assert';
import {
    isValidCalendarDate,
    validateInvoiceDates,
    validateClientDetails,
    validateSellerDetails,
    validateLineItems,
    validateDiscount,
    validateTaxRate,
    validateCurrency,
    validatePaymentDetails
} from '../src/utils/invoiceValidation';
import { calculateInvoiceTotals } from '../src/controllers/invoice.controller';

console.log('🧪 Starting Comprehensive Invoice Validation & Calculation Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err: any) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        failedTests++;
    }
}

// 1. DATE VALIDATIONS
console.log('--- 1. Date Validations ---');
runTest('Rejects malformed date strings', () => {
    const res = isValidCalendarDate('not-a-date');
    assert.strictEqual(res.valid, false);
});
runTest('Rejects impossible calendar dates (February 30th)', () => {
    const res = isValidCalendarDate('2026-02-30');
    assert.strictEqual(res.valid, false);
    assert.match(res.error || '', /does not exist/);
});
runTest('Rejects impossible leap year date (Feb 29 on non-leap year)', () => {
    const res = isValidCalendarDate('2025-02-29');
    assert.strictEqual(res.valid, false);
});
runTest('Accepts valid leap year date (Feb 29, 2024)', () => {
    const res = isValidCalendarDate('2024-02-29');
    assert.strictEqual(res.valid, true);
});
runTest('Blocks future issue dates by default', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureStr = futureDate.toISOString().split('T')[0];
    const res = validateInvoiceDates(futureStr, futureStr);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Issue date cannot be in the future');
});
runTest('Allows legitimate past issue dates', () => {
    const pastStr = '2025-01-15';
    const dueStr = '2025-02-15';
    const res = validateInvoiceDates(pastStr, dueStr);
    assert.strictEqual(res.valid, true);
});
runTest('Rejects due date before issue date', () => {
    const issueStr = '2026-01-10';
    const dueStr = '2026-01-05';
    const res = validateInvoiceDates(issueStr, dueStr);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Due date must be on or after the issue date');
});
runTest('Requires due date for finalized non-draft invoices', () => {
    const issueStr = '2026-01-10';
    const res = validateInvoiceDates(issueStr, undefined, false);
    assert.strictEqual(res.valid, false);
    assert.match(res.error || '', /Due date is required/);
});
runTest('Allows missing due date for draft invoices', () => {
    const issueStr = '2026-01-10';
    const res = validateInvoiceDates(issueStr, undefined, true);
    assert.strictEqual(res.valid, true);
});

// 2. CLIENT & SELLER VALIDATION
console.log('\n--- 2. Client & Seller Validations ---');
runTest('Rejects empty client name', () => {
    const res = validateClientDetails({ name: '   ' });
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Client / Company name is required');
});
runTest('Rejects client name exceeding 150 characters', () => {
    const longName = 'A'.repeat(151);
    const res = validateClientDetails({ name: longName });
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Client name cannot exceed 150 characters');
});
runTest('Validates client email format when provided', () => {
    const invalidEmail = validateClientDetails({ name: 'Acme Corp', email: 'invalid-email' });
    assert.strictEqual(invalidEmail.valid, false);
    assert.match(invalidEmail.error || '', /Invalid client email/);
    const validEmail = validateClientDetails({ name: 'Acme Corp', email: 'billing@acme.com', address: 'Main St', city: 'BLR', state: 'KA' });
    assert.strictEqual(validEmail.valid, true);
    assert.strictEqual(validEmail.sanitized.email, 'billing@acme.com');
});
runTest('Validates client phone number format (7-20 digits)', () => {
    const invalidPhone = validateClientDetails({ name: 'Acme Corp', phone: '123' });
    assert.strictEqual(invalidPhone.valid, false);
    assert.match(invalidPhone.error || '', /Invalid client phone/);
    const validPhone = validateClientDetails({ name: 'Acme Corp', phone: '+91 98765 43210', address: 'Main St', city: 'BLR', state: 'KA' });
    assert.strictEqual(validPhone.valid, true);
});
runTest('Validates Indian GSTIN format for India transactions', () => {
    const invalidGst = validateClientDetails({ name: 'Acme Corp', country: 'India', taxId: 'INVALID_GST' });
    assert.strictEqual(invalidGst.valid, false);
    assert.match(invalidGst.error || '', /Invalid GSTIN format/);
    const validGst = validateClientDetails({ name: 'Acme Corp', country: 'India', taxId: '29ABCDE1234F1Z5', address: '123 Tech Park', city: 'Bengaluru', state: 'Karnataka' });
    assert.strictEqual(validGst.valid, true);
    assert.strictEqual(validGst.sanitized.taxId, '29ABCDE1234F1Z5');
});
runTest('Validates Indian 6-digit PIN code for finalized invoices', () => {
    const invalidPin = validateClientDetails({ name: 'Acme Corp', country: 'India', address: 'Main St', city: 'BLR', state: 'KA', zip: '012345' });
    assert.strictEqual(invalidPin.valid, false);
    assert.match(invalidPin.error || '', /Invalid Indian PIN code/);
    const validPin = validateClientDetails({ name: 'Acme Corp', country: 'India', address: 'Main St', city: 'BLR', state: 'Karnataka', zip: '560038' });
    assert.strictEqual(validPin.valid, true);
});
runTest('Validates seller details (name, email, gstin)', () => {
    const invalidSeller = validateSellerDetails({ name: 'DDTEC', email: 'not-an-email' });
    assert.strictEqual(invalidSeller.valid, false);
    assert.match(invalidSeller.error || '', /Invalid seller email/);
    const validSeller = validateSellerDetails({ name: 'DDTEC Solutions', email: 'info@ddtec.in', phone: '+91 98765 43210', taxId: '29AABBD1234F1Z5' });
    assert.strictEqual(validSeller.valid, true);
});

// 3. LINE ITEM VALIDATIONS
console.log('\n--- 3. Line Item Validations ---');
runTest('Rejects missing or empty line items array', () => {
    const res1 = validateLineItems([]);
    assert.strictEqual(res1.valid, false);
    assert.strictEqual(res1.error, 'At least one line item is required');
});
runTest('Rejects more than 100 line items', () => {
    const items = Array.from({ length: 101 }, (_, i) => ({ itemDescription: `Item ${i + 1}`, qty: 1, price: 100 }));
    const res = validateLineItems(items);
    assert.strictEqual(res.valid, false);
    assert.match(res.error || '', /cannot contain more than 100/);
});
runTest('Rejects zero or negative quantities without silent conversion', () => {
    const zeroQty = validateLineItems([{ itemDescription: 'Widget', qty: 0, price: 100 }]);
    assert.strictEqual(zeroQty.valid, false);
    assert.strictEqual(zeroQty.error, 'Item #1 quantity must be greater than zero');
    const negQty = validateLineItems([{ itemDescription: 'Widget', qty: -5, price: 100 }]);
    assert.strictEqual(negQty.valid, false);
    assert.strictEqual(negQty.error, 'Item #1 quantity must be greater than zero');
});
runTest('Rejects NaN, missing, or infinite quantities', () => {
    const nanQty = validateLineItems([{ itemDescription: 'Widget', qty: 'abc', price: 100 }]);
    assert.strictEqual(nanQty.valid, false);
    assert.strictEqual(nanQty.error, 'Item #1 quantity must be a valid number');
    const missingQty = validateLineItems([{ itemDescription: 'Widget', price: 100 }]);
    assert.strictEqual(missingQty.valid, false);
    assert.strictEqual(missingQty.error, 'Item #1 quantity is required');
    const infQty = validateLineItems([{ itemDescription: 'Widget', qty: Infinity, price: 100 }]);
    assert.strictEqual(infQty.valid, false);
    assert.strictEqual(infQty.error, 'Item #1 quantity must be a valid number');
});
runTest('Rejects negative, NaN, missing, or infinite prices', () => {
    const negPrice = validateLineItems([{ itemDescription: 'Widget', qty: 1, price: -50 }]);
    assert.strictEqual(negPrice.valid, false);
    assert.strictEqual(negPrice.error, 'Item #1 price cannot be negative');
    const nanPrice = validateLineItems([{ itemDescription: 'Widget', qty: 1, price: 'free' }]);
    assert.strictEqual(nanPrice.valid, false);
    assert.strictEqual(nanPrice.error, 'Item #1 price must be a valid number');
    const missingPrice = validateLineItems([{ itemDescription: 'Widget', qty: 1 }]);
    assert.strictEqual(missingPrice.valid, false);
    assert.strictEqual(missingPrice.error, 'Item #1 price is required');
});
runTest('Allows ₹0 price for explicitly free/promotional items', () => {
    const freeItem = validateLineItems([{ itemDescription: 'Complimentary Cable', qty: 1, price: 0 }]);
    assert.strictEqual(freeItem.valid, true);
    assert.strictEqual(freeItem.sanitized![0].price, 0);
    assert.strictEqual(freeItem.sanitized![0].amount, 0);
});
runTest('Preserves fractional quantities (e.g. 2.5 kg)', () => {
    const fracItem = validateLineItems([{ itemDescription: 'Bulk Cable', qty: 2.5, price: 100 }]);
    assert.strictEqual(fracItem.valid, true);
    assert.strictEqual(fracItem.sanitized![0].qty, 2.5);
    assert.strictEqual(fracItem.sanitized![0].amount, 250);
});
runTest('Validates HSN code format (2-8 digits)', () => {
    const invalidHsn = validateLineItems([{ itemDescription: 'Phone', qty: 1, price: 100, hsnCode: 'ABC' }]);
    assert.strictEqual(invalidHsn.valid, false);
    assert.match(invalidHsn.error || '', /invalid HSN code/);
    const validHsn = validateLineItems([{ itemDescription: 'Phone', qty: 1, price: 100, hsnCode: '85171200' }]);
    assert.strictEqual(validHsn.valid, true);
    assert.strictEqual(validHsn.sanitized![0].hsnCode, '85171200');
});

// 4. DISCOUNT & TAX VALIDATIONS
console.log('\n--- 4. Discount & Tax Validations ---');
runTest('Rejects negative or non-numeric discount values', () => {
    const negDisc = validateDiscount(-10, 'fixed', 500);
    assert.strictEqual(negDisc.valid, false);
    assert.strictEqual(negDisc.error, 'Discount cannot be negative');
    const nanDisc = validateDiscount('invalid', 'fixed', 500);
    assert.strictEqual(nanDisc.valid, false);
    assert.strictEqual(nanDisc.error, 'Discount must be a valid number');
});
runTest('Rejects percentage discount exceeding 100%', () => {
    const overDisc = validateDiscount(105, 'percentage', 500);
    assert.strictEqual(overDisc.valid, false);
    assert.strictEqual(overDisc.error, 'Percentage discount cannot exceed 100%');
});
runTest('Rejects fixed discount exceeding subtotal', () => {
    const overFixed = validateDiscount(600, 'fixed', 500);
    assert.strictEqual(overFixed.valid, false);
    assert.match(overFixed.error || '', /cannot exceed the subtotal/);
});
runTest('Validates GST rate against configured slabs [0, 5, 12, 18, 28]', () => {
    const invalidRate = validateTaxRate(15);
    assert.strictEqual(invalidRate.valid, false);
    assert.match(invalidRate.error || '', /Allowed rates are: 0%, 5%, 12%, 18%, 28%/);
    for (const rate of [0, 5, 12, 18, 28]) {
        const validRate = validateTaxRate(rate);
        assert.strictEqual(validRate.valid, true);
        assert.strictEqual(validRate.taxRate, rate);
    }
});

// 5. CURRENCY & PAYMENT VALIDATIONS
console.log('\n--- 5. Currency & Payment Validations ---');
runTest('Validates supported currencies [INR, USD, EUR, GBP, AED]', () => {
    const invalidCurr = validateCurrency('JPY');
    assert.strictEqual(invalidCurr.valid, false);
    assert.match(invalidCurr.error || '', /Currency "JPY" is not supported/);
    const validCurr = validateCurrency('inr');
    assert.strictEqual(validCurr.valid, true);
    assert.strictEqual(validCurr.currency, 'INR');
});
runTest('Validates bank account number (9 to 18 digits)', () => {
    const shortAcc = validatePaymentDetails({ accountNumber: '123' });
    assert.strictEqual(shortAcc.valid, false);
    assert.match(shortAcc.error || '', /Expected 9 to 18 digits/);
    const validAcc = validatePaymentDetails({ accountNumber: '50200012345678' });
    assert.strictEqual(validAcc.valid, true);
});
runTest('Validates Indian IFSC format (e.g. HDFC0001234)', () => {
    const invalidIfsc = validatePaymentDetails({ ifscCode: 'HDFC123' });
    assert.strictEqual(invalidIfsc.valid, false);
    assert.match(invalidIfsc.error || '', /Invalid Indian IFSC code/);
    const validIfsc = validatePaymentDetails({ ifscCode: 'HDFC0001234' });
    assert.strictEqual(validIfsc.valid, true);
});
runTest('Validates UPI ID format (username@bank)', () => {
    const invalidUpi = validatePaymentDetails({ upiId: 'invalid-upi-no-at' });
    assert.strictEqual(invalidUpi.valid, false);
    assert.match(invalidUpi.error || '', /Invalid UPI ID/);
    const validUpi = validatePaymentDetails({ upiId: 'company@hdfcbank' });
    assert.strictEqual(validUpi.valid, true);
});

// 6. SERVER-SIDE TOTALS & TAX BREAKDOWN
console.log('\n--- 6. Server-Side Calculations & Rounding ---');
runTest('Calculates intra-state CGST & SGST (Karnataka to Karnataka)', () => {
    const items = [
        { itemDescription: 'Laptop', qty: 2, price: 50000 },
        { itemDescription: 'Mouse', qty: 2, price: 1000 }
    ];
    const totals = calculateInvoiceTotals(items, 10, 'percentage', 18, 'Karnataka', 'Karnataka');
    assert.strictEqual(totals.subtotal, 102000);
    assert.strictEqual(totals.discount, 10200);
    assert.strictEqual(totals.taxableAmount, 91800);
    assert.strictEqual(totals.taxAmount, 16524);
    assert.strictEqual(totals.taxType, 'intra_state');
    assert.strictEqual(totals.cgstAmount, 8262);
    assert.strictEqual(totals.sgstAmount, 8262);
    assert.strictEqual(totals.igstAmount, 0);
    assert.strictEqual(totals.totalAmount, 108324);
});
runTest('Calculates inter-state IGST (Karnataka to Maharashtra)', () => {
    const items = [{ itemDescription: 'Consulting Service', qty: 1, price: 100000 }];
    const totals = calculateInvoiceTotals(items, 5000, 'fixed', 18, 'Karnataka', 'Maharashtra');
    assert.strictEqual(totals.subtotal, 100000);
    assert.strictEqual(totals.discount, 5000);
    assert.strictEqual(totals.taxableAmount, 95000);
    assert.strictEqual(totals.taxAmount, 17100);
    assert.strictEqual(totals.taxType, 'inter_state');
    assert.strictEqual(totals.cgstAmount, 0);
    assert.strictEqual(totals.sgstAmount, 0);
    assert.strictEqual(totals.igstAmount, 17100);
    assert.strictEqual(totals.totalAmount, 112100);
});
runTest('Handles zero-rated and exempt tax (0% GST)', () => {
    const items = [{ itemDescription: 'Books / Exempt Item', qty: 5, price: 200 }];
    const totals = calculateInvoiceTotals(items, 0, 'fixed', 0, 'Karnataka', 'Karnataka');
    assert.strictEqual(totals.subtotal, 1000);
    assert.strictEqual(totals.taxAmount, 0);
    assert.strictEqual(totals.cgstAmount, 0);
    assert.strictEqual(totals.sgstAmount, 0);
    assert.strictEqual(totals.igstAmount, 0);
    assert.strictEqual(totals.totalAmount, 1000);
});
runTest('Never trusts client calculations: independently recalculates line amounts', () => {
    const untrustedItems = [{ itemDescription: 'Item 1', qty: 10, price: 50, amount: 999999 }];
    const totals = calculateInvoiceTotals(untrustedItems, 0, 'fixed', 18);
    assert.strictEqual(totals.items[0].amount, 500);
    assert.strictEqual(totals.subtotal, 500);
});

console.log('\n==========================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('==========================================');
if (failedTests > 0) process.exit(1);
