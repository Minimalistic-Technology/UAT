import axios from 'axios';

export const sendMail = async (options: { email: string; subject: string; text?: string; html?: string; name?: string }) => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_FROM_EMAIL || "parthdoshi480@gmail.com";

    if (!brevoApiKey) {
        throw new Error("BREVO_API_KEY is missing in environment variables.");
    }

    const payload = {
        sender: { name: "Minimalistic Technology", email: senderEmail },
        to: [{ email: options.email, name: options.name || options.email }],
        subject: options.subject,
        textContent: options.text || "",
        htmlContent: options.html || options.text || "",
    };

    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    } catch (error: any) {
        console.error("Brevo API Error:", error.response?.data || error.message);
        throw new Error("Failed to send email via Brevo.");
    }
};
