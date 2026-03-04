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
    const { templateId, formData } = req.body;

    if (!templateId) {
        throw new ErrorHandler("Template ID is required", 400);
    }

    if (!formData || !formData.email) {
        throw new ErrorHandler("Form data with at least an email is required", 400);
    }

    const msg = {
        to: process.env.RECEIVER_EMAIL || "info@minimalistic-technology.com", // Fallback or dedicated receiver
        from: process.env.FROM_EMAIL || "no-reply@minimalistic-technology.com", // Must be verified in SendGrid
        templateId: templateId,
        dynamicTemplateData: {
            ...formData,
            subject: formData.subject || "New Inquiry from Minimalistic Technology",
        },
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error: any) {
        console.error("SendGrid Error:", error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw new ErrorHandler(error.message || "Failed to send email", 500);
    }
});
