import nodemailer from "nodemailer";
import { config } from "../config/env.js";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const isDev = config.nodeEnv === "development";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let resendInstance: any = null;

const getResendInstance = async () => {
  if (!resendInstance) {
    const { Resend } = await import("resend");
    if (!config.resendApiKey) throw new Error("Resend API key missing");
    resendInstance = new Resend(config.resendApiKey);
  }
  return resendInstance;
};

const getTransporter = async (): Promise<ReturnType<typeof nodemailer.createTransport>> => {
  if (transporter) return transporter;

  if (isDev) {
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

    if (!isDev) {
      const resend = await getResendInstance();
      const { error } = await resend.emails.send({
        to: options.email,
        from: fromAddress,
        subject: options.subject,
        text: options.message,
        html: `<div style="padding: 20px; border: 1px solid #eee;"><h2>${options.subject}</h2><p>${options.message}</p></div>`,
      });
      
      if (error) {
         throw new Error(`Resend Error: ${error.message}`);
      }
      return;
    }

    const emailTransporter = await getTransporter();
    const mailOptions = {
      from: `"Job Portal" <${isDev ? "dev@jobportal.com" : fromAddress}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `<h3>${options.subject}</h3><p>${options.message}</p>`,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    if (isDev) {
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    }
  } catch (error: any) {
    throw new Error(`Email Error: ${error.message}`);
  }
};

export const closeEmailConnection = async (): Promise<void> => {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
};