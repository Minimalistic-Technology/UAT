import { Router } from 'express';
import {
    getScheduledEmails,
    getPredefinedTemplates,
    createScheduledEmail,
    updateScheduledEmail,
    deleteScheduledEmail,
    sendNowScheduledEmail,
    sendTestEmail
} from '../controllers/scheduledEmail.controller';
import { auth as authMiddleware, admin as adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply Auth and Admin middleware to all scheduled emails routes
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// Routes
router.get('/templates', getPredefinedTemplates);
router.get('/', getScheduledEmails);
router.post('/', createScheduledEmail);
router.post('/test-send', sendTestEmail);
router.put('/:id', updateScheduledEmail);
router.delete('/:id', deleteScheduledEmail);
router.post('/:id/send-now', sendNowScheduledEmail);

export default router;
