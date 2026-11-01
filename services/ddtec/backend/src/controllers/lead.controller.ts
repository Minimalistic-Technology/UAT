import { Request, Response } from 'express';
import Lead from '../models/Lead';
import LeadStage, { DEFAULT_LEAD_STAGES } from '../models/LeadStage';
import Client from '../models/Client';
import CrmContact from '../models/CrmContact';

// Empty strings from optional selects/dates should not be cast as ObjectId/Date
const sanitizeLeadBody = (body: any) => {
    const clean = { ...body };
    if (clean.assignedTo === '') clean.assignedTo = null;
    if (clean.followUpDate === '') clean.followUpDate = null;
    return clean;
};

const sendLeadError = (res: Response, err: any, fallbackMsg: string) => {
    if (err?.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ msg: messages[0] || fallbackMsg, errors: messages });
        return;
    }
    if (err?.name === 'CastError') {
        res.status(400).json({ msg: `Invalid value for field "${err.path}"` });
        return;
    }
    console.error(fallbackMsg, err);
    res.status(500).json({ msg: fallbackMsg });
};

// @desc    List leads with optional search
// @route   GET /api/leads
export const getLeads = async (req: any, res: Response): Promise<void> => {
    try {
        const { search } = req.query;
        const query: any = {};
        if (search) {
            const re = new RegExp(String(search), 'i');
            query.$or = [{ name: re }, { company: re }, { email: re }];
        }
        const leads = await Lead.find(query).sort({ createdAt: -1 }).populate('assignedTo', 'firstName lastName name email');
        res.json(leads);
    } catch (err: any) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ msg: 'Server error fetching leads' });
    }
};

// @desc    Summary stats for the leads pipeline
// @route   GET /api/leads/stats
export const getLeadStats = async (req: any, res: Response): Promise<void> => {
    try {
        let stages = await LeadStage.find({});
        if (stages.length === 0) {
            stages = await LeadStage.insertMany(DEFAULT_LEAD_STAGES) as any;
        }
        const wonStageIds = new Set(stages.filter(s => s.isWon).map(s => String(s._id)));
        const lostStageIds = new Set(stages.filter(s => s.isLost).map(s => String(s._id)));
        const openStageIds = new Set(
            stages.filter(s => !s.isWon && !s.isLost).map(s => String(s._id))
        );

        const leads = await Lead.find({});
        const open = leads.filter(l => openStageIds.has(String(l.stage)));
        const pipeline = open.reduce((sum, l) => sum + (l.value || 0), 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const wonThisMonth = leads.filter(l => wonStageIds.has(String(l.stage)) && l.updatedAt >= startOfMonth).length;

        const won = leads.filter(l => wonStageIds.has(String(l.stage))).length;
        const lost = leads.filter(l => lostStageIds.has(String(l.stage))).length;
        const decided = won + lost;
        const winRate = decided > 0 ? Math.round((won / decided) * 100) : 0;

        res.json({
            open: open.length,
            pipeline,
            wonThisMonth,
            winRate
        });
    } catch (err: any) {
        console.error('Error fetching lead stats:', err);
        res.status(500).json({ msg: 'Server error fetching lead stats' });
    }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

// @desc    Create a lead
// @route   POST /api/leads
export const createLead = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, company, email, phone, location, followUpDate, note } = req.body;

        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
            res.status(400).json({ msg: 'Contact name is required' });
            return;
        }
        if (trimmedName.length < 2) {
            res.status(400).json({ msg: 'Contact name must be at least 2 characters' });
            return;
        }
        if (trimmedName.length > 100) {
            res.status(400).json({ msg: 'Contact name cannot exceed 100 characters' });
            return;
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

        if (email && typeof email === 'string') {
            const trimmedEmail = email.trim();
            if (trimmedEmail && trimmedEmail.length < 5) {
                res.status(400).json({ msg: 'Email address must be at least 5 characters' });
                return;
            }
            if (trimmedEmail.length > 254) {
                res.status(400).json({ msg: 'Email address cannot exceed 254 characters' });
                return;
            }
            if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
                res.status(400).json({ msg: 'Enter a valid email address' });
                return;
            }
        }

        if (phone && typeof phone === 'string') {
            const trimmedPhone = phone.trim();
            if (trimmedPhone && trimmedPhone.length < 7) {
                res.status(400).json({ msg: 'Phone number must be at least 7 characters' });
                return;
            }
            if (trimmedPhone.length > 20) {
                res.status(400).json({ msg: 'Phone number cannot exceed 20 characters' });
                return;
            }
            if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
                res.status(400).json({ msg: 'Enter a valid phone number (7-20 digits)' });
                return;
            }
        }

        if (location && typeof location === 'string') {
            const trimmedLocation = location.trim();
            if (trimmedLocation && trimmedLocation.length < 2) {
                res.status(400).json({ msg: 'Location must be at least 2 characters' });
                return;
            }
            if (trimmedLocation.length > 150) {
                res.status(400).json({ msg: 'Location cannot exceed 150 characters' });
                return;
            }
        }

        if (followUpDate) {
            const followUp = new Date(followUpDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (followUp <= today) {
                res.status(400).json({ msg: 'Follow-up date must be a future date' });
                return;
            }
        }

        if (note && typeof note === 'string' && note.length > 2000) {
            res.status(400).json({ msg: 'Notes cannot exceed 2000 characters' });
            return;
        }

        let stageId = req.body.stage;
        if (!stageId) {
            let firstStage = await LeadStage.findOne({}).sort({ order: 1 });
            if (!firstStage) {
                const seeded = await LeadStage.insertMany(DEFAULT_LEAD_STAGES);
                firstStage = seeded[0] as any;
            }
            stageId = firstStage!._id;
        }
        const lead = new Lead({ ...sanitizeLeadBody(req.body), stage: stageId, createdBy: req.user?._id });
        await lead.save();
        res.status(201).json(lead);
    } catch (err: any) {
        sendLeadError(res, err, 'Server error creating lead');
    }
};

