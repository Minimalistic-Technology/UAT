import { Request, Response } from 'express';
import ScheduledEmail from '../models/ScheduledEmail';
import User from '../models/User';
import { PREDEFINED_EMAIL_TEMPLATES } from '../utils/emailTemplates';
import SchedulerService from '../services/scheduler.service';
import NotificationService from '../services/notification.service';

/**
 * Get all scheduled emails with filtering & pagination
 */
export const getScheduledEmails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;
        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const emails = await ScheduledEmail.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email firstName lastName');

        const activeUsersCount = await User.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            emails,
            activeUsersCount
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] getScheduledEmails:', error);
        res.status(500).json({ success: false, msg: 'Server error listing scheduled emails', error: error.message });
    }
};

/**
 * Get predefined HTML templates list
 */
export const getPredefinedTemplates = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            templates: PREDEFINED_EMAIL_TEMPLATES
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] getPredefinedTemplates:', error);
        res.status(500).json({ success: false, msg: 'Failed to fetch email templates' });
    }
};

/**
 * Create a new scheduled email
 */
export const createScheduledEmail = async (req: any, res: Response): Promise<void> => {
    try {
        const { title, subject, recipientType, customRecipients, templateId, htmlContent, scheduledAt } = req.body;

        if (!title || !subject || !htmlContent || !scheduledAt) {
            res.status(400).json({ success: false, msg: 'Please provide Title, Subject, HTML Content, and Scheduled Date/Time.' });
            return;
        }

        const targetDate = new Date(scheduledAt);
        if (isNaN(targetDate.getTime())) {
            res.status(400).json({ success: false, msg: 'Invalid date/time format for scheduledAt.' });
            return;
        }

        let recipientsList: string[] = [];
        if (recipientType === 'custom') {
            if (Array.isArray(customRecipients)) {
                recipientsList = customRecipients.map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            } else if (typeof customRecipients === 'string') {
                recipientsList = customRecipients.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            }

            if (recipientsList.length === 0) {
                res.status(400).json({ success: false, msg: 'Please enter at least one recipient email address.' });
                return;
            }
        }

        const newEmail = new ScheduledEmail({
            title,
            subject,
            recipientType: recipientType || 'all_users',
            customRecipients: recipientsList,
            templateId: templateId || 'custom',
            htmlContent,
            scheduledAt: targetDate,
            status: 'pending',
            createdBy: req.user?._id
        });

        await newEmail.save();

        // Check if the scheduled time is now/past or within 10 seconds -> process immediately
        if (targetDate.getTime() <= Date.now() + 10000) {
            SchedulerService.sendScheduledEmail(newEmail);
        }

        res.status(201).json({
            success: true,
            msg: 'Email schedule created successfully.',
            scheduledEmail: newEmail
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] createScheduledEmail:', error);
        res.status(500).json({ success: false, msg: 'Failed to schedule email', error: error.message });
    }
};

/**
 * Update an existing pending scheduled email
 */
export const updateScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, subject, recipientType, customRecipients, templateId, htmlContent, scheduledAt } = req.body;

        const emailDoc = await ScheduledEmail.findById(id);
        if (!emailDoc) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        if (emailDoc.status !== 'pending') {
            res.status(400).json({ success: false, msg: `Cannot edit email with status '${emailDoc.status}'. Only pending emails can be modified.` });
            return;
        }

        if (title) emailDoc.title = title;
        if (subject) emailDoc.subject = subject;
        if (recipientType) emailDoc.recipientType = recipientType;
        if (templateId) emailDoc.templateId = templateId;
        if (htmlContent) emailDoc.htmlContent = htmlContent;

        if (scheduledAt) {
            const targetDate = new Date(scheduledAt);
            if (!isNaN(targetDate.getTime())) {
                emailDoc.scheduledAt = targetDate;
            }
        }

        if (recipientType === 'custom' || customRecipients) {
            let recipientsList: string[] = [];
            if (Array.isArray(customRecipients)) {
                recipientsList = customRecipients.map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            } else if (typeof customRecipients === 'string') {
                recipientsList = customRecipients.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            }
            emailDoc.customRecipients = recipientsList;
        }

        await emailDoc.save();

        res.status(200).json({
            success: true,
            msg: 'Scheduled email updated successfully.',
            scheduledEmail: emailDoc
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] updateScheduledEmail:', error);
        res.status(500).json({ success: false, msg: 'Failed to update scheduled email' });
    }
};

/**
 * Cancel or Delete a scheduled email
 */
export const deleteScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const emailDoc = await ScheduledEmail.findById(id);

        if (!emailDoc) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        await ScheduledEmail.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            msg: 'Scheduled email record deleted successfully.'
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] deleteScheduledEmail:', error);
        res.status(500).json({ success: false, msg: 'Failed to delete scheduled email' });
    }
};

/**
 * Manually trigger immediate sending of a pending email schedule
 */
export const sendNowScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const emailDoc = await ScheduledEmail.findById(id);

        if (!emailDoc) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        if (emailDoc.status === 'sent') {
            res.status(400).json({ success: false, msg: 'This email has already been sent.' });
            return;
        }

        // Trigger dispatch immediately
        const success = await SchedulerService.sendScheduledEmail(emailDoc);

        if (success) {
            res.status(200).json({ success: true, msg: 'Email dispatched immediately.', scheduledEmail: emailDoc });
        } else {
            res.status(500).json({ success: false, msg: `Failed to dispatch email: ${emailDoc.errorMessage || 'Unknown error'}` });
        }
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] sendNowScheduledEmail:', error);
        res.status(500).json({ success: false, msg: 'Error sending scheduled email immediately.' });
    }
};

/**
 * Send a quick test email preview to the admin's email address
 */
export const sendTestEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { testEmail, subject, htmlContent } = req.body;

        if (!testEmail || !htmlContent) {
            res.status(400).json({ success: false, msg: 'Test email recipient and HTML content are required.' });
            return;
        }

        const result = await NotificationService.sendCustomEmail(
            testEmail,
            `[TEST PREVIEW] ${subject || 'DDTEC Email Preview'}`,
            htmlContent
        );

        if (result.success) {
            res.status(200).json({ success: true, msg: `Test email sent successfully to ${testEmail}!` });
        } else {
            res.status(400).json({ success: false, msg: result.msg || 'Failed to send test email.' });
        }
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] sendTestEmail:', error);
        res.status(500).json({ success: false, msg: 'Error dispatching test email.' });
    }
};
