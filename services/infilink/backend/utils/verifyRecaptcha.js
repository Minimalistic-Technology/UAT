// Native fetch is available in Node 18+
const verifyRecaptcha = async (captchaToken) => {
    if (!captchaToken) return false;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.warn('RECAPTCHA_SECRET_KEY not set in .env. Bypassing captcha validation in development.');
        return true; // Optionally bypass if not configured, or return false to strictly enforce
    }

    try {
        const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${captchaToken}`
        });

        const data = await response.json();
        return data.success;
    } catch (err) {
        console.error('Error verifying recaptcha:', err);
        return false;
    }
};

module.exports = verifyRecaptcha;
