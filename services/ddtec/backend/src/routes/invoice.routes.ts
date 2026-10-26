import { Router } from 'express';
import {
    createInvoice,
    getPublicInvoice,
    listInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    generateInvoicePdf,
    sendInvoiceEmail
} from '../controllers/invoice.controller';
import optionalAuth from '../middleware/optionalAuth.middleware';

const router = Router();

// Public routes for viewing and downloading invoices via unique link
router.get('/public/:publicId', getPublicInvoice);
router.get('/public/:publicId/pdf', generateInvoicePdf);

// Management routes
router.post('/', optionalAuth, createInvoice);
router.get('/', optionalAuth, listInvoices);
router.get('/:id', optionalAuth, getInvoiceById);
router.put('/:id', optionalAuth, updateInvoice);
router.delete('/:id', optionalAuth, deleteInvoice);
router.get('/:id/pdf', optionalAuth, generateInvoicePdf);
router.post('/:id/send-email', optionalAuth, sendInvoiceEmail);

export default router;
