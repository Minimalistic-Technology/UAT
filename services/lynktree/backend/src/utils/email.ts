import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { ApiError } from './ApiError';
import type { OtpPurpose } from '../models/Otp.model';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

let sandboxTransporterPromise: Promise<nodemailer.Transporter> | null = null;

/**
 * Dev-only: lazily creates an Ethereal (nodemailer sandbox) test account so
 * emails can be sent without any real credentials. Preview URLs are logged
 * to the console instead of actually delivering mail.
 */
function getSandboxTransporter(): Promise<nodemailer.Transporter> {
  if (!sandboxTransporterPromise) {
    sandboxTransporterPromise = nodemailer.createTestAccount().then((account) =>
      nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      })
    );
  }
  return sandboxTransporterPromise;
}

async function sendViaSandbox({ to, subject, html }: SendEmailOptions) {
  const transporter = await getSandboxTransporter();
  const info = await transporter.sendMail({
    from: `"${env.BREVO_SENDER_NAME}" <${env.BREVO_SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[email:sandbox] Preview URL for ${to}: ${previewUrl}`);
  return { previewUrl };
}

async function sendViaBrevo({ to, subject, html }: SendEmailOptions) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SibApiV3Sdk = require('sib-api-v3-sdk');
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications['api-key'].apiKey = env.BREVO_API_KEY;
  const api = new SibApiV3Sdk.TransactionalEmailsApi();

  try {
    await api.sendTransacEmail({
      sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  } catch (err) {
    // The Brevo SDK (superagent) rejects 4xx/5xx responses with an Error whose
    // `.message` is just the raw HTTP status text (e.g. "Unauthorized" for an
    // invalid/expired BREVO_API_KEY). Left uncaught, that surfaces to the
    // client as a misleading top-level "Unauthorized" auth error, so wrap it
    // in a clear, correctly-scoped message instead.
    console.error('[email:brevo] Failed to send email:', err);
    throw new ApiError(502, 'Could not send verification email. Please try again in a moment.');
  }
  return {};
}

export async function sendEmail(options: SendEmailOptions) {
  if (env.NODE_ENV === 'production' && env.BREVO_API_KEY) {
    return sendViaBrevo(options);
  }
  return sendViaSandbox(options);
}

export async function sendOtpEmail(to: string, code: string, purpose: OtpPurpose = 'signup') {
  const subject =
    purpose === 'reset_password' ? 'Reset your Lynktree password' : 'Verify your Lynktree email';
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Your verification code</h2>
      <p>Use the code below to ${purpose === 'reset_password' ? 'reset your password' : 'verify your email'}. It expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}
