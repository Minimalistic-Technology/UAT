import { env } from "../config/env.js";
import nodemailer from "nodemailer";
import { ApiError } from "./apiError.js";
import { getOTPTemplate } from "../constants/index.js";

const devTransporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Or your preferred dev SMTP host
  port: 2525,
  auth: {
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const { subject, text, html } = getOTPTemplate(otp);

  if (env.NODE_ENV === "production") {
    const { resend } = await import("../config/resend.js");

    const { data, error } = await resend.emails.send({
      from: "Test App <test@rajmane.dev>",
      to: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("Error sending email via Resend:", error);
      throw new ApiError(500, "Failed to send verification email");
    }

    console.log("Message sent: %s", data.id);
    return;
  }

  try {
    const mailOptions = {
      from: `"Drive App" <rajmane9594@gmail.com>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await devTransporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email via Nodemailer:", error);
    throw new ApiError(500, "Failed to send verification email");
  }
};

export const shareCSVViaEmail = async (
  email: string, 
  fileName: string, 
  csvData: string
) => {
  const subject = `File Export: ${fileName}`;
  const text = `Attached is the CSV export of your files from the Drive Explorer.`;
  const html = `<p>Attached is the CSV export of your files from the <strong>Drive Explorer</strong>.</p>`;

  // Prepare the attachment buffer from the raw CSV string
  const attachmentBuffer = Buffer.from(csvData, "utf-8");

  if (env.NODE_ENV === "production") {
    const { resend } = await import("../config/resend.js");

    const { data, error } = await resend.emails.send({
      from: "Drive Explorer <test@rajmane.dev>",
      to: email,
      subject,
      text,
      html,
      attachments: [
        {
          filename: fileName,
          content: attachmentBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new ApiError(500, "Failed to send CSV email via Resend");
    }

    return data;
  }

  // Development Flow (Nodemailer)
  try {
    const mailOptions = {
      from: `"Drive App" <rajmane9594@gmail.com>`,
      to: email,
      subject,
      text,
      html,
      attachments: [
        {
          filename: fileName,
          content: attachmentBuffer,
          contentType: "text/csv",
        },
      ],
    };

    const info = await devTransporter.sendMail(mailOptions);
    console.log("Dev Email Sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new ApiError(500, "Failed to send CSV email via Mailtrap");
  }
};
