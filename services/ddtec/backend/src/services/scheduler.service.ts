import User from '../models/User';
import NotificationService from './notification.service';

/**
 * Thin helper around scheduled emails.
 *
 * Scheduling is delegated entirely to Brevo's native transactional email
 * scheduling (see NotificationService.sendCustomEmail with a `scheduledAt`).
 * There is no in-process polling loop any more — this class only handles the
 * "send this pending email right now" action triggered manually from the admin UI.
 */
export class SchedulerService {
    /**
     * Resolves the concrete recipient list for a ScheduledEmail document.
     */
    static async resolveRecipients(emailDoc: any): Promise<string[]> {
        if (emailDoc.recipientType === 'all_users') {
            const users = await User.find({ isActive: true }, 'email');
            return users.map((u: any) => u.email).filter(Boolean);
        }
        if (emailDoc.recipientType === 'custom' && Array.isArray(emailDoc.customRecipients)) {
            return emailDoc.customRecipients.filter(Boolean);
        }
        return [];
    }

    /**
     * Dispatches a single ScheduledEmail document immediately via Brevo.
     * If the email was previously registered as a future Brevo schedule, that
     * pending schedule is cancelled first so it does not also fire later.
     */
    static async sendScheduledEmail(emailDoc: any): Promise<boolean> {
        try {
            const targetRecipients = await this.resolveRecipients(emailDoc);

            if (targetRecipients.length === 0) {
                emailDoc.status = 'failed';
                emailDoc.errorMessage = 'No recipients found for this email task.';
                await emailDoc.save();
                return false;
            }

            // Cancel any still-pending Brevo schedule to avoid a duplicate send.
            if (emailDoc.brevoMessageId) {
                await NotificationService.cancelScheduledBrevoEmail(emailDoc.brevoMessageId);
            }

            const result = await NotificationService.sendCustomEmail(
                targetRecipients,
                emailDoc.subject,
                emailDoc.htmlContent
            );

            if (result.success) {
                emailDoc.status = 'sent';
                emailDoc.sentAt = new Date();
                emailDoc.sentCount = targetRecipients.length;
                emailDoc.errorMessage = undefined;
                emailDoc.brevoMessageId = result.messageId;
                await emailDoc.save();
                console.log(`[SCHEDULER] ✅ Scheduled email ${emailDoc._id} sent immediately via Brevo.`);
                return true;
            }

            emailDoc.status = 'failed';
            emailDoc.errorMessage = result.msg || 'Dispatch failed.';
            emailDoc.failedCount = targetRecipients.length;
            await emailDoc.save();
            console.error(`[SCHEDULER] ❌ Scheduled email ${emailDoc._id} failed: ${result.msg}`);
            return false;
        } catch (err: any) {
            console.error(`[SCHEDULER-ERROR] Failed executing scheduled email ${emailDoc._id}:`, err);
            emailDoc.status = 'failed';
            emailDoc.errorMessage = err.message || 'Execution error';
            await emailDoc.save();
            return false;
        }
    }
}

export default SchedulerService;
