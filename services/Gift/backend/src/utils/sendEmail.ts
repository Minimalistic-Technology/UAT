interface SendEmailOptions {
    to: string;
    subject: string;
    htmlContent: string;
}

export const sendEmail = async ({ to, subject, htmlContent }: SendEmailOptions) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const SENDER_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@smartshare.com';

        if (!BREVO_API_KEY) {
            console.warn('BREVO_API_KEY is not defined. Skipping email sending.');
            return;
        }

        const data = {
            sender: { name: 'SmartShare', email: SENDER_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Error sending email via Brevo:', errData);
            throw new Error('Failed to send email');
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error sending email via Brevo:', error.message);
        throw new Error('Failed to send email');
    }
};
