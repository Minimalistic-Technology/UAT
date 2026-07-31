// Native fetch works in Node 18, utilizing global fetch.

const sendEmail = async ({ to, subject, htmlContent }) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    email: process.env.BREVO_FROM_EMAIL || 'noreply@infilink.com',
                    name: process.env.WEB_NAME || 'Infilink'
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error sending email via Brevo:', errorData);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Email caught error:', error);
        return false;
    }
};

module.exports = sendEmail;
