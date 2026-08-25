import nodemailer from 'nodemailer';
// @ts-ignore
import { BrevoClient } from '@getbrevo/brevo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Bill from '../models/Bill';

class NotificationService {
    private static _emailTransporter: any = null;
    private static _isTestAccount: boolean = false;

    private static getFromAddress(serviceName: string = 'DDTEC Official'): string {
        if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
        if (process.env.EMAIL_USER) return `"${serviceName}" <${process.env.EMAIL_USER}>`;
        return `"${serviceName} Sandbox" <test@ddtec.com>`;
    }

    private static getAdminRecipient(): string {
        return process.env.ADMIN_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_USER || 'admin-orders@ddtec.test';
    }

    private static async getEmailTransporter() {
        if (!this._emailTransporter) {
            if (process.env.EMAIL_SANDBOX === 'true' || (!process.env.EMAIL_USER && !process.env.EMAIL_PASS)) {
                try {
                    const testAccount = await nodemailer.createTestAccount();
                    this._isTestAccount = true;
                    this._emailTransporter = nodemailer.createTransport({
                        host: testAccount.smtp.host,
                        port: testAccount.smtp.port,
                        secure: testAccount.smtp.secure,
                        auth: {
                            user: testAccount.user,
                            pass: testAccount.pass,
                        },
                    });
                    console.log(`[NOTIFICATION] Initialized Nodemailer Ethereal Sandbox Mode (Account: ${testAccount.user})`);
                } catch (err: any) {
                    console.error('[NOTIFICATION] Failed to create Ethereal test account:', err.message || err);
                }
            } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transportOptions: any = {
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                };

                if (process.env.EMAIL_HOST) {
                    transportOptions.host = process.env.EMAIL_HOST;
                    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
                    transportOptions.port = port;
                    // Port 587 uses STARTTLS (secure: false), while 465 uses SSL/TLS (secure: true)
                    transportOptions.secure = process.env.EMAIL_SECURE !== undefined ? (process.env.EMAIL_SECURE === 'true' && port === 465) : port === 465;

                    // SendGrid SMTP authentication requires user to be 'apikey' when using SG API Key
                    if (process.env.EMAIL_HOST.includes('sendgrid') && process.env.EMAIL_PASS.startsWith('SG.')) {
                        transportOptions.auth.user = 'apikey';
                    }
                } else if (process.env.EMAIL_SERVICE) {
                    transportOptions.service = process.env.EMAIL_SERVICE;
                } else {
                    transportOptions.service = 'gmail';
                }

                this._emailTransporter = nodemailer.createTransport(transportOptions);
            }
        }
        return this._emailTransporter;
    }

    /**
     * Helper to send email via Brevo transactional pipeline with Nodemailer fallback
     */
    private static async sendBrevoEmail(mailOptions: any): Promise<{ success: boolean, method: string, messageId?: string }> {
        // 1. Try Brevo if valid API Key is provided
        if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'YOUR_BREVO_API_KEY_HERE') {
            try {
                const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

                const sender = {
                    name: process.env.BREVO_SENDER_NAME || 'DDTECH',
                    email: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'parthdoshi480@gmail.com'
                };

                let toList: { email: string }[] = [];
                if (typeof mailOptions.to === 'string') {
                    toList = mailOptions.to.split(/[,;\s]+/).map((e: string) => e.trim()).filter((e: string) => e.includes('@')).map((e: string) => ({ email: e }));
                } else if (Array.isArray(mailOptions.to)) {
                    toList = mailOptions.to.flatMap((t: string) => 
                        t.split(/[,;\s]+/).map((e: string) => e.trim()).filter((e: string) => e.includes('@'))
                    ).map((e: string) => ({ email: e }));
                }

                let bccList = undefined;
                if (mailOptions.bcc) {
                    bccList = [{ email: mailOptions.bcc }];
                }

                let brevoAttachments = undefined;
                if (mailOptions.attachments && mailOptions.attachments.length > 0) {
                    brevoAttachments = mailOptions.attachments.map((att: any) => ({
                        name: att.filename,
                        content: att.content
                    }));
                }

                const brevoPayload: any = {
                    subject: mailOptions.subject,
                    htmlContent: mailOptions.html,
                    sender: sender,
                    to: toList,
                    bcc: bccList,
                    attachment: brevoAttachments
                };

                if (mailOptions.scheduledAt) {
                    brevoPayload.scheduledAt = mailOptions.scheduledAt;
                }

                const result = await brevo.transactionalEmails.sendTransacEmail(brevoPayload);

                console.log(`[NOTIFICATION] Email ${mailOptions.scheduledAt ? 'scheduled natively via Brevo for ' + mailOptions.scheduledAt : 'sent via Brevo'} to ${mailOptions.to}. Message ID:`, result.messageId);
                return { success: true, method: 'brevo', messageId: result.messageId };
            } catch (error: any) {
                console.error('[NOTIFICATION] Brevo failed, falling back to Nodemailer:', error.message || error);
            }
        }

        // 2. Fallback to Nodemailer (Gmail / SMTP / Ethereal Sandbox)
        try {
            const transporter = await this.getEmailTransporter();
            if (!transporter) {
                console.error('[NOTIFICATION] Neither valid BREVO_API_KEY nor Nodemailer (EMAIL_USER/EMAIL_PASS) are available.');
                return { success: false, method: 'nodemailer' };
            }

            const defaultSender = this._isTestAccount ? '"DDTEC Test Sandbox" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER || 'noreply@ddtec.com'}>`;
            const from = mailOptions.from || process.env.EMAIL_FROM || defaultSender;

            let nodemailerAttachments = undefined;
            if (mailOptions.attachments && mailOptions.attachments.length > 0) {
                nodemailerAttachments = mailOptions.attachments.map((att: any) => {
                    if (typeof att.content === 'string') {
                        return {
                            filename: att.filename,
                            content: Buffer.from(att.content, 'base64'),
                            contentType: att.type || 'application/pdf'
                        };
                    }
                    return att;
                });
            }

            const info = await transporter.sendMail({
                from,
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html,
                bcc: mailOptions.bcc,
                attachments: nodemailerAttachments
            });

            console.log(`[NOTIFICATION] Email sent via Nodemailer to ${mailOptions.to}. MessageId:`, info.messageId);

            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log('\n==================================================');
                console.log(`✉️  [ETHEREAL EMAIL PREVIEW URL] View email online:`);
                console.log(`👉 ${previewUrl} 👈`);
                console.log('==================================================\n');
            }

            return { success: true, method: this._isTestAccount ? 'ethereal-sandbox' : 'nodemailer' };
        } catch (error: any) {
            console.error('[NOTIFICATION] Nodemailer fallback also failed:', error.message || error);
            return { success: false, method: 'nodemailer' };
        }
    }

    /**
     * Sends official quotation email with PDF attachment to a recipient email (TO field)
     */
    static async sendQuotationEmail(
        toEmail: string | string[],
        buyerName: string,
        pdfBuffer: Buffer,
        filename: string,
        customSubject?: string,
        notes?: string
    ): Promise<{ success: boolean; msg?: string }> {
        const rawEmailString = typeof toEmail === 'string' ? toEmail : (Array.isArray(toEmail) ? toEmail.join(',') : '');
        const recipientList = rawEmailString.split(/[,;\s]+/).map((e: string) => e.trim()).filter((e: string) => e.length > 0 && e.includes('@'));

        if (recipientList.length === 0) {
            return { success: false, msg: 'Valid recipient email address (TO) is required.' };
        }

        const subject = customSubject || `Official Price Quotation from DDTEC - ${buyerName || 'Valued Client'}`;
        const html = `
            <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #0d9488; color: #ffffff; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: bold;">DDTEC Official Quotation</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #ccfbf1;">Industrial Products & Tech Solutions</p>
                </div>
                <div style="padding: 24px;">
                    <p style="font-size: 15px;">Hello <strong>${buyerName || 'Valued Client'}</strong>,</p>
                    <p style="font-size: 14px; color: #334155;">Please find attached the official price quotation requested from <strong>DDTEC</strong>.</p>
                    ${notes ? `<div style="background-color: #f0fdf4; padding: 14px; border-left: 4px solid #0d9488; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #115e59;"><strong>Note from Admin:</strong><br/>${notes}</div>` : ''}
                    <p style="font-size: 13px; color: #64748b;">The attached PDF contains itemized specifications, tax calculations, and official commercial terms.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent via DDTEC Official Admin System</p>
                </div>
            </div>
        `;

        const attachments = [{
            filename: filename || `Quotation-${Date.now()}.pdf`,
            content: pdfBuffer.toString('base64')
        }];

        const result = await this.sendBrevoEmail({
            to: recipientList,
            subject,
            html,
            attachments
        });

        const recipientsDisplay = recipientList.join(', ');
        return { success: result.success, msg: result.success ? `Quotation emailed successfully to ${recipientsDisplay}` : `Failed to send quotation email to ${recipientsDisplay}` };
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
            const result = await this.sendBrevoEmail(mailOptions);

            if (!result.success) {
                console.log('\n==================================================');
                console.log(`🔑 [DEV SANDBOX OTP] Verification Code for ${email}:`);
                console.log(`👉 ${otp} 👈`);
                console.log(' [Notice] Real email delivery failed. Safely falling back to Mock OTP. ');
                console.log('==================================================\n');
                return { success: true, msg: 'OTP simulated successfully in Dev Mode.' };
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
     * Sends a welcome email upon successful signup
     */
    static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
        try {
            if (!email) return false;
            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);

            const mailOptions: any = {
                from,
                to: email,
                subject: 'Welcome to DDTEC Platform!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #0d9488;">Welcome to DDTEC!</h1>
                        </div>
                        <p>Hi ${name},</p>
                        <p>Your account has been successfully created. You can now access our marketplace, track orders, and experience top-tier IT servicing.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `
            };
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error) {
            console.error('[STRICT-ERROR] Welcome email failed:', error);
            return false;
        }
    }

    /**
     * Sends an Order Confirmation email with a generated Bill PDF
     */
    static async sendOrderConfirmation(order: any): Promise<boolean> {
        try {
            const to = order.shippingInfo?.email;
            if (!to) {
                console.error('[STRICT-ERROR] Cannot send order confirmation: Recipient email is missing from order.');
                return false;
            }

            // Find the associated bill
            const bill = await Bill.findOne({ user: order.user, totalAmount: order.totalAmount }).sort({ createdAt: -1 });

            let attachments: any[] = [];
            if (bill) {
                const pdfBuffer = await this.generateBillPDF(bill);
                attachments.push({
                    content: pdfBuffer.toString('base64'),
                    filename: `Invoice_${bill.customerInfo.name || "Customer"}.pdf`,
                    type: 'application/pdf',
                    disposition: 'attachment'
                });
            }

            const from = this.getFromAddress('DDTEC Official');
            const adminEmail = this.getAdminRecipient();

            const itemsHtml = order.items.map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px 0;">${item.product?.name || 'Product'} x ${item.quantity}</td>
                    <td style="padding: 10px 0; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('');

            const mailOptions: any = {
                from,
                to,
                bcc: adminEmail || undefined,
                subject: `Order Confirmed - #${order._id.toString().slice(-6).toUpperCase()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #0d9488;">Order Confirmed!</h2>
                            <p style="color: #6b7280;">Thank you for your purchase at DDTEC. Your invoice is attached.</p>
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
                attachments: attachments.length > 0 ? attachments : undefined
            };

            console.log(`[NOTIFICATION] Attempting to send Order Confirmation to ${to}...`);
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Order confirmation failed:', error);
            return false;
        }
    }

    /**
     * Sends a Payment Failed email when an online (Cashfree) payment does not complete successfully
     */
    static async sendPaymentFailedEmail(order: any, reason?: string): Promise<boolean> {
        try {
            const to = order.shippingInfo?.email;
            if (!to) {
                console.error('[STRICT-ERROR] Cannot send payment failed email: Recipient email is missing from order.');
                return false;
            }

            const from = this.getFromAddress('DDTEC Official');
            const adminEmail = this.getAdminRecipient();

            const mailOptions: any = {
                from,
                to,
                bcc: adminEmail || undefined,
                subject: `Payment Failed - Order #${order._id.toString().slice(-6).toUpperCase()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #dc2626;">Payment Failed</h2>
                            <p style="color: #6b7280;">We couldn't process your payment for the order below.</p>
                        </div>

                        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fecaca;">
                            <p style="margin: 0; font-size: 12px; color: #7f1d1d;">Order ID: #${order._id}</p>
                            <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold; color: #991b1b;">Amount: ₹${order.totalAmount.toFixed(2)}</p>
                            ${reason ? `<p style="margin: 5px 0 0; font-size: 12px; color: #991b1b;">Reason: ${reason}</p>` : ''}
                        </div>

                        <p style="font-size: 14px; color: #64748b;">No amount has been deducted for this failed attempt. You can try placing the order again, or choose Cash on Delivery instead.</p>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `
            };

            console.log(`[NOTIFICATION] Attempting to send Payment Failed email to ${to}...`);
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Payment failed email failed to send:', error);
            return false;
        }
    }

    private static async generateBillPDF(bill: any): Promise<Buffer> {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(20, 184, 166);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("DDTECH", 20, 17);
        doc.setFontSize(14);
        doc.text("INVOICE", 190, 17, { align: "right" });

        // Details
        doc.setTextColor(50);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("DDTECH TOOLS", 20, 45);
        doc.setFont("helvetica", "normal");
        doc.text("123 Tech Lane, Silicon Valley", 20, 51);
        doc.text("Contact: +91 98765 43210", 20, 57);

        doc.setFont("helvetica", "bold");
        doc.text("BILL TO:", 120, 45);
        doc.setFont("helvetica", "normal");
        doc.text(`${bill.customerInfo.name}`, 120, 51);
        doc.text(`${bill.customerInfo.email || ""}`, 120, 57);
        doc.text(`${bill.customerInfo.address || ""}`, 120, 63, { maxWidth: 70 });

        const tableData = bill.items.map((item: any) => {
            const itemTotal = item.price * item.quantity;
            const iTax = item.taxes.reduce((acc: number, tax: any) => acc + (itemTotal * (tax.rate / 100)), 0);
            return [
                item.name,
                `Rs. ${item.price.toLocaleString()}`,
                item.quantity,
                `Rs. ${iTax.toLocaleString()}`,
                `Rs. ${(itemTotal + iTax).toLocaleString()}`
            ];
        });

        autoTable(doc, {
            startY: 80,
            head: [["Product Name", "Unit Price", "Quantity", "Tax Amount", "Total"]],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [20, 184, 166], halign: 'center' },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'center' },
                3: { halign: 'right' },
                4: { halign: 'right', fontStyle: 'bold' }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount: Rs. ${bill.totalAmount.toLocaleString()}`, 190, finalY, { align: "right" });

        return Buffer.from(doc.output('arraybuffer'));
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

            const result = await this.sendBrevoEmail(mailOptions);

            if (!result.success) return false;

            console.log(`[NOTIFICATION] Contact Notification Mail send call finished via ${result.method}.`);

            if (result.method === 'brevo') {
                console.log(`[STRICT] Brevo Email notification sent successfully.`);
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
     * Sends a successful login alert to the User
     */
    static async sendLoginAlert(user: any, ip?: string): Promise<boolean> {
        try {
            if (!user.email) return false;

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);

            const mailOptions: any = {
                from,
                to: user.email,
                subject: `New Login to your DDTEC Account`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0d9488; text-align: center;">Security Alert</h2>
                        <p>Hello ${user.name || user.firstName || 'Customer'},</p>
                        <p>We noticed a successful login to your DDTEC account.</p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <p style="margin: 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                            <p style="margin: 5px 0 0;"><strong>Status:</strong> Successful</p>
                            ${ip ? `<p style="margin: 5px 0 0;"><strong>IP Address:</strong> ${ip}</p>` : ''}
                        </div>
                        <p>If this was you, you don't need to do anything. If you don't recognize this activity, please contact support immediately.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `
            };
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error) {
            console.error('[STRICT-ERROR] Login alert failed:', error);
            return false;
        }
    }

    /**
     * Sends a dedicated Payment & New Order notification email to the Admin
     */
    static async sendAdminPaymentNotification(order: any): Promise<boolean> {
        try {
            const adminEmail = this.getAdminRecipient();
            if (!adminEmail) {
                console.warn('[NOTIFICATION-WARN] No admin email defined for payment notification.');
                return false;
            }

            const from = this.getFromAddress('DDTEC Orders');

            const itemsHtml = (order.items || []).map((item: any) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px; font-size: 13px; color: #1e293b;">${item.product?.name || item.name || 'Product'}</td>
                    <td style="padding: 10px; font-size: 13px; text-align: center; color: #475569;">${item.quantity}</td>
                    <td style="padding: 10px; font-size: 13px; text-align: right; font-weight: bold; color: #0d9488;">₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('');

            const paymentMethodDisplay = order.paymentMethod === 'cashfree' ? 'Online Payment (Cashfree)' : (order.paymentMethod === 'credit' ? 'Wallet / Credit Points' : (order.paymentMethod || 'COD').toUpperCase());
            const paymentStatusBadgeColor = order.paymentStatus === 'paid' ? '#059669' : (order.paymentStatus === 'pending' ? '#d97706' : '#dc2626');

            const mailOptions: any = {
                from,
                to: adminEmail,
                subject: `💰 Payment / New Order Received: #${order._id.toString().slice(-6).toUpperCase()} (₹${order.totalAmount.toFixed(2)})`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
                        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
                            <h2 style="margin: 0; font-size: 22px;">💳 New Order Payment Notification</h2>
                            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">A customer has placed an order transaction.</p>
                        </div>

                        <div style="background: #f8fafc; padding: 16px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Order ID</p>
                                    <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: bold; font-family: monospace;">#${order._id}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Total Amount</p>
                                    <p style="margin: 2px 0 0 0; font-size: 18px; font-weight: 900; color: #0d9488;">₹${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 10px;">Payment & Customer Details</h3>
                            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 13px; line-height: 1.6;">
                                <p style="margin: 3px 0;"><strong>Customer Name:</strong> ${order.shippingInfo?.fullName || 'N/A'}</p>
                                <p style="margin: 3px 0;"><strong>Email:</strong> ${order.shippingInfo?.email || 'N/A'}</p>
                                <p style="margin: 3px 0;"><strong>Phone:</strong> ${order.shippingInfo?.phone || 'N/A'}</p>
                                <p style="margin: 3px 0;"><strong>Shipping Address:</strong> ${order.shippingInfo?.address || ''}, ${order.shippingInfo?.city || ''} ${order.shippingInfo?.zip ? '- ' + order.shippingInfo.zip : ''}</p>
                                <p style="margin: 3px 0;"><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
                                <p style="margin: 3px 0;"><strong>Payment Status:</strong> <span style="color: ${paymentStatusBadgeColor}; font-weight: bold; text-transform: uppercase;">${order.paymentStatus || 'pending'}</span></p>
                                ${order.cashfree?.cfPaymentId ? `<p style="margin: 3px 0;"><strong>Cashfree Payment ID:</strong> ${order.cashfree.cfPaymentId}</p>` : ''}
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 10px;">Ordered Items</h3>
                            <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                                <thead>
                                    <tr style="background: #f1f5f9;">
                                        <th style="padding: 10px; font-size: 12px; text-align: left; color: #475569;">Item</th>
                                        <th style="padding: 10px; font-size: 12px; text-align: center; color: #475569;">Qty</th>
                                        <th style="padding: 10px; font-size: 12px; text-align: right; color: #475569;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                        </div>

                        <div style="text-align: center; margin: 24px 0 10px;">
                            <a href="${(process.env.FRONTEND_URL || 'http://localhost:3000')}/admin" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">Open Admin Orders Dashboard</a>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">DDTEC Automated Admin Notification System</p>
                    </div>
                `
            };

            console.log(`[NOTIFICATION] Attempting to send Admin Payment Notification to ${adminEmail}...`);
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error: any) {
            console.error('[STRICT-ERROR] Admin payment notification failed:', error);
            return false;
        }
    }

    /**
     * Sends an Order Status Update email
     */
    static async sendOrderStatusUpdate(order: any, status: string): Promise<boolean> {
        try {
            const to = order.shippingInfo?.email;
            if (!to) return false;

            const from = this.getFromAddress('DDTEC Official');

            // Format status for display
            let statusDisplay = '';
            let message = '';
            switch (status) {
                case 'pending':
                    statusDisplay = 'Order Placed & Confirmed';
                    message = 'Your order has been received and verified. Our warehouse team has queued it for packing.';
                    break;
                case 'processing':
                    statusDisplay = 'In Packing Queue';
                    message = 'Your order is currently being packed in our warehouse fulfillment deck. We will notify you once it is dispatched/shipped.';
                    break;
                case 'shipped':
                    statusDisplay = 'Dispatched / Shipped';
                    message = 'Good news! Your order has been dispatched from our warehouse and is on its way to you via courier.';
                    break;
                case 'delivered':
                    statusDisplay = 'Delivered';
                    message = 'Your order has been successfully delivered. Thank you for shopping with DDTEC!';
                    break;
                case 'cancelled':
                    statusDisplay = 'Rejected / Cancelled';
                    message = 'Unfortunately your order has been rejected/cancelled. If you were charged online, the amount will be refunded to your original payment method within 5-7 business days. Please contact support if you have any questions.';
                    break;
                default:
                    statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
                    message = `Your order status has been updated to ${statusDisplay}.`;
                    break;
            }

            const itemsHtml = (order.items || []).map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 0; font-size: 13px;">${item.product?.name || item.name || 'Product'} x ${item.quantity}</td>
                    <td style="padding: 8px 0; text-align: right; font-size: 13px; font-weight: bold; color: #0d9488;">₹${((item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('');

            const mailOptions: any = {
                from,
                to,
                subject: `Order Update: ${statusDisplay} - #${order._id.toString().slice(-6).toUpperCase()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #0d9488; margin-bottom: 6px;">Order Update: ${statusDisplay}</h2>
                            <p style="color: #64748b; font-size: 14px; margin: 0;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
                        </div>
                        
                        <p style="font-size: 14px; color: #334155;">Hello <strong>${order.shippingInfo?.fullName || 'Customer'}</strong>,</p>
                        <p style="font-size: 14px; color: #475569; line-height: 1.6;">${message}</p>

                        <div style="background: #f8fafc; padding: 16px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px;">
                                <span style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Current Status:</span>
                                <span style="font-size: 12px; color: #0d9488; font-weight: bold; text-transform: uppercase;">${statusDisplay}</span>
                            </div>
                            ${itemsHtml ? `
                                <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                                    ${itemsHtml}
                                    <tr>
                                        <td style="padding: 10px 0 0; font-weight: bold; font-size: 14px;">Total Amount</td>
                                        <td style="padding: 10px 0 0; text-align: right; font-weight: bold; color: #0d9488; font-size: 14px;">₹${(order.totalAmount || 0).toFixed(2)}</td>
                                    </tr>
                                </table>
                            ` : ''}
                        </div>

                        <div style="text-align: center; margin: 24px 0 10px;">
                            <a href="${(process.env.FRONTEND_URL || 'http://localhost:3000')}/orders" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">Track Order in Dashboard</a>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `
            };
            console.log(`[NOTIFICATION] Attempting to send Order Status Update email to ${to}...`);
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error) {
            console.error('[STRICT-ERROR] Order status update email failed:', error);
            return false;
        }
    }

    /**
     * Sends custom or scheduled email with predefined HTML
     */
    static async sendCustomEmail(to: string | string[], subject: string, html: string, scheduledAt?: string): Promise<{ success: boolean; msg?: string; messageId?: string }> {
        try {
            const recipients = Array.isArray(to) ? to.join(',') : to;
            if (!recipients) {
                return { success: false, msg: 'No recipient email addresses provided.' };
            }

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER || 'noreply@ddtec.com'}>`);

            const mailOptions: any = {
                from,
                to: recipients,
                subject,
                html
            };

            if (scheduledAt) {
                mailOptions.scheduledAt = scheduledAt;
            }

            console.log(`[NOTIFICATION] ${scheduledAt ? 'Scheduling' : 'Sending'} custom email to: ${recipients} | Subject: "${subject}"${scheduledAt ? ' | ScheduledAt: ' + scheduledAt : ''}`);
            const result = await this.sendBrevoEmail(mailOptions);

            if (!result.success) {
                return { success: false, msg: 'Failed to send email via Brevo.' };
            }

            return { success: true, msg: 'Email dispatched successfully.', messageId: result.messageId };
        } catch (error: any) {
            console.error('[NOTIFICATION-ERROR] Failed to send custom email:', error);
            const errorMsg = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
            return { success: false, msg: errorMsg };
        }
    }

    /**
     * Cancels a scheduled email on Brevo servers using its message/batch identifier
     */
    static async cancelScheduledBrevoEmail(identifier: string): Promise<boolean> {
        if (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'YOUR_BREVO_API_KEY_HERE') {
            try {
                const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
                await brevo.transactionalEmails.deleteScheduledEmailById({ identifier });
                console.log(`[NOTIFICATION] Brevo scheduled email cancelled on Brevo servers (ID: ${identifier})`);
                return true;
            } catch (error: any) {
                console.error('[NOTIFICATION] Failed to cancel Brevo scheduled email:', error.message || error);
                return false;
            }
        }
        return false;
    }

    /**
     * Checks SMTP status and logs results.
     */
    static async checkStatus(): Promise<{ success: boolean; message: string }> {
        return { success: true, message: 'Brevo Transac API Enabled (Nodemailer Disabled)' };
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
