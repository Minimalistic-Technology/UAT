import ScheduledEmail from '../models/ScheduledEmail';
import User from '../models/User';
import NotificationService from './notification.service';

export class SchedulerService {
    private static checkInterval: NodeJS.Timeout | null = null;
    private static isProcessing = false;

    /**
     * Starts the periodic email schedule checker (runs every 30 seconds)
     */
    static startEmailScheduler(intervalMs: number = 30000) {
        if (this.checkInterval) {
            console.log('[SCHEDULER] Scheduler is already running.');
            return;
        }

        console.log(`[SCHEDULER] Starting Email Scheduler service (interval: ${intervalMs / 1000}s)...`);
        
        // Run immediate check on start
        this.processDueEmails();

        this.checkInterval = setInterval(() => {
            this.processDueEmails();
        }, intervalMs);
    }

    /**
     * Stops the scheduler
     */
    static stopEmailScheduler() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('[SCHEDULER] Email Scheduler stopped.');
        }
    }

    /**
     * Finds pending emails whose scheduledAt <= NOW and dispatches them
     */
    static async processDueEmails() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const now = new Date();
            const dueEmails = await ScheduledEmail.find({
                status: 'pending',
                scheduledAt: { $lte: now }
            }).sort({ scheduledAt: 1 }).limit(10);

            if (dueEmails.length > 0) {
                console.log(`[SCHEDULER] Found ${dueEmails.length} due scheduled email(s) to process.`);
            }

            for (const emailDoc of dueEmails) {
                await this.sendScheduledEmail(emailDoc);
            }
        } catch (error) {
            console.error('[SCHEDULER-ERROR] Error checking due scheduled emails:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Dispatches a single ScheduledEmail document
     */
    static async sendScheduledEmail(emailDoc: any): Promise<boolean> {
        try {
            console.log(`[SCHEDULER] Processing email execution ID: ${emailDoc._id} - Title: "${emailDoc.title}"`);

            let targetRecipients: string[] = [];

            if (emailDoc.recipientType === 'all_users') {
                const users = await User.find({ isActive: true }, 'email');
                targetRecipients = users.map(u => u.email).filter(Boolean);
            } else if (emailDoc.recipientType === 'custom' && Array.isArray(emailDoc.customRecipients)) {
                targetRecipients = emailDoc.customRecipients.filter(Boolean);
            }

            if (targetRecipients.length === 0) {
                console.warn(`[SCHEDULER-WARN] Scheduled email ${emailDoc._id} has no recipients found.`);
                emailDoc.status = 'failed';
                emailDoc.errorMessage = 'No recipients found for this email task.';
                await emailDoc.save();
                return false;
            }

            console.log(`[SCHEDULER] Sending scheduled email to ${targetRecipients.length} recipient(s)...`);
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
                await emailDoc.save();
                console.log(`[SCHEDULER] ✅ Scheduled email ${emailDoc._id} successfully sent!`);
                return true;
            } else {
                emailDoc.status = 'failed';
                emailDoc.errorMessage = result.msg || 'Dispatch failed.';
                emailDoc.failedCount = targetRecipients.length;
                await emailDoc.save();
                console.error(`[SCHEDULER] ❌ Scheduled email ${emailDoc._id} failed: ${result.msg}`);
                return false;
            }
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
