import dotenv from 'dotenv';
import path from 'path';
import NotificationService from '../src/services/notification.service';

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function testOTP() {
    console.log('--- Testing OTP Template Rendering ---');
    const testEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;
    const testOTP = '123456';

    if (!testEmail) {
        console.error('No email configured in .env to send to.');
        return;
    }

    console.log(`Sending OTP "${testOTP}" to ${testEmail}...`);

    // We expect the debug log we added to print the HTML content here
    const result = await NotificationService.sendOTP(testEmail, testOTP);

    console.log(`Send Result: ${result}`);
}

testOTP();
