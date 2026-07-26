import { Router } from 'express';
import {
    getQuotationItems,
    getAllQuotationItemsAdmin,
    createQuotationItem,
    updateQuotationItem,
    deleteQuotationItem
} from '../controllers/quotationItem.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

// @route   GET api/quotation-items
// @desc    Get all active quotation items
// @access  Public
router.get('/', getQuotationItems);

// @route   GET api/quotation-items/all
// @desc    Get all quotation items (including inactive) for admin management
// @access  Private/Admin
router.get('/all', auth as any, checkPermission(['product_manager']), getAllQuotationItemsAdmin);

// @route   POST api/quotation-items
// @desc    Create a quotation item
// @access  Private/Admin
router.post('/', auth as any, checkPermission(['product_manager']), createQuotationItem);

// @route   PUT api/quotation-items/:id
// @desc    Update a quotation item
// @access  Private/Admin
router.put('/:id', auth as any, checkPermission(['product_manager']), updateQuotationItem);

// @route   DELETE api/quotation-items/:id
// @desc    Delete a quotation item
// @access  Private/Admin
router.delete('/:id', auth as any, checkPermission(['product_manager']), deleteQuotationItem);

export default router;
