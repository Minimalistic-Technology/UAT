import axios, { AxiosInstance } from 'axios';

/**
 * Thin HTTP client for the standalone `mail-scheduler` service (SQLite +
 * node-cron), which is the source of truth for scheduled email jobs. This
 * replaces the previous Brevo-native scheduling integration.
 */
export interface ScheduledEmailPayload {
    title: string;
    subject: string;
    html: string;
    recipientType: 'all_users' | 'custom';
    recipients: string[];
    scheduledAt: string;
    templateId?: string;
    createdBy?: string;
}

export interface ScheduledEmailRecord {
    id: string;
    title: string;
    subject: string;
    html: string;
    recipientType: 'all_users' | 'custom';
    recipients: string[];
    templateId?: string;
    scheduledAt: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    sentAt?: string;
    sentCount: number;
    failedCount: number;
    errorMessage?: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
    if (client) return client;

    const baseURL = process.env.MAIL_SCHEDULER_URL;
    const apiKey = process.env.MAIL_SCHEDULER_API_KEY;

    if (!baseURL || !apiKey) {
        throw new Error('MAIL_SCHEDULER_URL and MAIL_SCHEDULER_API_KEY must be set to use the mail scheduler.');
    }

    client = axios.create({
        baseURL,
        timeout: 10000,
        headers: { 'x-api-key': apiKey }
    });
    return client;
}

function unwrapError(err: any): string {
    return err.response?.data?.msg || err.message || 'Mail scheduler request failed.';
}

export const MailSchedulerClient = {
    async createEmail(payload: ScheduledEmailPayload): Promise<ScheduledEmailRecord> {
        try {
            const { data } = await getClient().post('/emails', payload);
            return data.scheduledEmail;
        } catch (err: any) {
            throw new Error(unwrapError(err));
        }
    },

    async listEmails(status?: string): Promise<ScheduledEmailRecord[]> {
        try {
            const { data } = await getClient().get('/emails', { params: status && status !== 'all' ? { status } : undefined });
            return data.emails;
        } catch (err: any) {
            throw new Error(unwrapError(err));
        }
    },

    async getEmail(id: string): Promise<ScheduledEmailRecord | null> {
        try {
            const { data } = await getClient().get(`/emails/${id}`);
            return data.scheduledEmail;
        } catch (err: any) {
            if (err.response?.status === 404) return null;
            throw new Error(unwrapError(err));
        }
    },

    async updateEmail(id: string, payload: Partial<ScheduledEmailPayload>): Promise<ScheduledEmailRecord> {
        try {
            const { data } = await getClient().patch(`/emails/${id}`, payload);
            return data.scheduledEmail;
        } catch (err: any) {
            throw new Error(unwrapError(err));
        }
    },

    async cancelEmail(id: string): Promise<void> {
        try {
            await getClient().delete(`/emails/${id}`);
        } catch (err: any) {
            throw new Error(unwrapError(err));
        }
    },

    async sendNow(id: string): Promise<{ success: boolean; msg?: string; scheduledEmail?: ScheduledEmailRecord }> {
        try {
            const { data } = await getClient().post(`/emails/${id}/send-now`);
            return data;
        } catch (err: any) {
            if (err.response?.data) return err.response.data;
            throw new Error(unwrapError(err));
        }
    }
};

export default MailSchedulerClient;
