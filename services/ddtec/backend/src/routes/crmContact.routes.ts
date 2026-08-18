import { Router } from 'express';
import {
    getContacts,
    getContactMeta,
    getContactEmailsForFilter,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    importContacts
} from '../controllers/crmContact.controller';
import { auth, checkPermission } from '../middleware/auth.middleware';

const router = Router();

const adminOnly = checkPermission(['admin', 'super_admin']);

// @route   GET /api/contacts/meta
// @desc    Distinct companies & product-interest tags for filter dropdowns
router.get('/meta', auth, adminOnly, getContactMeta);

// @route   GET /api/contacts/emails
// @desc    Deduped emails for contacts matching company/productInterest (used by Schedule Mail)
router.get('/emails', auth, adminOnly, getContactEmailsForFilter);

// @route   POST /api/contacts/import
// @desc    Bulk import contacts from VCF or CSV content
router.post('/import', auth, adminOnly, importContacts);

// @route   GET /api/contacts
router.get('/', auth, adminOnly, getContacts);

// @route   GET /api/contacts/:id
router.get('/:id', auth, adminOnly, getContactById);

// @route   POST /api/contacts
router.post('/', auth, adminOnly, createContact);

// @route   PUT /api/contacts/:id
router.put('/:id', auth, adminOnly, updateContact);

// @route   DELETE /api/contacts/:id
router.delete('/:id', auth, adminOnly, deleteContact);

export default router;
