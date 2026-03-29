import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import { config } from "../config/env.js";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const isDev = config.nodeEnv === "development";
const useSendGridAPI =
  config.emailHost === "smtp.sendgrid.net" && config.emailUser === "apikey";

if (useSendGridAPI && config.emailPass) {
  sgMail.setApiKey(config.emailPass);
  console.log("✅ SendGrid API initialized (using HTTP API instead of SMTP)");
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

const getTransporter = async (): Promise<
  ReturnType<typeof nodemailer.createTransport>
> => {
  if (transporter) return transporter;

  // DEVELOPMENT: Use Ethereal (EmailJS/Nodemailer Test Account)
  if (isDev) {
    console.log("🧪 Creating Ethereal Test Account for Development...");
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

    console.log("✅ Dev Email Ready. View emails at: https://ethereal.email");
    return transporter;
  }

  // PRODUCTION: Standard SMTP Fallback
  transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465,
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
    // Use SendGrid API (Prod only)
    if (useSendGridAPI) {
      const msg = {
        to: options.email,
        from: {
          email: config.emailFrom || "noreply@yourdomain.com",
          name: "Job Portal",
        },
        subject: options.subject,
        text: options.message,
        html: `<div style="padding: 20px; border: 1px solid #eee;"><h2>${options.subject}</h2><p>${options.message}</p></div>`,
      };
      await sgMail.send(msg);
      return;
    }

    // Use Transporter ( Development )
    const emailTransporter = await getTransporter();
    const mailOptions = {
      from: `"Job Portal" <${isDev ? "dev@jobportal.com" : config.emailUser}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `<h3>${options.subject}</h3><p>${options.message}</p>`,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // In Dev, provide the preview URL
    if (isDev) {
      console.log("✉️  Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (error: any) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error(`Email Error: ${error.message}`);
  }
};

// Graceful shutdown - close connection pool when app terminates
export const closeEmailConnection = async (): Promise<void> => {
  if (transporter) {
    transporter.close();
    transporter = null;
    console.log("📧 Email connection pool closed");
  }
};