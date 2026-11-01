import { Request, Response } from 'express';
import CrmContact from '../models/CrmContact';
import Lead from '../models/Lead';
import { parseVCard, parseGoogleCsv } from '../utils/contactImport';
import { deleteCloudinaryImages } from '../utils/cloudinaryCleanup';

const ADMIN_ROLES = ['admin', 'super_admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

const ACRONYMS = new Set(['VIP', 'CRM', 'USB', 'B2B', 'IT', 'VCF', 'CSV', 'API', 'UI', 'UX', 'AI', 'PC', 'MNC']);

export const normalizeTag = (raw: any): string => {
    if (!raw) return '';
    const str = String(raw).trim();
    if (!str) return '';
    return str
        .split(/\s+/)
        .map(word => {
            const upper = word.toUpperCase();
            if (ACRONYMS.has(upper)) return upper;
            return word
                .split('-')
                .map(part => {
                    const partUpper = part.toUpperCase();
                    if (ACRONYMS.has(partUpper)) return partUpper;
                    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
                })
                .join('-');
        })
        .join(' ');
};

export const normalizeTagList = (list: any[]): string[] => {
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of list) {
        const normalized = normalizeTag(item);
        if (normalized && !seen.has(normalized.toLowerCase())) {
            seen.add(normalized.toLowerCase());
            result.push(normalized);
        }
    }
    return result;
};

const stripNoteIfNotAdmin = (doc: any, role?: string) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    if (!ADMIN_ROLES.includes(role || '')) {
        delete obj.note;
    }
    return obj;
};

// @desc    List contacts with search/filter support
// @route   GET /api/contacts
export const getContacts = async (req: any, res: Response): Promise<void> => {
    try {
        const { search, company, productInterest, tag, createdAfter, createdBefore } = req.query;
        const query: any = {};

        if (search) {
            const re = new RegExp(String(search), 'i');
            query.$or = [
                { firstName: re },
                { lastName: re },
                { company: re },
                { 'emails.value': re }
            ];
        }
        if (company) query.company = new RegExp(`^${String(company)}$`, 'i');
        if (productInterest) query.productInterest = new RegExp(`^${String(productInterest)}$`, 'i');
        if (tag) query.tags = new RegExp(`^${String(tag)}$`, 'i');
        if (createdAfter || createdBefore) {
            query.createdAt = {};
            if (createdAfter) query.createdAt.$gte = new Date(String(createdAfter));
            if (createdBefore) query.createdAt.$lte = new Date(String(createdBefore));
        }

        const contacts = await CrmContact.find(query).sort({ createdAt: -1 });
        const role = req.user?.role;
        res.json(contacts.map(c => stripNoteIfNotAdmin(c, role)));
    } catch (err: any) {
        console.error('Error fetching contacts:', err);
        res.status(500).json({ msg: 'Server error fetching contacts' });
    }
};

// @desc    Distinct companies & product-interest tags for filter dropdowns
// @route   GET /api/contacts/meta
export const getContactMeta = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [companies, productInterests] = await Promise.all([
            CrmContact.distinct('company', { company: { $nin: [null, ''] } }),
            CrmContact.distinct('productInterest')
        ]);
        res.json({
            companies: companies.filter(Boolean).sort(),
            productInterests: normalizeTagList(productInterests).sort((a, b) => a.localeCompare(b))
        });
    } catch (err: any) {
        console.error('Error fetching contact meta:', err);
        res.status(500).json({ msg: 'Server error fetching contact filters' });
    }
};

// @desc    Deduped emails for contacts matching company/productInterest — used by Schedule Mail
// @route   GET /api/contacts/emails
export const getContactEmailsForFilter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { company, productInterest } = req.query;
        const query: any = {};
        if (company) query.company = new RegExp(`^${String(company)}$`, 'i');
        if (productInterest) query.productInterest = new RegExp(`^${String(productInterest)}$`, 'i');

        const contacts = await CrmContact.find(query, 'emails');
        const emailSet = new Set<string>();
        contacts.forEach(c => c.emails.forEach(e => { if (e.value) emailSet.add(e.value); }));

        res.json({ emails: Array.from(emailSet), matchedContacts: contacts.length });
    } catch (err: any) {
        console.error('Error resolving contact emails:', err);
        res.status(500).json({ msg: 'Server error resolving contact emails' });
    }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
