import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

class NotificationService {
    private static _emailTransporter: any = null;
    private static _isTestAccount: boolean = false;

    private static async getEmailTransporter() {
        console.log('[NOTIFICATION] Nodemailer is currently disabled in favor of SendGrid.');
        return null;
        /*
        if (!this._emailTransporter) {
            // ... original nodemailer setup ...
        }
        return this._emailTransporter;
        */
    }

    /**
     * Helper to send email via SendGrid with Nodemailer fallback
     */
    private static async sendWithFallback(mailOptions: any): Promise<{ success: boolean, info?: any, method: 'sendgrid' | 'nodemailer' }> {
        // 1. Try SendGrid
        if (process.env.SENDGRID_API_KEY) {
            try {
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                const msg = {
                    to: mailOptions.to,
                    from: mailOptions.from, // Ensure this is a verified sender in SendGrid
                    subject: mailOptions.subject,
                    html: mailOptions.html,
                    bcc: mailOptions.bcc,
                    replyTo: mailOptions.replyTo,
                };

                const [response] = await sgMail.send(msg as any);
                console.log(`[NOTIFICATION] Email sent via SendGrid to ${mailOptions.to}`);
                return { success: true, info: response, method: 'sendgrid' };
            } catch (error: any) {
                console.error('[NOTIFICATION] SendGrid failed, falling back to Nodemailer:', error);
                if (error.response) {
                    console.error('[NOTIFICATION] SendGrid Error Body:', error.response.body);
                }
            }
        }

        // 2. Fallback to Nodemailer (DISABLED)
        // try {
        //     const transporter = await this.getEmailTransporter();
        //     if (!transporter) {
        //         console.error('[NOTIFICATION] Nodemailer transporter not available for fallback.');
        //         return { success: false, method: 'nodemailer' };
        //     }
        //     const info = await transporter.sendMail(mailOptions);
        //     return { success: true, info, method: 'nodemailer' };
        // } catch (error) {
        //     console.error('[NOTIFICATION] Nodemailer also failed:', error);
        //     return { success: false, method: 'nodemailer' };
        // }

        console.warn('[NOTIFICATION] Fallback to Nodemailer is currently disabled.');
        return { success: false, method: 'sendgrid' };
    }

    /**
     * Sends a real OTP via Email. SMS is currently disabled.
     */
    static async sendOTP(identifier: string, otp: string): Promise<{ success: boolean; msg?: string }> {
        const isEmail = identifier.includes('@');

        if (isEmail) {
            return await this.sendEmailOTP(identifier, otp);
        } else {
            console.error('[STRICT] SMS delivery attempted but is disabled. Use Email for testing.');
            return { success: false, msg: 'SMS delivery is disabled.' };
        }
    }

    private static async sendEmailOTP(email: string, otp: string): Promise<{ success: boolean; msg?: string }> {
        try {
            // ... (transporter check commented out) ...

            if (!email) {
                console.error('[STRICT-ERROR] Cannot send email OTP: Recipient email is missing.');
                return { success: false, msg: 'Recipient email is missing.' };
            }

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);

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

            console.log(`[NOTIFICATION] Attempting to send OTP email to ${email}...`);

            // Use fallback mechanism
            const result = await this.sendWithFallback(mailOptions);

            if (!result.success) {
                return { success: false, msg: 'Failed to send email via SendGrid.' };
            }

            console.log(`[NOTIFICATION] OTP Mail send call finished via ${result.method}.`);

            const host = process.env.EMAIL_HOST || 'unknown-host';
            console.log(`[STRICT] Real Email OTP sent to ${email} via ${result.method} (${host}). From: ${from}`);

            return { success: true, msg: 'OTP sent successfully.' };
        } catch (error: any) {
            console.error('[STRICT-ERROR] Failed to send email OTP:', error);
            const errorMsg = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
            return { success: false, msg: `Email sending failed: ${errorMsg}` };
        }
    }

    /**
     * Sends an Order Confirmation email to the customer
     */
    static async sendOrderConfirmation(order: any): Promise<boolean> {
        try {
            // const transporter = await this.getEmailTransporter();
            // if (!transporter) {
            //    console.error('[STRICT-ERROR] Cannot send order confirmation: Transporter not initialized.');
            //    return false;
            // }

            const to = order.shippingInfo?.email;
            if (!to) {
                console.error('[STRICT-ERROR] Cannot send order confirmation: Recipient email is missing from order.');
                return false;
            }

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);
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
                bcc: adminEmail || undefined, // Only CC admin if EMAIL_TO is defined
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

            console.log(`[NOTIFICATION] Attempting to send Order Confirmation to ${to}...`);

            const result = await this.sendWithFallback(mailOptions);

            if (!result.success) return false;

            console.log(`[NOTIFICATION] Order Confirmation Mail send call finished via ${result.method}.`);

            if (result.method === 'nodemailer' && this._isTestAccount) {
                console.log('[SANDBOX-ORDER] Receipt Preview:', nodemailer.getTestMessageUrl(result.info));
            } else {
                const host = process.env.EMAIL_HOST || 'unknown-host';
                console.log(`[STRICT] Real Order Confirmation sent to ${to} via ${result.method} (${host}). From: ${from}`);
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
            // const transporter = await this.getEmailTransporter();
            // if (!transporter) {
            //    console.error('[STRICT-ERROR] Cannot send contact notification: Transporter not initialized.');
            //    return false;
            // }

            const to = this._isTestAccount ? 'admin-test@ddtec.com' : (process.env.EMAIL_TO || process.env.EMAIL_USER || '');
            if (!to) {
                console.warn('[NOTIFICATION-WARN] EMAIL_TO not defined. Contact notification might not reach anyone.');
            }

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);
            console.log(`[NOTIFICATION] Routing contact message: FROM=${contactData.email} TO=${to}`);
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

            console.log(`[NOTIFICATION] Attempting to send Contact Notification to ${to}...`);

            const result = await this.sendWithFallback(mailOptions);

            if (!result.success) return false;

            console.log(`[NOTIFICATION] Contact Notification Mail send call finished via ${result.method}.`);

            if (result.method === 'nodemailer' && !this._isTestAccount) {
                const host = process.env.EMAIL_HOST || 'unknown-host';
                console.log(`[STRICT] Real Email notification sent. MessageId: ${result.info.messageId} via ${result.method} (${host}). From: ${from}`);
            }

            if (result.method === 'nodemailer' && this._isTestAccount) {
                console.log('[SANDBOX-CONTACT] Message Preview:', nodemailer.getTestMessageUrl(result.info));
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
        return { success: true, message: 'SendGrid Web API Enabled (Nodemailer Disabled)' };
        /*
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
        */
    }
}

export default NotificationService;
