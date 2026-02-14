import nodemailer from 'nodemailer';

class NotificationService {
    private static _emailTransporter: any = null;
    private static _isTestAccount: boolean = false;

    private static async getEmailTransporter() {
        if (!this._emailTransporter) {
            // First Priority: Real Credentials
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                console.log('[NOTIFICATION] Initializing Real Email Service (Gmail/SMTP)');
                this._emailTransporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true, // Use SSL
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                    pool: true, // Use connection pooling for Render
                });
                this._isTestAccount = false;

                // Verify connection on startup
                this._emailTransporter.verify((error: any, success: any) => {
                    if (error) {
                        console.error('[CRITICAL-ERROR] Nodemailer Transporter verification failed:', error);
                    } else {
                        console.log('[NOTIFICATION] Email Server is ready to take our messages');
                    }
                });
            }
            // Second Priority: Zero-Config Ethereal sandbox
            else {
                console.log('[NOTIFICATION] No credentials found. Initializing Ethereal Test Account...');
                try {
                    const testAccount = await nodemailer.createTestAccount();
                    this._emailTransporter = nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: testAccount.user, // generated ethereal user
                            pass: testAccount.pass, // generated ethereal password
                        },
                    });
                    this._isTestAccount = true;
                    console.log('[NOTIFICATION] Ethereal Test Account Created successfully.');
                } catch (error) {
                    console.error('[CRITICAL] Failed to create Ethereal test account:', error);
                    return null;
                }
            }
        }
        return this._emailTransporter;
    }

    /**
     * Sends a real OTP via Email. SMS is currently disabled.
     */
    static async sendOTP(identifier: string, otp: string): Promise<boolean> {
        const isEmail = identifier.includes('@');

        if (isEmail) {
            return await this.sendEmailOTP(identifier, otp);
        } else {
            console.error('[STRICT] SMS delivery attempted but is disabled. Use Email for testing.');
            return false;
        }
    }

    private static async sendEmailOTP(email: string, otp: string): Promise<boolean> {
        try {
            const transporter = await this.getEmailTransporter();
            if (!transporter) return false;

            const from = this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`;

            const mailOptions = {
                from,
                to: email,
                subject: 'Your DDTEC Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0d9488; text-align: center;">DDTEC Verification</h2>
                        <p>Hello,</p>
                        <p>Your verification code for DDTEC is:</p>
                        <div style="background: #f4f4f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 8px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `,
            };

            const info = await transporter.sendMail(mailOptions);

            if (this._isTestAccount) {
                console.log('--------------------------------------------------');
                console.log('[SANDBOX-OTP] Email sent to:', email);
                console.log('[SANDBOX-OTP] OTP Code:', otp);
                console.log('[SANDBOX-OTP] PREVIEW URL:', nodemailer.getTestMessageUrl(info));
                console.log('--------------------------------------------------');
            } else {
                console.log(`[STRICT] Real Email OTP sent to ${email}`);
            }

            return true;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Failed to send email OTP:', error);
            if (error.response) console.error('SMTP Response:', error.response);
            if (error.code) console.error('Error Code:', error.code);
            return false;
        }
    }

    /**
     * Sends an Order Confirmation email to the customer
     */
    static async sendOrderConfirmation(order: any): Promise<boolean> {
        try {
            const transporter = await this.getEmailTransporter();
            if (!transporter) return false;

            const from = this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`;
            const to = order.shippingInfo.email;
            const adminEmail = this._isTestAccount ? 'admin-test@ddtec.com' : process.env.EMAIL_TO;

            const itemsHtml = order.items.map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0;">${item.product?.name || 'Product'} x ${item.quantity}</td>
                    <td style="padding: 10px 0; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('');

            const mailOptions = {
                from,
                to,
                bcc: adminEmail, // Admin gets a copy
                subject: `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #0d9488;">Order Confirmed!</h2>
                            <p style="color: #6b7280;">Thank you for your purchase at DDTEC.</p>
                        </div>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="margin-top: 0; font-size: 16px;">Order Summary</h3>
                            <p style="font-size: 12px; color: #64748b; margin: 5px 0;">Order ID: #${order._id}</p>
                            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                                ${itemsHtml}
                                <tr>
                                    <td style="padding: 10px 0; font-weight: bold;">Total Paid</td>
                                    <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #0d9488;">₹${order.totalAmount.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 16px;">Shipping to:</h3>
                            <p style="color: #475569; font-size: 14px; margin: 5px 0;">
                                ${order.shippingInfo.fullName}<br>
                                ${order.shippingInfo.address}, ${order.shippingInfo.city}<br>
                                ZIP: ${order.shippingInfo.zip}
                            </p>
                        </div>

                        <p style="font-size: 14px; color: #64748b;">We'll notify you once your order is shipped.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `,
            };

            const info = await transporter.sendMail(mailOptions);

            if (this._isTestAccount) {
                console.log('[SANDBOX-ORDER] Receipt Preview:', nodemailer.getTestMessageUrl(info));
            } else {
                console.log(`[STRICT] Real Order Confirmation sent to ${to}`);
            }

            return true;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Order confirmation failed:', error);
            if (error.response) console.error('SMTP Response:', error.response);
            if (error.code) console.error('Error Code:', error.code);
            return false;
        }
    }

    /**
     * Sends a generic contact notification email to the admin
     */
    static async sendContactNotification(contactData: { firstName: string, lastName: string, email: string, message: string }): Promise<boolean> {
        try {
            const transporter = await this.getEmailTransporter();
            if (!transporter) return false;

            const from = this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : process.env.EMAIL_USER;
            const to = this._isTestAccount ? 'admin-test@ddtec.com' : process.env.EMAIL_TO;
            console.log(from , to , contactData.email)
            const mailOptions = {
                from,
                to,
                replyTo: contactData.email,
                subject: `New Contact Form Submission: ${contactData.firstName} ${contactData.lastName}`,
                html: `
                    <div style="font-family: sans-serif;">
                        <h3>New Contact Message</h3>
                        <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName}</p>
                        <p><strong>Email:</strong> ${contactData.email}</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="border-left: 4px solid #0d9488; padding-left: 15px; font-style: italic;">
                            ${contactData.message}
                        </blockquote>
                    </div>
                `,
            };

            const info = await transporter.sendMail(mailOptions);

            if (this._isTestAccount) {
                console.log('[SANDBOX-CONTACT] Message Preview:', nodemailer.getTestMessageUrl(info));
            }

            return true;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Contact notification failed:', error);
            if (error.response) console.error('SMTP Response:', error.response);
            if (error.code) console.error('Error Code:', error.code);
            return false;
        }
    }
    /**
     * Checks SMTP status and logs results.
     */
    static async checkStatus(): Promise<{ success: boolean; message: string }> {
        try {
            const transporter = await this.getEmailTransporter();
            if (!transporter) return { success: false, message: 'Transporter not initialized. Check credentials.' };

            if (this._isTestAccount) {
                return { success: true, message: 'Running in Sandbox Mode (Ethereal)' };
            }

            return new Promise((resolve) => {
                transporter.verify((error: any) => {
                    if (error) {
                        resolve({ success: false, message: error.message });
                    } else {
                        resolve({ success: true, message: 'SMTP Connection Successful' });
                    }
                });
            });
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export default NotificationService;
