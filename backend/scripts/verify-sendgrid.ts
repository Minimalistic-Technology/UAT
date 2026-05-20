import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import path from 'path';

// Load .env from the root of services/ddtec
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.EMAIL_USER;
// Use EMAIL_TO if available, otherwise send to self (fromEmail)
const toEmail = process.env.EMAIL_TO || fromEmail;

console.log('--- SendGrid Verification Config ---');
console.log(`[TIMESTAMP] ${new Date().toISOString()}`);
console.log(`API Key Present: ${!!apiKey}`);
if (apiKey) console.log(`API Key Prefix: ${apiKey.substring(0, 3)}...`);
console.log(`From Email: ${fromEmail}`);
console.log(`To Email: ${toEmail}`);

if (fromEmail === toEmail && fromEmail?.includes('gmail.com')) {
    console.warn('\n⚠️  WARNING: You are sending from a Gmail address TO the same Gmail address via SendGrid.');
    console.warn('⚠️  Gmail highly likely to BLOCK this as spam/spoofing.');
    console.warn('⚠️  Please try changing EMAIL_TO in .env to a different address (e.g., Yahoo, Outlook, or a friend\'s email) for testing.\n');
}

if (!apiKey || !apiKey.startsWith('SG.')) {
    console.error('CRITICAL: Invalid or missing SENDGRID_API_KEY');
    process.exit(1);
}

if (!fromEmail) {
    console.error('CRITICAL: Missing EMAIL_USER in .env. SendGrid requires a verified sender.');
    process.exit(1);
}

sgMail.setApiKey(apiKey);

const msg = {
    to: toEmail,
    from: fromEmail,
    subject: 'DDTEC SendGrid Verification',
    text: 'If you receive this, SendGrid is configured correctly!',
    html: '<strong>If you receive this, SendGrid is configured correctly!</strong>',
};

console.log('Attempting to send verification email...');

sgMail
    .send(msg)
    .then(() => {
        console.log('✅ Email sent successfully!');
    })
    .catch((error) => {
        console.error('❌ Failed to send email:', error);
        if (error.response) {
            console.error('Do verify that the "From" email is added to your SendGrid authorized senders.');
            console.error(JSON.stringify(error.response.body, null, 2));
        }
    });
