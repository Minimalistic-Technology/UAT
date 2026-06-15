import nodemailer from "nodemailer";
import { config } from "../config/env.js";
const isDev = config.nodeEnv === "development";
let transporter = null;
let resendInstance = null;
const getResendInstance = async () => {
    if (!resendInstance) {
        const { Resend } = await import("resend");
        if (!config.resendApiKey)
            throw new Error("Resend API key missing");
        resendInstance = new Resend(config.resendApiKey);
    }
    return resendInstance;
};
const getTransporter = async () => {
    if (transporter)
        return transporter;
    // Use test account only if no real email host is provided
    if (isDev && !config.emailHost) {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        return transporter;
    }
    transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: Number(config.emailPort),
        secure: Number(config.emailPort) === 465,
        auth: {
            user: config.emailUser,
            pass: config.emailPass,
        },
        pool: true,
    });
    return transporter;
};
export const sendEmail = async (options) => {
    try {
        const fromAddress = config.emailFrom || "noreply@yourdomain.com";
        // 1. Prioritize Brevo (Sendinblue) API if keys exist
        if (config.brevoApiKey && config.brevoFromEmail) {
            try {
                const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "api-key": config.brevoApiKey
                    },
                    body: JSON.stringify({
                        sender: { email: config.brevoFromEmail, name: "Job Portal" },
                        to: [{ email: options.email }],
                        subject: options.subject,
                        htmlContent: `<div style="padding: 20px; border: 1px solid #eee;"><h2>${options.subject}</h2><p>${options.message}</p></div>`
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.warn(`Brevo Error: ${JSON.stringify(errorData)}. Falling back to next provider...`);
                }
                else {
                    console.log("OTP Email successfully sent out via Brevo.");
                    return;
                }
            }
            catch (err) {
                console.warn(`Brevo Exception: ${err.message}. Falling back to next provider...`);
            }
        }
        // 2. Fallback to Resend over SendGrid if Resend API key exists in .env
        if (config.resendApiKey) {
            try {
                const resend = await getResendInstance();
                const { error } = await resend.emails.send({
                    to: options.email,
                    from: fromAddress,
                    subject: options.subject,
                    text: options.message,
                    html: `<div style="padding: 20px; border: 1px solid #eee;"><h2>${options.subject}</h2><p>${options.message}</p></div>`,
                });
                if (error) {
                    console.warn(`Resend Error: ${error.message}. Falling back to SMTP...`);
                }
                else {
                    console.log("OTP Email successfully sent out via Resend.");
                    return;
                }
            }
            catch (err) {
                console.warn(`Resend Exception: ${err.message}. Falling back to SMTP...`);
            }
        }
        const emailTransporter = await getTransporter();
        const mailOptions = {
            from: `"Job Portal" <${isDev && !config.emailHost ? "dev@jobportal.com" : fromAddress}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: `<h3>${options.subject}</h3><p>${options.message}</p>`,
        };
        const info = await emailTransporter.sendMail(mailOptions);
        console.log("OTP Email successfully sent out.");
        if (isDev && !config.emailHost) {
            console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        }
    }
    catch (error) {
        throw new Error(`Email Error: ${error.message}`);
    }
};
export const closeEmailConnection = async () => {
    if (transporter) {
        transporter.close();
        transporter = null;
    }
};
