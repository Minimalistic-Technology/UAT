import { Router } from 'express';
import { generateQuotationPdf, sendQuotationEmail } from '../controllers/quotation.controller';

const router = Router();

// @route   POST api/quotation/generate
// @desc    Generate a quotation PDF for selected items
// @access  Public
router.post('/generate', generateQuotationPdf);

// @route   POST api/quotation/send-email
// @desc    Send quotation PDF email directly to recipient TO address (Admin workspace)
// @access  Public / Admin
router.post('/send-email', sendQuotationEmail);

export default router;
