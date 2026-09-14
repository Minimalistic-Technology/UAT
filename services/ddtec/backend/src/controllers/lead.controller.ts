import { Request, Response } from 'express';
import Lead from '../models/Lead';
import LeadStage, { DEFAULT_LEAD_STAGES } from '../models/LeadStage';

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

// @desc    Create a lead
// @route   POST /api/leads
export const createLead = async (req: any, res: Response): Promise<void> => {
    try {
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
