import { Router } from 'express';
import {
    getLeadStages,
    createLeadStage,
    updateLeadStage,
    reorderLeadStages,
    deleteLeadStage
} from '../controllers/leadStage.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

const adminOnly = checkPermission(['admin', 'super_admin']);

// @route   GET /api/lead-stages
router.get('/', auth, adminOnly, getLeadStages);

// @route   POST /api/lead-stages
router.post('/', auth, adminOnly, createLeadStage);

// @route   PUT /api/lead-stages/reorder
router.put('/reorder', auth, adminOnly, reorderLeadStages);

// @route   PUT /api/lead-stages/:id
router.put('/:id', auth, adminOnly, updateLeadStage);

// @route   DELETE /api/lead-stages/:id
router.delete('/:id', auth, adminOnly, deleteLeadStage);

export default router;
