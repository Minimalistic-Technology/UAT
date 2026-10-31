import { Request, Response } from 'express';
import LeadStage, { DEFAULT_LEAD_STAGES } from '../models/LeadStage';
import Lead from '../models/Lead';

const sendStageError = (res: Response, err: any, fallbackMsg: string) => {
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

// @desc    List pipeline stages, seeding defaults on first use
// @route   GET /api/lead-stages
export const getLeadStages = async (req: Request, res: Response): Promise<void> => {
    try {
        let stages = await LeadStage.find({}).sort({ order: 1 });
        if (stages.length === 0) {
            stages = await LeadStage.insertMany(DEFAULT_LEAD_STAGES) as any;
        }
        res.json(stages);
    } catch (err: any) {
        console.error('Error fetching lead stages:', err);
        res.status(500).json({ msg: 'Server error fetching lead stages' });
    }
};

// @desc    Create a new pipeline stage
// @route   POST /api/lead-stages
export const createLeadStage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, color } = req.body;
        const trimmedName = String(name || '').trim();
        if (!trimmedName) {
            res.status(400).json({ msg: 'Stage name is required' });
            return;
        }
        const duplicate = await LeadStage.findOne({ name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
        if (duplicate) {
            res.status(400).json({ msg: 'A stage with this name already exists' });
            return;
        }
        const count = await LeadStage.countDocuments();
        const stage = await LeadStage.create({ name: trimmedName, color: color || '#3b82f6', order: count });
        res.status(201).json(stage);
    } catch (err: any) {
        sendStageError(res, err, 'Server error creating lead stage');
    }
};

// @desc    Rename / recolor a stage
// @route   PUT /api/lead-stages/:id
export const updateLeadStage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, color } = req.body;
        const update: any = {};
        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName) {
                res.status(400).json({ msg: 'Stage name is required' });
                return;
            }
            const duplicate = await LeadStage.findOne({
                _id: { $ne: req.params.id },
                name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
            });
            if (duplicate) {
                res.status(400).json({ msg: 'A stage with this name already exists' });
                return;
            }
            update.name = trimmedName;
        }
        if (color !== undefined) update.color = color;
        const stage = await LeadStage.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!stage) {
            res.status(404).json({ msg: 'Stage not found' });
            return;
        }
        res.json(stage);
    } catch (err: any) {
        sendStageError(res, err, 'Server error updating lead stage');
    }
};

// @desc    Persist stage order after drag/reorder
// @route   PUT /api/lead-stages/reorder
export const reorderLeadStages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            res.status(400).json({ msg: 'orderedIds must be an array' });
            return;
        }
        await Promise.all(
            orderedIds.map((id: string, index: number) => LeadStage.findByIdAndUpdate(id, { order: index }))
        );
        const stages = await LeadStage.find({}).sort({ order: 1 });
        res.json(stages);
    } catch (err: any) {
        console.error('Error reordering lead stages:', err);
        res.status(500).json({ msg: 'Server error reordering lead stages' });
    }
};

// @desc    Delete a stage; leads in it move to the earliest remaining stage
// @route   DELETE /api/lead-stages/:id
export const deleteLeadStage = async (req: Request, res: Response): Promise<void> => {
    try {
        const remainingCount = await LeadStage.countDocuments({ _id: { $ne: req.params.id } });
        if (remainingCount === 0) {
            res.status(400).json({ msg: 'At least one stage must remain' });
            return;
        }
        const fallback = await LeadStage.findOne({ _id: { $ne: req.params.id } }).sort({ order: 1 });
        await Lead.updateMany({ stage: req.params.id }, { stage: fallback!._id });
        const stage = await LeadStage.findByIdAndDelete(req.params.id);
        if (!stage) {
            res.status(404).json({ msg: 'Stage not found' });
            return;
        }
        res.json({ msg: 'Stage deleted', fallbackStageId: fallback!._id });
    } catch (err: any) {
        console.error('Error deleting lead stage:', err);
        res.status(500).json({ msg: 'Server error deleting lead stage' });
    }
};
