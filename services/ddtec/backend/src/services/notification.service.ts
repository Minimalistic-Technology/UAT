// @ts-ignore
import { BrevoClient } from '@getbrevo/brevo';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Bill from '../models/Bill';

class NotificationService {
    private static _emailTransporter: any = null;
    private static _isTestAccount: boolean = false;

    private static async getEmailTransporter() {
        console.log('[NOTIFICATION] Transporter logic superseded by BrevoClient integration.');
        return null;
    }

    /**
     * Helper to send email via Brevo transactional pipeline
     */
    private static async sendBrevoEmail(mailOptions: any): Promise<{ success: boolean, method: string }> {
        try {
            const apiKey = process.env.BREVO_API_KEY || 'YOUR_BREVO_API_KEY_HERE';
            const brevo = new BrevoClient({ apiKey });

            const sender = {
                name: process.env.BREVO_SENDER_NAME || 'DDTECH',
                email: process.env.BREVO_SENDER_EMAIL || 'parthdoshi480@gmail.com'
            };

            let toList = [];
            if (typeof mailOptions.to === 'string') {
                toList.push({ email: mailOptions.to });
            } else if (Array.isArray(mailOptions.to)) {
                toList = mailOptions.to.map((t: string) => ({ email: t }));
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

            const result = await brevo.transactionalEmails.sendTransacEmail({
                subject: mailOptions.subject,
                htmlContent: mailOptions.html,
                sender: sender,
                to: toList,
                bcc: bccList,
                attachment: brevoAttachments
            });

            console.log(`[NOTIFICATION] Email sent via Brevo to ${mailOptions.to}. Message ID:`, result.messageId);
            return { success: true, method: 'brevo' };
        } catch (error: any) {
            console.error('[NOTIFICATION] Brevo failed:', error);
            if (error.response) {
                console.error('[NOTIFICATION] Brevo Error Body:', error.response.body);
            }
            return { success: false, method: 'brevo' };
        }
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

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);
            const adminEmail = this._isTestAccount ? 'admin-test@ddtec.com' : process.env.EMAIL_TO;

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
     * Sends an Order Status Update email
     */
    static async sendOrderStatusUpdate(order: any, status: string): Promise<boolean> {
        try {
            const to = order.shippingInfo?.email;
            if (!to) return false;

            const from = process.env.EMAIL_FROM || (this._isTestAccount ? '"DDTEC Test" <test@ddtec.com>' : `"DDTEC Official" <${process.env.EMAIL_USER}>`);

            // Format status for display
            let statusDisplay = '';
            let message = '';
            switch (status) {
                case 'processing':
                    statusDisplay = 'In Packing Queue';
                    message = 'Your order is currently being packed in our warehouse. We will notify you once it is dispatched/shipped.';
                    break;
                case 'shipped':
                    statusDisplay = 'Dispatched / Shipped';
                    message = 'Good news! Your order has been dispatched from our warehouse and is on its way to you via courier.';
                    break;
                case 'delivered':
                    statusDisplay = 'Delivered';
                    message = 'Your order has been successfully delivered. Thank you for shopping with DDTEC!';
                    break;
                default:
                    return false; // Don't send emails for other statuses unless needed
            }

            const mailOptions: any = {
                from,
                to,
                subject: `Order Update: ${statusDisplay} - #${order._id.toString().slice(-6).toUpperCase()}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0d9488; text-align: center;">Order Update: ${statusDisplay}</h2>
                        <p>Hello ${order.shippingInfo?.fullName || 'Customer'},</p>
                        <p>${message}</p>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 16px;"><strong>Order ID:</strong> #${order._id}</p>
                        </div>
                        <p>You can track the live status from your <strong>My Orders</strong> section in the dashboard.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 DDTEC. All rights reserved.</p>
                    </div>
                `
            };
            const result = await this.sendBrevoEmail(mailOptions);
            return result.success;
        } catch (error) {
            console.error('[STRICT-ERROR] Order status update email failed:', error);
            return false;
        }
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
