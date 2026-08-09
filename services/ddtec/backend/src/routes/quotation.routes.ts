import { Router } from 'express';
import {
    generateQuotationPdf,
    sendQuotationEmail,
    saveQuotation,
    getAllSavedQuotations,
    getSavedQuotationById,
    deleteSavedQuotation,
    duplicateSavedQuotation
} from '../controllers/quotation.controller';
import optionalAuth from '../middleware/optionalAuth.middleware';

const router = Router();

// @route   POST api/quotation/generate
// @desc    Generate a quotation PDF for selected items
// @access  Public
router.post('/generate', generateQuotationPdf);

// @route   POST api/quotation/send-email
// @desc    Send quotation PDF email directly to recipient TO address (Admin workspace)
// @access  Public / Admin
router.post('/send-email', sendQuotationEmail);

// @route   POST api/quotation/save
// @desc    Save or update a quotation
router.post('/save', optionalAuth, saveQuotation);

// @route   GET api/quotation/saved
// @desc    Get list of saved quotations
router.get('/saved', optionalAuth, getAllSavedQuotations);

// @route   GET api/quotation/saved/:id
// @desc    Get single saved quotation
router.get('/saved/:id', optionalAuth, getSavedQuotationById);

// @route   DELETE api/quotation/saved/:id
// @desc    Delete a saved quotation
router.delete('/saved/:id', optionalAuth, deleteSavedQuotation);

// @route   POST api/quotation/saved/:id/duplicate
// @desc    Duplicate a saved quotation
router.post('/saved/:id/duplicate', optionalAuth, duplicateSavedQuotation);

export default router;

