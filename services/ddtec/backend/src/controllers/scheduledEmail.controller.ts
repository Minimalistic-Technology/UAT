import { Request, Response } from 'express';
import EmailTemplate from '../models/EmailTemplate';
import User from '../models/User';
import { PREDEFINED_EMAIL_TEMPLATES } from '../utils/emailTemplates';
import NotificationService from '../services/notification.service';
import MailSchedulerClient, { ScheduledEmailRecord } from '../services/mailScheduler.client';

/**
 * Maps a mail-scheduler SQLite record onto the shape the admin frontend
 * (ScheduleMailView.tsx) already expects from the old Mongo-backed API.
 */
function toFrontendShape(record: ScheduledEmailRecord) {
    let createdBy: { name?: string; email?: string } | undefined;
    if (record.createdBy) {
        try {
            createdBy = JSON.parse(record.createdBy);
        } catch {
            createdBy = undefined;
        }
    }

    return {
        _id: record.id,
        title: record.title,
        subject: record.subject,
        recipientType: record.recipientType,
        customRecipients: record.recipients,
        templateId: record.templateId,
        htmlContent: record.html,
        scheduledAt: record.scheduledAt,
        status: record.status,
        sentAt: record.sentAt,
        sentCount: record.sentCount,
        failedCount: record.failedCount,
        errorMessage: record.errorMessage,
        createdBy,
        createdAt: record.createdAt
    };
}

function resolveCreatedBy(req: any): string | undefined {
    if (!req.user) return undefined;
    return JSON.stringify({
        name: req.user.name || [req.user.firstName, req.user.lastName].filter(Boolean).join(' ') || undefined,
        email: req.user.email
    });
}

/**
 * Get all scheduled emails with filtering & pagination
 */
export const getScheduledEmails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;

        const records = await MailSchedulerClient.listEmails(status as string | undefined);
        const activeUsersCount = await User.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            emails: records.map(toFrontendShape),
            activeUsersCount
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] getScheduledEmails:', error);
        res.status(500).json({ success: false, msg: 'Server error listing scheduled emails', error: error.message });
    }
};

/**
 * Get predefined HTML templates plus any custom templates added by admins
 */
export const getPredefinedTemplates = async (_req: Request, res: Response): Promise<void> => {
    try {
        const customTemplates = await EmailTemplate.find().sort({ createdAt: -1 });

        const formattedCustomTemplates = customTemplates.map((tpl: any) => ({
            id: tpl._id.toString(),
            name: tpl.name,
            category: tpl.category,
            description: tpl.description,
            subject: tpl.subject,
            previewText: tpl.previewText,
            badge: tpl.badge,
            html: tpl.html,
            isCustom: true
        }));

        res.status(200).json({
            success: true,
            templates: [...PREDEFINED_EMAIL_TEMPLATES, ...formattedCustomTemplates]
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] getPredefinedTemplates:', error);
        res.status(500).json({ success: false, msg: 'Failed to fetch email templates' });
    }
};

/**
 * Create a new custom, reusable email template (unlimited)
 */
export const createCustomTemplate = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, category, description, subject, previewText, badge, html } = req.body;

        if (!name || !subject || !html) {
            res.status(400).json({ success: false, msg: 'Please provide a template Name, Subject, and HTML content.' });
            return;
        }

        const newTemplate = new EmailTemplate({
            name,
            category: category || 'Custom',
            description: description || '',
            subject,
            previewText: previewText || '',
            badge: badge || 'CUSTOM',
            html,
            createdBy: req.user?._id
        });

        await newTemplate.save();

        res.status(201).json({
            success: true,
            msg: 'Custom template saved successfully.',
            template: {
                id: newTemplate._id.toString(),
                name: newTemplate.name,
                category: newTemplate.category,
                description: newTemplate.description,
                subject: newTemplate.subject,
                previewText: newTemplate.previewText,
                badge: newTemplate.badge,
                html: newTemplate.html,
                isCustom: true
            }
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] createCustomTemplate:', error);
        res.status(500).json({ success: false, msg: 'Failed to save custom template', error: error.message });
    }
};

/**
 * Update an existing custom email template
 */
export const updateCustomTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, category, description, subject, previewText, badge, html } = req.body;

        if (!name || !subject || !html) {
            res.status(400).json({ success: false, msg: 'Please provide a template Name, Subject, and HTML content.' });
            return;
        }

        const updated = await EmailTemplate.findByIdAndUpdate(
            id,
            { name, category: category || 'Custom', description: description || '', subject, previewText: previewText || '', badge: badge || 'CUSTOM', html },
            { new: true, runValidators: true }
        );

        if (!updated) {
            res.status(404).json({ success: false, msg: 'Custom template not found.' });
            return;
        }

        res.status(200).json({
            success: true,
            msg: 'Custom template updated successfully.',
            template: {
                id: updated._id.toString(),
                name: updated.name,
                category: updated.category,
                description: updated.description,
                subject: updated.subject,
                previewText: updated.previewText,
                badge: updated.badge,
                html: updated.html,
                isCustom: true
            }
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] updateCustomTemplate:', error);
        res.status(500).json({ success: false, msg: 'Failed to update custom template', error: error.message });
    }
};

/**
 * Delete a custom email template
 */
