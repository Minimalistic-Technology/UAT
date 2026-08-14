export interface ParsedContactEmail {
    label: 'work' | 'personal' | 'other';
    value: string;
}

export interface ParsedContactPhone {
    label: 'mobile' | 'work' | 'home' | 'other';
    value: string;
}

export interface ParsedContact {
    firstName: string;
    lastName?: string;
    emails: ParsedContactEmail[];
    phones: ParsedContactPhone[];
    company?: string;
    jobTitle?: string;
    address?: { street?: string; city?: string; state?: string; postalCode?: string; country?: string };
    birthday?: Date;
    note?: string;
}

const normalizeEmailLabel = (raw?: string): ParsedContactEmail['label'] => {
    const t = (raw || '').toLowerCase();
    if (t.includes('home') || t.includes('personal')) return 'personal';
    if (t.includes('work') || t.includes('internet')) return 'work';
    return t === 'work' || t === 'personal' ? (t as any) : 'other';
};

const normalizePhoneLabel = (raw?: string): ParsedContactPhone['label'] => {
    const t = (raw || '').toLowerCase();
    if (t.includes('mobile') || t.includes('cell')) return 'mobile';
    if (t.includes('work')) return 'work';
    if (t.includes('home')) return 'home';
    return 'other';
};

const splitName = (fullName: string): { firstName: string; lastName?: string } => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return { firstName: parts[0] || fullName };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

/**
 * Minimal RFC 2426 vCard parser covering FN, N, EMAIL, TEL, ORG, TITLE, ADR, BDAY, NOTE.
 */
export const parseVCard = (content: string): ParsedContact[] => {
    const contacts: ParsedContact[] = [];
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Unfold continuation lines (a line starting with a space/tab continues the previous line)
    const rawLines = normalized.split('\n');
    const lines: string[] = [];
    for (const line of rawLines) {
        if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
            lines[lines.length - 1] += line.slice(1);
        } else {
            lines.push(line);
        }
    }

    const cards: string[][] = [];
    let current: string[] | null = null;
    for (const line of lines) {
        if (/^BEGIN:VCARD/i.test(line.trim())) {
            current = [];
        } else if (/^END:VCARD/i.test(line.trim())) {
            if (current) cards.push(current);
            current = null;
        } else if (current) {
            current.push(line);
        }
    }

    for (const cardLines of cards) {
        const contact: ParsedContact = { firstName: '', emails: [], phones: [] };
        let fullNameFallback = '';

        for (const line of cardLines) {
            if (!line.trim()) continue;
            const colonIdx = line.indexOf(':');
            if (colonIdx === -1) continue;

            const keyPart = line.slice(0, colonIdx);
            const value = line.slice(colonIdx + 1).trim();
            const [key, ...paramParts] = keyPart.split(';');
            const upperKey = key.toUpperCase();
            const params = paramParts.join(';');
            const typeMatch = params.match(/TYPE=([^;:]+)/i);
            const type = typeMatch ? typeMatch[1] : undefined;

            switch (upperKey) {
                case 'FN':
                    fullNameFallback = value;
                    break;
                case 'N': {
                    const [family, given] = value.split(';');
                    if (given || family) {
                        contact.firstName = given?.trim() || '';
                        contact.lastName = family?.trim() || undefined;
                    }
                    break;
                }
                case 'EMAIL':
                    if (value) contact.emails.push({ label: normalizeEmailLabel(type), value: value.toLowerCase() });
                    break;
                case 'TEL':
                    if (value) contact.phones.push({ label: normalizePhoneLabel(type), value });
                    break;
                case 'ORG':
                    contact.company = value.split(';')[0]?.trim() || undefined;
                    break;
                case 'TITLE':
                    contact.jobTitle = value || undefined;
                    break;
                case 'ADR': {
                    const segs = value.split(';');
                    // PO Box;Extended;Street;City;Region;PostalCode;Country
                    contact.address = {
                        street: segs[2]?.trim() || undefined,
                        city: segs[3]?.trim() || undefined,
                        state: segs[4]?.trim() || undefined,
                        postalCode: segs[5]?.trim() || undefined,
                        country: segs[6]?.trim() || undefined
                    };
                    break;
                }
                case 'BDAY': {
                    const d = new Date(value);
                    if (!isNaN(d.getTime())) contact.birthday = d;
                    break;
                }
                case 'NOTE':
                    contact.note = value.replace(/\\n/g, '\n') || undefined;
                    break;
                default:
                    break;
            }
        }

        if (!contact.firstName && fullNameFallback) {
            const split = splitName(fullNameFallback);
            contact.firstName = split.firstName;
            contact.lastName = split.lastName;
        }

        if (contact.firstName || contact.emails.length || contact.phones.length) {
            if (!contact.firstName) contact.firstName = contact.emails[0]?.value || contact.phones[0]?.value || 'Unnamed Contact';
            contacts.push(contact);
        }
    }

    return contacts;
};

