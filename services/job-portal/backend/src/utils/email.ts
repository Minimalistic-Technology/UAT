import nodemailer from "nodemailer";
import { config } from "../config/env.js";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const isDev = config.nodeEnv === "development";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

const getTransporter = async (): Promise<ReturnType<typeof nodemailer.createTransport>> => {
  if (transporter) return transporter;

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

export const sendEmail = async (options: EmailOptions): Promise<void> => {
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
        } else {
          console.log("OTP Email successfully sent out via Brevo.");
          return;
        }
      } catch (err: any) {
        console.warn(`Brevo Exception: ${err.message}. Falling back to next provider...`);
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
  } catch (error: any) {
    if (isDev) {
      console.warn(`\n[DEV MODE] Email Failed: ${error.message}`);
      console.log(`[DEV MODE] Ignoring error and printing email content instead:`);
      console.log(`--------------------------------------------------`);
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      console.log(`--------------------------------------------------\n`);
      return;
    }
    throw new Error(`Email Error: ${error.message}`);
  }
};

export const closeEmailConnection = async (): Promise<void> => {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
};