export const getContactById = async (req: any, res: Response): Promise<void> => {
    try {
        const contact = await CrmContact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ msg: 'Contact not found' });
            return;
        }
        res.json(stripNoteIfNotAdmin(contact, req.user?.role));
    } catch (err: any) {
        console.error('Error fetching contact:', err);
        res.status(404).json({ msg: 'Contact not found' });
    }
};

// @desc    Create a contact
// @route   POST /api/contacts
export const createContact = async (req: any, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, emails, phones, company, jobTitle, address, productInterest, tags, birthday, photo, note } = req.body;

        const fn = typeof firstName === 'string' ? firstName.trim() : '';
        if (!fn) {
            res.status(400).json({ msg: 'First name is required' });
            return;
        }
        if (fn.length < 2) {
            res.status(400).json({ msg: 'First name must be at least 2 characters' });
            return;
        }
        if (fn.length > 60) {
            res.status(400).json({ msg: 'First name cannot exceed 60 characters' });
            return;
        }

        const ln = typeof lastName === 'string' ? lastName.trim() : '';
        if (!ln) {
            res.status(400).json({ msg: 'Last name is required' });
            return;
        }
        if (ln.length < 2) {
            res.status(400).json({ msg: 'Last name must be at least 2 characters' });
            return;
        }
        if (ln.length > 60) {
            res.status(400).json({ msg: 'Last name cannot exceed 60 characters' });
            return;
        }

        const emailList = Array.isArray(emails)
            ? emails
                .filter((e: any) => e && typeof e.value === 'string' && e.value.trim())
                .map((e: any) => ({
                    label: ['work', 'personal', 'other'].includes(e.label) ? e.label : 'work',
                    value: e.value.trim().toLowerCase()
                }))
            : [];

        if (emailList.length === 0) {
            res.status(400).json({ msg: 'At least one email address is required' });
            return;
        }
        for (const e of emailList) {
            if (e.value.length < 5 || e.value.length > 254 || !EMAIL_REGEX.test(e.value)) {
                res.status(400).json({ msg: `Invalid email address "${e.value}"` });
                return;
            }
        }

        const phoneList = Array.isArray(phones)
            ? phones
                .filter((p: any) => p && typeof p.value === 'string' && p.value.trim())
                .map((p: any) => ({
                    label: ['mobile', 'work', 'home', 'other'].includes(p.label) ? p.label : 'mobile',
                    value: p.value.trim()
                }))
            : [];

        if (phoneList.length === 0) {
            res.status(400).json({ msg: 'At least one phone number is required' });
            return;
        }
        for (const p of phoneList) {
            if (p.value.length < 7 || p.value.length > 20 || !PHONE_REGEX.test(p.value)) {
                res.status(400).json({ msg: `Invalid phone number "${p.value}". Enter 7-20 digits.` });
                return;
            }
        }

        if (company && typeof company === 'string') {
            const trimmedCompany = company.trim();
            if (trimmedCompany && trimmedCompany.length < 2) {
                res.status(400).json({ msg: 'Company name must be at least 2 characters' });
                return;
            }
            if (trimmedCompany.length > 100) {
                res.status(400).json({ msg: 'Company name cannot exceed 100 characters' });
                return;
            }
        }

        if (jobTitle && typeof jobTitle === 'string') {
            const trimmedTitle = jobTitle.trim();
            if (trimmedTitle && trimmedTitle.length < 2) {
                res.status(400).json({ msg: 'Job title must be at least 2 characters' });
                return;
            }
            if (trimmedTitle.length > 80) {
                res.status(400).json({ msg: 'Job title cannot exceed 80 characters' });
                return;
            }
        }

        if (address && typeof address === 'object') {
            if (address.street && String(address.street).length > 150) {
                res.status(400).json({ msg: 'Street address cannot exceed 150 characters' });
                return;
            }
            if (address.city && String(address.city).length > 80) {
                res.status(400).json({ msg: 'City cannot exceed 80 characters' });
                return;
            }
            if (address.state && String(address.state).length > 80) {
                res.status(400).json({ msg: 'State cannot exceed 80 characters' });
                return;
            }
            if (address.postalCode && String(address.postalCode).length > 20) {
                res.status(400).json({ msg: 'Postal code cannot exceed 20 characters' });
                return;
            }
            if (address.country && String(address.country).length > 80) {
                res.status(400).json({ msg: 'Country cannot exceed 80 characters' });
                return;
            }
        }

        if (birthday) {
            const bday = new Date(birthday);
            if (isNaN(bday.getTime())) {
                res.status(400).json({ msg: 'Invalid birthday date' });
                return;
            }
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (bday > today) {
                res.status(400).json({ msg: 'Birthday cannot be in the future' });
                return;
            }
        }

        if (note && typeof note === 'string' && note.length > 2000) {
            res.status(400).json({ msg: 'Notes cannot exceed 2000 characters' });
            return;
        }

        const contact = new CrmContact({
            firstName: fn,
            lastName: ln,
            emails: emailList,
            phones: phoneList,
            company: company ? String(company).trim() : undefined,
            jobTitle: jobTitle ? String(jobTitle).trim() : undefined,
            address: address && typeof address === 'object' ? {
                street: address.street ? String(address.street).trim() : undefined,
                city: address.city ? String(address.city).trim() : undefined,
                state: address.state ? String(address.state).trim() : undefined,
                postalCode: address.postalCode ? String(address.postalCode).trim() : undefined,
                country: address.country ? String(address.country).trim() : undefined,
            } : undefined,
            productInterest: normalizeTagList(productInterest),
            tags: normalizeTagList(tags),
            birthday: birthday ? new Date(birthday) : undefined,
            photo: photo ? String(photo).trim() : undefined,
            note: note ? String(note).trim() : undefined,
            source: 'manual',
            createdBy: req.user?._id
        });

        await contact.save();
        res.status(201).json(stripNoteIfNotAdmin(contact, req.user?.role));
    } catch (err: any) {
        console.error('Error creating contact:', err);
        res.status(500).json({ msg: 'Server error creating contact' });
    }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