export const deleteCustomTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await EmailTemplate.findByIdAndDelete(id);

        if (!deleted) {
            res.status(404).json({ success: false, msg: 'Custom template not found.' });
            return;
        }

        res.status(200).json({ success: true, msg: 'Custom template deleted successfully.' });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] deleteCustomTemplate:', error);
        res.status(500).json({ success: false, msg: 'Failed to delete custom template' });
    }
};

/**
 * Create a new scheduled email (delegated to the mail-scheduler service)
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

        let targetRecipients: string[] = [];
        if (recipientType === 'all_users') {
            const users = await User.find({ isActive: true }, 'email');
            targetRecipients = users.map(u => u.email).filter(Boolean);
        } else {
            targetRecipients = recipientsList;
        }

        if (targetRecipients.length === 0) {
            res.status(400).json({ success: false, msg: 'No active recipient email addresses found for this email task.' });
            return;
        }

        const record = await MailSchedulerClient.createEmail({
            title,
            subject,
            html: htmlContent,
            recipientType: recipientType || 'all_users',
            recipients: targetRecipients,
            scheduledAt: targetDate.toISOString(),
            templateId: templateId || 'custom',
            createdBy: resolveCreatedBy(req)
        });

        const isImmediate = record.status === 'sent';

        res.status(201).json({
            success: true,
            msg: isImmediate
                ? 'Email dispatched immediately.'
                : 'Email scheduled successfully.',
            scheduledEmail: toFrontendShape(record)
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] createScheduledEmail:', error);
        res.status(500).json({ success: false, msg: error.message || 'Failed to schedule email' });
    }
};

/**
 * Update an existing pending scheduled email
 */
export const updateScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, subject, recipientType, customRecipients, templateId, htmlContent, scheduledAt } = req.body;

        const existing = await MailSchedulerClient.getEmail(id);
        if (!existing) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        if (existing.status !== 'pending') {
            res.status(400).json({ success: false, msg: `Cannot edit email with status '${existing.status}'. Only pending emails can be modified.` });
            return;
        }

        const payload: any = {};
        if (title) payload.title = title;
        if (subject) payload.subject = subject;
        if (htmlContent) payload.html = htmlContent;
        if (templateId) payload.templateId = templateId;
        if (scheduledAt) {
            const targetDate = new Date(scheduledAt);
            if (isNaN(targetDate.getTime())) {
                res.status(400).json({ success: false, msg: 'Invalid date/time format for scheduledAt.' });
                return;
            }
            payload.scheduledAt = targetDate.toISOString();
        }

        if (recipientType) {
            payload.recipientType = recipientType;
            if (recipientType === 'all_users') {
                const users = await User.find({ isActive: true }, 'email');
                payload.recipients = users.map(u => u.email).filter(Boolean);
            } else if (customRecipients) {
                payload.recipients = Array.isArray(customRecipients)
                    ? customRecipients.map((e: string) => e.trim().toLowerCase()).filter(Boolean)
                    : String(customRecipients).split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
            }
        } else if (customRecipients) {
            payload.recipients = Array.isArray(customRecipients)
                ? customRecipients.map((e: string) => e.trim().toLowerCase()).filter(Boolean)
                : String(customRecipients).split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
        }

        const updated = await MailSchedulerClient.updateEmail(id, payload);

        res.status(200).json({
            success: true,
            msg: 'Scheduled email updated successfully.',
            scheduledEmail: toFrontendShape(updated)
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] updateScheduledEmail:', error);
        res.status(500).json({ success: false, msg: error.message || 'Failed to update scheduled email' });
    }
};

/**
 * Cancel or Delete a scheduled email
 */
export const deleteScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await MailSchedulerClient.getEmail(id);

        if (!existing) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        await MailSchedulerClient.cancelEmail(id);

        res.status(200).json({
            success: true,
            msg: 'Scheduled email cancelled successfully.'
        });
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] deleteScheduledEmail:', error);
        res.status(500).json({ success: false, msg: error.message || 'Failed to delete scheduled email' });
    }
};

/**
 * Manually trigger immediate sending of a pending email schedule
 */
export const sendNowScheduledEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const existing = await MailSchedulerClient.getEmail(id);

        if (!existing) {
            res.status(404).json({ success: false, msg: 'Scheduled email not found.' });
            return;
        }

        if (existing.status === 'sent') {
            res.status(400).json({ success: false, msg: 'This email has already been sent.' });
            return;
        }

        const result = await MailSchedulerClient.sendNow(id);

        if (result.success) {
            res.status(200).json({ success: true, msg: 'Email dispatched immediately.', scheduledEmail: result.scheduledEmail ? toFrontendShape(result.scheduledEmail) : undefined });
        } else {
            res.status(500).json({ success: false, msg: `Failed to dispatch email: ${result.msg || 'Unknown error'}` });
        }
    } catch (error: any) {
        console.error('[CONTROLLER-ERROR] sendNowScheduledEmail:', error);
        res.status(500).json({ success: false, msg: error.message || 'Error sending scheduled email immediately.' });
    }
};

/**
 * Send a quick test email preview to the admin's email address.
 * This is a one-off preview send (not persisted as a campaign), so it goes
 * straight through NotificationService rather than the mail-scheduler.
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