// @desc    Update a lead (including stage moves)
// @route   PUT /api/leads/:id
export const updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, company, email, phone, location, followUpDate, note } = req.body;

        if (name !== undefined) {
            const trimmedName = typeof name === 'string' ? name.trim() : '';
            if (!trimmedName) {
                res.status(400).json({ msg: 'Contact name is required' });
                return;
            }
            if (trimmedName.length < 2) {
                res.status(400).json({ msg: 'Contact name must be at least 2 characters' });
                return;
            }
            if (trimmedName.length > 100) {
                res.status(400).json({ msg: 'Contact name cannot exceed 100 characters' });
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

        if (email && typeof email === 'string') {
            const trimmedEmail = email.trim();
            if (trimmedEmail && trimmedEmail.length < 5) {
                res.status(400).json({ msg: 'Email address must be at least 5 characters' });
                return;
            }
            if (trimmedEmail.length > 254) {
                res.status(400).json({ msg: 'Email address cannot exceed 254 characters' });
                return;
            }
            if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
                res.status(400).json({ msg: 'Enter a valid email address' });
                return;
            }
        }

        if (phone && typeof phone === 'string') {
            const trimmedPhone = phone.trim();
            if (trimmedPhone && trimmedPhone.length < 7) {
                res.status(400).json({ msg: 'Phone number must be at least 7 characters' });
                return;
            }
            if (trimmedPhone.length > 20) {
                res.status(400).json({ msg: 'Phone number cannot exceed 20 characters' });
                return;
            }
            if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
                res.status(400).json({ msg: 'Enter a valid phone number (7-20 digits)' });
                return;
            }
        }

        if (location && typeof location === 'string') {
            const trimmedLocation = location.trim();
            if (trimmedLocation && trimmedLocation.length < 2) {
                res.status(400).json({ msg: 'Location must be at least 2 characters' });
                return;
            }
            if (trimmedLocation.length > 150) {
                res.status(400).json({ msg: 'Location cannot exceed 150 characters' });
                return;
            }
        }

        if (followUpDate) {
            const followUp = new Date(followUpDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existing = await Lead.findById(req.params.id);
            if (!existing) {
                res.status(404).json({ msg: 'Lead not found' });
                return;
            }
            const existingDate = existing.followUpDate ? new Date(existing.followUpDate).getTime() : null;
            if (followUp.getTime() !== existingDate && followUp <= today) {
                res.status(400).json({ msg: 'Follow-up date must be a future date' });
                return;
            }
        }

        if (note && typeof note === 'string' && note.length > 2000) {
            res.status(400).json({ msg: 'Notes cannot exceed 2000 characters' });
            return;
        }

        const lead = await Lead.findByIdAndUpdate(req.params.id, sanitizeLeadBody(req.body), { new: true, runValidators: true });
        if (!lead) {
            res.status(404).json({ msg: 'Lead not found' });
            return;
        }
        res.json(lead);
    } catch (err: any) {
        sendLeadError(res, err, 'Server error updating lead');
    }
};

