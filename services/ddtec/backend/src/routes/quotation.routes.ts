import { Router } from 'express';
import { generateQuotationPdf } from '../controllers/quotation.controller';

const router = Router();

// @route   POST api/quotation/generate
// @desc    Generate a quotation PDF for selected items
// @access  Public
router.post('/generate', generateQuotationPdf);

export default router;