export const updateContact = async (req: any, res: Response): Promise<void> => {
    try {
        const contact = await CrmContact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ msg: 'Contact not found' });
            return;
        }

        const {
            firstName, lastName, emails, phones, company, jobTitle,
            address, productInterest, tags, birthday, photo, note
        } = req.body;

        if (firstName !== undefined) {
            const fn = String(firstName).trim();
            if (!fn) {
                res.status(400).json({ msg: 'First name is required' });
                return;
            }
            if (fn.length < 2) {
                res.status(400).json({ msg: 'First name must be at least 2 characters' });
                return;
            }
            if (fn.length > 60) {
                res.status(400).json({ msg: 'First name cannot exceed 60 characters' });
                return;
            }
            contact.firstName = fn;
        }

        if (lastName !== undefined) {
            const ln = String(lastName).trim();
            if (!ln) {
                res.status(400).json({ msg: 'Last name is required' });
                return;
            }
            if (ln.length < 2) {
                res.status(400).json({ msg: 'Last name must be at least 2 characters' });
                return;
            }
            if (ln.length > 60) {
                res.status(400).json({ msg: 'Last name cannot exceed 60 characters' });
                return;
            }
            contact.lastName = ln;
        }

        if (Array.isArray(emails)) {
            const emailList = emails
                .filter((e: any) => e && typeof e.value === 'string' && e.value.trim())
                .map((e: any) => ({
                    label: ['work', 'personal', 'other'].includes(e.label) ? e.label : 'work',
                    value: e.value.trim().toLowerCase()
                }));
            if (emailList.length === 0) {
                res.status(400).json({ msg: 'At least one email address is required' });
                return;
            }
            for (const e of emailList) {
                if (e.value.length < 5 || e.value.length > 254 || !EMAIL_REGEX.test(e.value)) {
                    res.status(400).json({ msg: `Invalid email address "${e.value}"` });
                    return;
                }
            }
            contact.emails = emailList as any;
        }

        if (Array.isArray(phones)) {
            const phoneList = phones
                .filter((p: any) => p && typeof p.value === 'string' && p.value.trim())
                .map((p: any) => ({
                    label: ['mobile', 'work', 'home', 'other'].includes(p.label) ? p.label : 'mobile',
                    value: p.value.trim()
                }));
            if (phoneList.length === 0) {
                res.status(400).json({ msg: 'At least one phone number is required' });
                return;
            }
            for (const p of phoneList) {
                if (p.value.length < 7 || p.value.length > 20 || !PHONE_REGEX.test(p.value)) {
                    res.status(400).json({ msg: `Invalid phone number "${p.value}". Enter 7-20 digits.` });
                    return;
                }
            }
            contact.phones = phoneList as any;
        }

        if (company !== undefined) {
            const trimmedCompany = String(company || '').trim();
            if (trimmedCompany && trimmedCompany.length < 2) {
                res.status(400).json({ msg: 'Company name must be at least 2 characters' });
                return;
            }
            if (trimmedCompany.length > 100) {
                res.status(400).json({ msg: 'Company name cannot exceed 100 characters' });
                return;
            }
            contact.company = trimmedCompany || undefined;
        }

        if (jobTitle !== undefined) {
            const trimmedTitle = String(jobTitle || '').trim();
            if (trimmedTitle && trimmedTitle.length < 2) {
                res.status(400).json({ msg: 'Job title must be at least 2 characters' });
                return;
            }
            if (trimmedTitle.length > 80) {
                res.status(400).json({ msg: 'Job title cannot exceed 80 characters' });
                return;
            }
            contact.jobTitle = trimmedTitle || undefined;
        }

        if (address !== undefined) {
            if (address && typeof address === 'object') {
                if (address.street && String(address.street).length > 150) {
                    res.status(400).json({ msg: 'Street address cannot exceed 150 characters' });
                    return;
                }
                if (address.city && String(address.city).length > 80) {
                    res.status(400).json({ msg: 'City cannot exceed 80 characters' });
                    return;
                }
                if (address.state && String(address.state).length > 80) {
                    res.status(400).json({ msg: 'State cannot exceed 80 characters' });
                    return;
                }
                if (address.postalCode && String(address.postalCode).length > 20) {
                    res.status(400).json({ msg: 'Postal code cannot exceed 20 characters' });
                    return;
                }
                if (address.country && String(address.country).length > 80) {
                    res.status(400).json({ msg: 'Country cannot exceed 80 characters' });
                    return;
                }
                contact.address = {
                    street: address.street ? String(address.street).trim() : undefined,
                    city: address.city ? String(address.city).trim() : undefined,
                    state: address.state ? String(address.state).trim() : undefined,
                    postalCode: address.postalCode ? String(address.postalCode).trim() : undefined,
                    country: address.country ? String(address.country).trim() : undefined,
                };
            } else {
                contact.address = {};
            }
        }

        if (Array.isArray(productInterest)) {
            contact.productInterest = normalizeTagList(productInterest);
        }

        if (Array.isArray(tags)) {
            contact.tags = normalizeTagList(tags);
        }

        if (birthday !== undefined) {
            if (birthday) {
                const bday = new Date(birthday);
                if (isNaN(bday.getTime())) {
                    res.status(400).json({ msg: 'Invalid birthday date' });
                    return;
                }
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                if (bday > today) {
                    res.status(400).json({ msg: 'Birthday cannot be in the future' });
                    return;
                }
                contact.birthday = bday;
            } else {
                contact.birthday = undefined;
            }
        }

        // Handle photo edit / replacement / deletion on Cloudinary
        if (photo !== undefined) {
            const nextPhoto = photo ? String(photo).trim() : '';
            if (contact.photo && contact.photo !== nextPhoto) {
                // Previous photo was removed or replaced, clean it up from Cloudinary
                await deleteCloudinaryImages([contact.photo]);
            }
            contact.photo = nextPhoto || undefined;
        }

        if (note !== undefined) {
            const trimmedNote = String(note || '').trim();
            if (trimmedNote.length > 2000) {
                res.status(400).json({ msg: 'Notes cannot exceed 2000 characters' });
                return;
            }
            contact.note = trimmedNote || undefined;
        }

        await contact.save();
        res.json(stripNoteIfNotAdmin(contact, req.user?.role));
    } catch (err: any) {
        console.error('Error updating contact:', err);
        res.status(500).json({ msg: 'Server error updating contact' });
    }
};

