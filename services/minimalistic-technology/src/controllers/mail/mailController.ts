import { Request, Response } from "express";
import sgMail from "@sendgrid/mail";
import asyncHandler from "../../utils/asyncHandler";
import ErrorHandler from "../../utils/errorHandler";
import dotenv from "dotenv";

dotenv.config();

// Set API Key
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendMail = asyncHandler(async (req: Request, res: Response) => {
    const { templateId, templateName, formData, html, text } = req.body;

    if (!formData || !formData.email) {
        throw new ErrorHandler("Form data with at least an email is required", 400);
    }

    if (!templateId && !html && !text) {
        throw new ErrorHandler("Either templateId, html, or text is required", 400);
    }

    const msg: any = {
        to: req.body.to || formData.to || process.env.RECEIVER_EMAIL || "info@minimalistic-technology.com",
        from: process.env.FROM_EMAIL || "no-reply@minimalistic-technology.com",
        replyTo: formData.email, // Replies to the notification go to the user
        dynamicTemplateData: {
            ...formData,
            templateName,
            subject: formData.subject || `New Inquiry: ${templateName || "Minimalistic Technology"}`,
        },
    };

    if (templateId) {
        msg.templateId = templateId;
    } else {
        msg.subject = formData.subject || "New Inquiry from Minimalistic Technology";
        if (html) msg.html = html;
        if (text) msg.text = text;
    }

    try {
        console.log("Process 1: Sending Admin Notification...");
        const [adminResponse] = await sgMail.send(msg);
        console.log("Admin Email Status:", adminResponse.statusCode);

        let userResponseStatus = "Waiting...";

        // 2. Send Confirmation Email to User
        if (formData.email) {
            try {
                console.log(`Process 2: Sending User Confirmation to ${formData.email}...`);
                const userMsg = {
                    to: formData.email.trim(),
                    from: process.env.FROM_EMAIL || "no-reply@minimalistic-technology.com",
                    subject: `Confirmation: We've received your request for ${templateName || "our services"}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                            <div style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                                <h2 style="margin: 0;">Thank You for Reaching Out!</h2>
                            </div>
                            <div style="padding: 30px; line-height: 1.6;">
                                <p>Hi <strong>${formData.name || "there"}</strong>,</p>
                                <p>We've successfully received your inquiry for the <strong>${templateName || "Minimalistic Technology"}</strong> services. Our team of experts is already reviewing your details and will get back to you within 24-48 hours.</p>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                    <h4 style="margin-top: 0; color: #007bff;">Your Submission Details:</h4>
                                    <ul style="list-style: none; padding: 0;">
                                        <li><strong>Service/Template:</strong> ${templateName || "N/A"}</li>
                                        <li><strong>Email:</strong> ${formData.email}</li>
                                        ${formData.phone ? `<li><strong>Phone:</strong> ${formData.phone}</li>` : ""}
                                        ${formData.company ? `<li><strong>Company:</strong> ${formData.company}</li>` : ""}
                                    </ul>
                                </div>
                                
                                <p>If you have any urgent questions, feel free to reply to this email directly.</p>
                                <p>Best Regards,<br/><strong>The Minimalistic Technology Team</strong></p>
                            </div>
                            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                                &copy; ${new Date().getFullYear()} Minimalistic Technology. All rights reserved.
                            </div>
                        </div>
                    `,
                };
                const [userResponse] = await sgMail.send(userMsg);
                userResponseStatus = userResponse.statusCode.toString();
                console.log("User Email Status:", userResponse.statusCode);
            } catch (uError: any) {
                console.error("User Confirmation Email Failed:", uError.message);
                userResponseStatus = `Error: ${uError.message}`;
            }
        }

        res.status(200).json({
            success: true,
            message: "Inquiry processed successfully",
            adminStatus: adminResponse.statusCode,
            userStatus: userResponseStatus,
        });
    } catch (error: any) {
        console.error("Admin Email Error:", error);
        let errorMessage = error.message || "Failed to send notification email";

        if (error.response && error.response.body && error.response.body.errors) {
            errorMessage = error.response.body.errors.map((e: any) => e.message).join(", ");
        }

        throw new ErrorHandler(errorMessage, 500);
    }
});
