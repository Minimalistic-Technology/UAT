
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';

// Load env from one level up (since this is in scripts/)
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM;
const TO_EMAIL = 'dbad000765@gmail.com'; // Using the email seen in previous logs

console.log('--- SendGrid Isolation Test ---');
console.log(`API Key Present: ${!!API_KEY}`);
console.log(`From: ${FROM_EMAIL}`);
console.log(`To: ${TO_EMAIL}`);

if (!API_KEY) {
    console.error('ERROR: SENDGRID_API_KEY is missing in .env');
    process.exit(1);
}

if (!FROM_EMAIL) {
    console.error('ERROR: EMAIL_FROM is missing in .env');
    process.exit(1);
}

sgMail.setApiKey(API_KEY);

const msg = {
    to: TO_EMAIL,
    from: FROM_EMAIL,
    subject: 'DDTEC SendGrid Test',
    text: 'This is a test email to verify SendGrid configuration.',
    html: '<strong>This is a test email to verify SendGrid configuration.</strong>',
};

(async () => {
    try {
        console.log('Attempting to send...');
        const response = await sgMail.send(msg);
        console.log('✅ SendGrid accepted the request.');
        console.log('Status Code:', response[0].statusCode);
        console.log('Headers:', response[0].headers);
        console.log('\nIf you do not receive this email, check your SendGrid Activity Feed: https://app.sendgrid.com/email_activity');
    } catch (error: any) {
        console.error('❌ SendGrid Error:');
        if (error.response) {
            console.error('Status:', error.response.statusCode);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        } else {
            console.error(error);
        }
    }
})();
