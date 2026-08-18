import { Request, Response } from 'express';
import CrmContact from '../models/CrmContact';
import { parseVCard, parseGoogleCsv } from '../utils/contactImport';

const ADMIN_ROLES = ['admin', 'super_admin'];

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
            productInterests: productInterests.filter(Boolean).sort()
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

        if (!firstName || !String(firstName).trim()) {
            res.status(400).json({ msg: 'First name is required' });
            return;
        }

        const contact = new CrmContact({
            firstName,
            lastName,
            emails: Array.isArray(emails) ? emails.filter((e: any) => e?.value) : [],
            phones: Array.isArray(phones) ? phones.filter((p: any) => p?.value) : [],
            company,
            jobTitle,
            address,
            productInterest: Array.isArray(productInterest) ? productInterest.filter(Boolean) : [],
            tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
            birthday: birthday ? new Date(birthday) : undefined,
            photo,
            note,
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

        if (firstName !== undefined) contact.firstName = firstName;
        if (lastName !== undefined) contact.lastName = lastName;
        if (Array.isArray(emails)) contact.emails = emails.filter((e: any) => e?.value);
        if (Array.isArray(phones)) contact.phones = phones.filter((p: any) => p?.value);
        if (company !== undefined) contact.company = company;
        if (jobTitle !== undefined) contact.jobTitle = jobTitle;
        if (address !== undefined) contact.address = address;
        if (Array.isArray(productInterest)) contact.productInterest = productInterest.filter(Boolean);
        if (Array.isArray(tags)) contact.tags = tags.filter(Boolean);
        if (birthday !== undefined) contact.birthday = birthday ? new Date(birthday) : undefined;
        if (photo !== undefined) contact.photo = photo;
        if (note !== undefined) contact.note = note;

        await contact.save();
        res.json(stripNoteIfNotAdmin(contact, req.user?.role));
    } catch (err: any) {
        console.error('Error updating contact:', err);
        res.status(500).json({ msg: 'Server error updating contact' });
    }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
    try {
        const contact = await CrmContact.findByIdAndDelete(req.params.id);
        if (!contact) {
            res.status(404).json({ msg: 'Contact not found' });
            return;
        }
        res.json({ msg: 'Contact deleted' });
    } catch (err: any) {
        console.error('Error deleting contact:', err);
        res.status(500).json({ msg: 'Server error deleting contact' });
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