/**
 * Full-content CSV tokenizer supporting quoted fields with embedded commas/newlines/escaped quotes ("").
 */
const parseCsvRows = (content: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    const text = content.replace(/﻿/g, ''); // strip BOM

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ',') {
            row.push(field);
            field = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(field);
            field = '';
            rows.push(row);
            row = [];
        } else {
            field += ch;
        }
    }
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows.filter(r => r.some(c => c.trim() !== ''));
};

/**
 * Parses a Google Contacts CSV export, with a generic fallback for other CSV shapes
 * (name/email/phone/company columns).
 */
export const parseGoogleCsv = (content: string): ParsedContact[] => {
    const rows = parseCsvRows(content);
    if (rows.length < 2) return [];

    const header = rows[0].map(h => h.trim());
    const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());

    const firstNameIdx = idx('First Name') !== -1 ? idx('First Name') : idx('name');
    const lastNameIdx = idx('Last Name');
    const orgNameIdx = idx('Organization Name') !== -1 ? idx('Organization Name') : idx('company');
    const orgTitleIdx = idx('Organization Title');
    const notesIdx = idx('Notes') !== -1 ? idx('Notes') : idx('note');
    const birthdayIdx = idx('Birthday');

    const emailCols: { valueIdx: number; labelIdx: number }[] = [];
    const phoneCols: { valueIdx: number; labelIdx: number }[] = [];
    header.forEach((h, i) => {
        const m = h.match(/^E-mail (\d+) - Value$/i);
        if (m) emailCols.push({ valueIdx: i, labelIdx: idx(`E-mail ${m[1]} - Label`) });
        const p = h.match(/^Phone (\d+) - Value$/i);
        if (p) phoneCols.push({ valueIdx: i, labelIdx: idx(`Phone ${p[1]} - Label`) });
    });
    if (emailCols.length === 0 && idx('email') !== -1) emailCols.push({ valueIdx: idx('email'), labelIdx: -1 });
    if (phoneCols.length === 0 && idx('phone') !== -1) phoneCols.push({ valueIdx: idx('phone'), labelIdx: -1 });

    const contacts: ParsedContact[] = [];

    for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const get = (i: number) => (i >= 0 && i < row.length ? row[i].trim() : '');

        const emails: ParsedContactEmail[] = emailCols
            .map(c => ({ label: normalizeEmailLabel(get(c.labelIdx)), value: get(c.valueIdx).toLowerCase() }))
            .filter(e => e.value);
        const phones: ParsedContactPhone[] = phoneCols
            .map(c => ({ label: normalizePhoneLabel(get(c.labelIdx)), value: get(c.valueIdx) }))
            .filter(p => p.value);

        let firstName = get(firstNameIdx);
        let lastName = get(lastNameIdx) || undefined;
        if (!firstName && !lastName) {
            const fallback = emails[0]?.value || phones[0]?.value;
            if (!fallback) continue;
            firstName = fallback;
        } else if (!firstName) {
            const split = splitName(lastName || '');
            firstName = split.firstName;
            lastName = split.lastName;
        }

        const birthdayRaw = get(birthdayIdx);
        const birthday = birthdayRaw ? new Date(birthdayRaw) : undefined;

        contacts.push({
            firstName,
            lastName,
            emails,
            phones,
            company: get(orgNameIdx) || undefined,
            jobTitle: get(orgTitleIdx) || undefined,
            note: get(notesIdx) || undefined,
            birthday: birthday && !isNaN(birthday.getTime()) ? birthday : undefined
        });
    }

    return contacts;
};