// @desc    Bulk delete contacts
// @route   POST /api/contacts/bulk-delete
export const bulkDeleteContacts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ msg: 'No contact ids provided' });
            return;
        }

        // Clean up Cloudinary photos of all deleted contacts
        const contactsToDelete = await CrmContact.find({ _id: { $in: ids } });
        const photosToDelete = contactsToDelete.map(c => c.photo).filter(Boolean) as string[];
        if (photosToDelete.length > 0) {
            await deleteCloudinaryImages(photosToDelete);
        }

        const result = await CrmContact.deleteMany({ _id: { $in: ids } });
        await Lead.updateMany({ convertedContact: { $in: ids } }, { $set: { convertedContact: null } });
        res.json({ deleted: result.deletedCount || 0 });
    } catch (err: any) {
        console.error('Error bulk deleting contacts:', err);
        res.status(500).json({ msg: 'Server error deleting contacts' });
    }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
    try {
        const contact = await CrmContact.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ msg: 'Contact not found' });
            return;
        }

        // Clean up Cloudinary photo if attached
        if (contact.photo) {
            await deleteCloudinaryImages([contact.photo]);
        }

        await contact.deleteOne();
        await Lead.updateMany({ convertedContact: contact._id }, { $set: { convertedContact: null } });
        res.json({ msg: 'Contact deleted' });
    } catch (err: any) {
        console.error('Error deleting contact:', err);
        res.status(500).json({ msg: 'Server error deleting contact' });
    }
};

