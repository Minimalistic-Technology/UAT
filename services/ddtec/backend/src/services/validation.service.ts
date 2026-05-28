class ValidationService {
    // List of common disposable/temp email domains
    private static disposableDomains = new Set([
        'mailinator.com',
        'temp-mail.org',
        'guerrillamail.com',
        '10minutemail.com',
        'yopmail.com',
        'sharklasers.com',
        'dispostable.com',
        'getnada.com',
        'tempmail.net',
        'maildrop.cc',
        'teleworm.us',
        'dayrep.com',
        'einrot.com',
        'flekken.no',
        'rhyta.com'
    ]);

    /**
     * Validates if an email is real and not from a disposable domain
     */
    static isRealEmail(email: string): { isValid: boolean, msg?: string } {
        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return { isValid: false, msg: 'Invalid email format' };
        }

        const domain = email.split('@')[1]?.toLowerCase();
        if (this.disposableDomains.has(domain)) {
            return { isValid: false, msg: 'Disposable/Temporary emails are not allowed' };
        }

        return { isValid: true };
    }

    /**
     * Validates if a phone number is in a reasonable format
     */
    static isRealPhone(phone: string): { isValid: boolean, msg?: string } {
        // Basic international format check
        // Allows +, digits, and reasonable length (7 to 15)
        const phoneRegex = /^\+?[1-9]\d{6,14}$/;
        if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
            return { isValid: false, msg: 'Invalid phone number format' };
        }

        return { isValid: true };
    }
}

export default ValidationService;