// @desc    Convert a lead into a Client + CRM Contact
// @route   POST /api/leads/:id/convert
export const convertLeadToClient = async (req: any, res: Response): Promise<void> => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            res.status(404).json({ msg: 'Lead not found' });
            return;
        }

        // Re-check that the previously linked records still exist — one side
        // may have been deleted independently (e.g. the Contact was removed
        // from the Contacts screen) while the other survives.
        let client = lead.convertedClient ? await Client.findById(lead.convertedClient) : null;
        let contact = lead.convertedContact ? await CrmContact.findById(lead.convertedContact) : null;

        if (client && contact) {
            res.status(400).json({ msg: 'Lead has already been converted' });
            return;
        }

        const { email, phone } = req.body || {};
        if (typeof email === 'string' && email.trim()) {
            lead.email = email.trim();
        }
        if (typeof phone === 'string' && phone.trim()) {
            lead.phone = phone.trim();
        }

        const finalEmail = (lead.email || '').trim();
        const finalPhone = (lead.phone || '').trim();

        if (!finalEmail) {
            res.status(400).json({ msg: 'Email is required to convert a lead into a contact' });
            return;
        }
        if (!EMAIL_REGEX.test(finalEmail)) {
            res.status(400).json({ msg: 'Please provide a valid email address' });
            return;
        }

        if (!finalPhone) {
            res.status(400).json({ msg: 'Phone number is required to convert a lead into a contact' });
            return;
        }
        if (!PHONE_REGEX.test(finalPhone)) {
            res.status(400).json({ msg: 'Please provide a valid phone number (7-20 digits)' });
            return;
        }

        lead.email = finalEmail;
        lead.phone = finalPhone;

        if (!client) {
            client = new Client({
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                company: lead.company,
                note: lead.note,
                createdBy: req.user?._id
            });
            await client.save();
        } else {
            let clientUpdated = false;
            if (!client.email && lead.email) { client.email = lead.email; clientUpdated = true; }
            if (!client.phone && lead.phone) { client.phone = lead.phone; clientUpdated = true; }
            if (clientUpdated) await client.save();
        }

        if (!contact) {
            const nameParts = lead.name.trim().split(/\s+/);
            contact = new CrmContact({
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ') || '-',
                emails: [{ label: 'work', value: lead.email }],
                phones: [{ label: 'mobile', value: lead.phone }],
                company: lead.company,
                note: lead.note,
                source: 'manual',
                createdBy: req.user?._id
            });
            await contact.save();
        } else {
            let contactUpdated = false;
            if ((!contact.emails || contact.emails.length === 0) && lead.email) {
                contact.emails = [{ label: 'work', value: lead.email }];
                contactUpdated = true;
            }
            if ((!contact.phones || contact.phones.length === 0) && lead.phone) {
                contact.phones = [{ label: 'mobile', value: lead.phone }];
                contactUpdated = true;
            }
            if (contactUpdated) await contact.save();
        }

        lead.convertedClient = client._id as any;
        lead.convertedContact = contact._id as any;
        await lead.save();

        res.json({ lead, client, contact });
    } catch (err: any) {
        sendLeadError(res, err, 'Server error converting lead');
    }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            res.status(404).json({ msg: 'Lead not found' });
            return;
        }
        res.json({ msg: 'Lead deleted' });
    } catch (err: any) {
        console.error('Error deleting lead:', err);
        res.status(500).json({ msg: 'Server error deleting lead' });
    }
};
