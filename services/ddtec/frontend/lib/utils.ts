import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// The single date format used across the whole app, e.g. "2 Oct 2026". Use this instead of
// calling toLocaleDateString directly so every date (orders, blogs, quotations, admin
// tables, etc.) reads identically everywhere. Accepts anything `Date` accepts, plus an
// existing `Date` instance. Returns '' for a missing/invalid input so callers can show a
// fallback (e.g. '—') without crashing.
export function formatDate(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Same as formatDate but appends the time, e.g. "2 Oct 2026, 5:30 PM" — for call sites that
// currently show both a date and a time together.
export function formatDateTime(value: string | number | Date | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const datePart = formatDate(date);
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${datePart}, ${timePart}`;
}

// Counts words by whitespace-splitting, ignoring leading/trailing/collapsed whitespace.
export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Truncates text to at most `maxWords` words, used to hard-cap a textarea's onChange so
// typing (or pasting) past the limit is simply clipped rather than silently accepted.
export function limitWords(text: string, maxWords: number): string {
    const words = text.split(/(\s+)/); // keep separators so trailing whitespace while typing isn't eaten
    let wordCount = 0;
    let result = '';
    for (const chunk of words) {
        if (chunk.trim() === '') {
            result += chunk;
            continue;
        }
        if (wordCount >= maxWords) break;
        result += chunk;
        wordCount++;
    }
    return result;
}
