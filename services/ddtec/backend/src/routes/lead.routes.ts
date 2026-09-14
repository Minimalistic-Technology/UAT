import { Router } from 'express';
import {
    getLeads,
    getLeadStats,
    createLead,
    updateLead,
    deleteLead
} from '../controllers/lead.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

const adminOnly = checkPermission(['admin', 'super_admin']);

// @route   GET /api/leads/stats
router.get('/stats', auth, adminOnly, getLeadStats);

// @route   GET /api/leads
router.get('/', auth, adminOnly, getLeads);

// @route   POST /api/leads
router.post('/', auth, adminOnly, createLead);

// @route   PUT /api/leads/:id
router.put('/:id', auth, adminOnly, updateLead);

// @route   DELETE /api/leads/:id
router.delete('/:id', auth, adminOnly, deleteLead);

export default router;
