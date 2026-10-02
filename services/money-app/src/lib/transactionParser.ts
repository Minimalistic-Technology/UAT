import type { TransactionType } from "@/models/Transaction";

export interface ParsedTransaction {
  amount: number | null;
  currency: string | null;
  type: TransactionType;
  merchant: string | null;
  accountLast4: string | null;
}

// Matches amounts like: Rs. 1,234.50 | INR 500 | ₹99 | $12.34
const AMOUNT_RE =
  /(?:INR|Rs\.?|₹|USD|\$)\s*([\d,]+(?:\.\d{1,2})?)/i;

const CREDIT_WORDS = /\b(credited|received|deposit(?:ed)?|refund(?:ed)?|added to your account)\b/i;
const DEBIT_WORDS = /\b(debited|spent|paid|purchase|withdrawn|deducted|payment of)\b/i;

// "a/c ending 1234", "a/c no. XX1234", "account ...1234"
// The gaps exclude "/" so the match can't skip across a date like "4/30/2026"
// and mistake the year for an account's last 4 digits.
const ACCOUNT_RE = /(?:a\/?c|account|card)[^\d/]{0,15}(?:no\.?|number|ending|xx+)?[^\d/]{0,10}(\d{4})\b/i;

// "at MERCHANT on", "to MERCHANT", "towards MERCHANT"
const MERCHANT_RE = /\b(?:at|to|towards)\s+([A-Z][A-Za-z0-9&.\-' ]{1,40}?)(?:\s+(?:on|via|using|for|has been)|[.,\n]|$)/;

function detectCurrency(text: string): string | null {
  if (/₹|Rs\.?\s|INR/i.test(text)) return "INR";
  if (/\$|USD/.test(text)) return "USD";
  return null;
}

function detectType(text: string): TransactionType {
  if (DEBIT_WORDS.test(text)) return "debit";
  if (CREDIT_WORDS.test(text)) return "credit";
  return "unknown";
}

export function parseTransactionEmail(text: string): ParsedTransaction {
  const amountMatch = text.match(AMOUNT_RE);
  const accountMatch = text.match(ACCOUNT_RE);
  const merchantMatch = text.match(MERCHANT_RE);

  const parsedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;
  const amount = parsedAmount != null && Number.isFinite(parsedAmount) ? parsedAmount : null;

  return {
    amount,
    currency: detectCurrency(text),
    type: detectType(text),
    merchant: merchantMatch ? merchantMatch[1].trim() : null,
    accountLast4: accountMatch ? accountMatch[1] : null,
  };
}

/** True if this candidate email looks like an actual transaction notification. */
export function looksLikeTransaction(text: string): boolean {
  return AMOUNT_RE.test(text) && (DEBIT_WORDS.test(text) || CREDIT_WORDS.test(text));
}
