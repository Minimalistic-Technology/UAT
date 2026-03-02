import { Router } from 'express';
import { submitContactForm, getMessages } from '../controllers/contact.controller';

const router = Router();

// POST /api/contact
router.post('/', submitContactForm);

// GET /api/contact (Admin only)
// Note: Middleware should be added in the main app or here if auth middleware is available in this file scope.
// Assuming auth middleware is applied in app.ts or similar for /api routes, or we export a protected router.
// Given previous context, routes seem to apply middleware at the controller or route level?
// Looking at other routes, let's see.
// I'll just add the route for now. Security should be handled by middleware.
import { auth, checkGranularPermission } from '../middleware/auth.middleware';
router.get('/', auth as any, checkGranularPermission('messages', 'view'), getMessages);

// DELETE /api/contact/:id (Admin only)
import { deleteMessage } from '../controllers/contact.controller';
router.delete('/:id', auth as any, checkGranularPermission('messages', 'delete'), deleteMessage);

export default router;