// @desc    Upload contact photo to Cloudinary
// @route   POST /api/contacts/upload-photo
export const uploadContactPhotoController = async (req: any, res: Response): Promise<void> => {
    try {
        if (!req.file || !req.file.path) {
            res.status(400).json({ msg: 'No photo file provided' });
            return;
        }
        res.json({ url: req.file.path });
    } catch (err: any) {
        console.error('Error uploading contact photo:', err);
        res.status(500).json({ msg: 'Server error uploading contact photo' });
    }
};

// @desc    Delete contact photo from Cloudinary
// @route   POST /api/contacts/delete-photo
export const deleteContactPhotoController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { photoUrl } = req.body;
        if (photoUrl) {
            await deleteCloudinaryImages([photoUrl]);
        }
        res.json({ msg: 'Photo deleted from Cloudinary' });
    } catch (err: any) {
        console.error('Error deleting contact photo:', err);
        res.status(500).json({ msg: 'Server error deleting contact photo' });
    }
};

// @desc    Bulk import contacts from VCF or CSV content
// @route   POST /api/contacts/import
export const importContacts = async (req: any, res: Response): Promise<void> => {
    try {
        const { format, content } = req.body;

        if (!content || !String(content).trim()) {
            res.status(400).json({ msg: 'No file content provided' });
            return;
        }
        if (format !== 'vcf' && format !== 'csv') {
            res.status(400).json({ msg: 'Unsupported import format. Use "vcf" or "csv".' });
            return;
        }

        const parsed = format === 'vcf' ? parseVCard(content) : parseGoogleCsv(content);

        if (parsed.length === 0) {
            res.status(400).json({ msg: 'No contacts could be parsed from this file.' });
            return;
        }

        const errors: string[] = [];
        const docs = parsed
            .map((p, i) => {
                if (!p.firstName || !p.firstName.trim()) {
                    errors.push(`Row ${i + 1}: missing name, skipped.`);
                    return null;
                }
                return {
                    ...p,
                    source: format === 'vcf' ? 'vcf_import' : 'csv_import',
                    createdBy: req.user?._id
                };
            })
            .filter(Boolean);

        const inserted = docs.length > 0 ? await CrmContact.insertMany(docs, { ordered: false }) : [];

        res.status(201).json({
            imported: inserted.length,
            skipped: parsed.length - inserted.length,
            errors
        });
    } catch (err: any) {
        console.error('Error importing contacts:', err);
        res.status(500).json({ msg: 'Server error importing contacts', error: err.message });
    }
};
