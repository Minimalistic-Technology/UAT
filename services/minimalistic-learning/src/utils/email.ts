import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env';

// 1. Setup Nodemailer (For Development)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// 2. Setup Resend (For Production)
const resend = new Resend(env.RESEND_API_KEY);

export const sendOTP = async (to: string, otp: string) => {
  const subject = 'Your Login OTP - Minimalistic Learning';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1877F2; margin: 0; font-size: 28px; font-weight: 800;">Minimalistic Learning</h1>
        <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Your journey to knowledge continues</p>
      </div>
      
      <div style="padding: 30px; background-color: #f8fafc; border-radius: 12px; text-align: center;">
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 10px;">Your One-Time Password (OTP)</p>
        <div style="font-size: 42px; font-weight: 900; color: #1877F2; letter-spacing: 8px; margin: 20px 0;">${otp}</div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>If you did not request this OTP, please ignore this email or contact support if you have concerns.</p>
        <p>&copy; ${new Date().getFullYear()} Minimalistic Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  // HYBRID LOGIC: Check environment
  if (env.isProduction && env.RESEND_API_KEY && !env.RESEND_API_KEY.includes('example')) {
    try {
      console.log('[email] Attempting to send via Resend (Production)...');
      const { data, error } = await resend.emails.send({
        from: `Minimalistic Learning <${env.RESEND_FROM_EMAIL}>`,
        to,
        subject,
        html,
      });

      if (error) {
        throw error;
      }

      console.log('[email] OTP sent via Resend successfully:', data?.id);
      return data;
    } catch (error) {
      console.error('[email] Resend failed, falling back to Nodemailer:', error);
      // Fallback to nodemailer if Resend fails in production
      return await sendViaNodemailer(to, subject, html);
    }
  } else {
    // Default to Nodemailer for Development or if Resend key is missing/placeholder
    console.log('[email] Using Nodemailer (Development/Fallback)...');
    return await sendViaNodemailer(to, subject, html);
  }
};

async function sendViaNodemailer(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `"Minimalistic Learning" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] Nodemailer OTP sent successfully to:', to, info.messageId);
    return info;
  } catch (error) {
    console.error('[email] Nodemailer error:', error);
    throw error;
  }
}
