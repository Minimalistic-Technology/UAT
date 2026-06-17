import nodemailer from 'nodemailer';
import { BrevoClient } from '@getbrevo/brevo';
import crypto from 'crypto';
import { env } from '../config/env';

// 1. Setup Nodemailer (The Reliable Backup)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
});

// 2. Setup Brevo (The Professional Choice)
const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

/* ─── Shared Nodemailer fallback ──────────────────────────────────────── */
async function sendViaNodemailer(to: string, subject: string, html: string) {
  const mailOptions = {
    from: '"Minimalistic Learning" <' + env.EMAIL_USER + '>',
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] Nodemailer sent successfully to:', to, info.messageId);
    return info;
  } catch (error) {
    console.error('[email] All email delivery methods failed:', error);
    throw error;
  }
}

/* ─── Shared Brevo dispatcher ───────────────────────────────────────── */
async function sendViaBrevo(to: string, subject: string, html: string) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Minimalistic Learning', email: env.BREVO_FROM_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error('Brevo API rejected: ' + errorData);
  }

  return await response.json();
}

/* ─── Smart send: Brevo first, Nodemailer fallback ─────────────────── */
async function smartSend(to: string, subject: string, html: string) {
  const canUseBrevo = env.BREVO_API_KEY && !env.BREVO_API_KEY.includes('example');
  if (canUseBrevo) {
    try {
      console.log('[email] Attempting Brevo delivery to ' + to + '...');
      const result = await sendViaBrevo(to, subject, html);
      console.log('[email] Sent via Brevo successfully.');
      return result;
    } catch (err: any) {
      console.warn('[email] Brevo failed, falling back to Nodemailer:', err.message);
      return sendViaNodemailer(to, subject, html);
    }
  }
  console.log('[email] Brevo not configured. Using Nodemailer...');
  return sendViaNodemailer(to, subject, html);
}

/* ─── OTP Email ──────────────────────────────────────────────────────── */
export const sendOTP = async (to: string, otp: string) => {
  const subject = 'Your Verification Code — Minimalistic Learning';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);padding:40px 40px 36px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:16px;padding:10px 20px;margin-bottom:20px;">
              <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">Minimalistic Learning</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Verify Your Identity</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">Your one-time verification code is ready</p>
          </td>
        </tr>
        <!-- OTP Box -->
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              Enter the code below to complete your login. This code expires in <strong style="color:#1e293b;">5 minutes</strong>.
            </p>
            <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:20px;padding:32px;margin:0 auto;display:inline-block;width:100%;box-sizing:border-box;">
              <p style="margin:0 0 8px;color:#1877F2;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;">Your verification code</p>
              <div style="font-size:52px;font-weight:900;color:#1877F2;letter-spacing:16px;margin:8px 0 4px;">${otp}</div>
              <p style="margin:8px 0 0;color:#64748b;font-size:12px;">Do not share this code with anyone</p>
            </div>
          </td>
        </tr>
        <!-- Security Note -->
        <tr>
          <td style="padding:20px 40px 36px;">
            <div style="background:#fef9ee;border:1px solid #fde68a;border-radius:16px;padding:16px 20px;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">&#9888; Security Notice</p>
              <p style="margin:4px 0 0;color:#a16207;font-size:12px;line-height:1.5;">
                Minimalistic Learning will never ask for your OTP via phone or chat. If you didn't request this code, please ignore this email.
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              This is an automated message from <strong style="color:#64748b;">Minimalistic Learning</strong>.<br>
              Please do not reply to this email.<br>
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  return smartSend(to, subject, html);
};

/* ─── Newsletter Welcome Email ───────────────────────────────────────── */
export const sendNewsletterWelcomeEmail = async (to: string) => {
  const subject = 'Welcome to Minimalistic Learning! \uD83C\uDF1F';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1877F2 0%,#0f52ba 100%);padding:50px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:16px;padding:12px 24px;margin-bottom:20px;">
              <span style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;">Minimalistic Learning</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:900;letter-spacing:-0.5px;">Welcome Aboard! &#127881;</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;color:#334155;font-size:16px;line-height:1.6;font-weight:600;">Hello there,</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
              Thank you for subscribing to stay updated with Minimalistic Learning! We are thrilled to have you join our community of curious minds dedicated to distraction-free, high-quality education.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #1877F2;padding:24px;border-radius:0 16px 16px 0;margin:0 0 30px;">
              <p style="margin:0;color:#0c4a6e;font-size:14px;line-height:1.6;font-style:italic;">
                "Education is not the learning of facts, but the training of the mind to think."
              </p>
            </div>
            <p style="margin:0 0 10px;color:#334155;font-size:15px;line-height:1.6;font-weight:700;">What to expect?</p>
            <ul style="margin:0 0 30px;padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
              <li>Curated articles on Technology &amp; Design.</li>
              <li>Exclusive guides and resources.</li>
              <li>Updates on new features before anyone else.</li>
            </ul>
            <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;font-weight:600;">
              Wishing you immense success and endless learning!<br><br>
              Warm blessings,<br>
              <span style="color:#1877F2;font-weight:800;">The Minimalistic Learning Team</span>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              You received this because you subscribed on our platform.<br>
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;

  return smartSend(to, subject, html);
};

// Re-export crypto hash helper used by postController
export { crypto };

/* ─── Unified Login Alert Email ──────────────────────────────────────── */
export const sendLoginAlertEmail = async (to: string, userName: string, ipAddress: string = 'Unknown IP', device: string = 'Unknown Device') => {
  const subject = 'New Login Alert — Minimalistic Learning';
  const year = new Date().getFullYear();
  const time = new Date().toLocaleString();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:40px 40px 20px;">
            <div style="width:48px;height:48px;background:#e0e7ff;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <span style="font-size:24px;">🔓</span>
            </div>
            <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:-0.5px;">New Login Detected</h1>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${userName},</p>
            <p style="margin:10px 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              We noticed a new login to your Minimalistic Learning account. If this was you, you can safely ignore this email.
            </p>
            <div style="background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:30px;border:1px solid #f1f5f9;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;font-weight:700;color:#94a3b8;letter-spacing:0.05em;">Login Details</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">Time:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${time}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;font-weight:600;">IP Address:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${ipAddress}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b;font-size:14px;font-weight:600;">Device:</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${device}</td>
                </tr>
              </table>
            </div>
            <div style="background:#fff1f2;border-left:4px solid #f43f5e;padding:16px;border-radius:0 12px 12px 0;">
              <p style="margin:0;color:#881337;font-size:13px;line-height:1.5;">
                <strong style="font-weight:800;">Not you?</strong> Please reset your password immediately and contact our support team to secure your account.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return smartSend(to, subject, html);
};

/* ─── Account Creation Welcome Email ───────────────────────────────────── */
export const sendAccountCreatedEmail = async (to: string, userName: string) => {
  const subject = 'Welcome to Minimalistic Learning';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#1e293b;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0f172a;border-radius:24px;border:1px solid #334155;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.4);">
        <tr>
          <td style="padding:50px 40px;text-align:center;background:linear-gradient(180deg, rgba(16,185,129,0.1) 0%, transparent 100%);">
            <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Welcome, ${userName}! 🚀</h1>
            <p style="margin:0;color:#94a3b8;font-size:16px;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto;">
              Your account has been successfully created. You're now part of an elite community dedicated to mastering technology.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 40px;">
            <div style="background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155;text-align:left;">
              <h3 style="margin:0 0 16px;color:#f8fafc;font-size:18px;font-weight:700;">What's next?</h3>
              <ul style="margin:0;padding-left:20px;color:#cbd5e1;font-size:15px;line-height:1.8;">
                <li style="margin-bottom:8px;">Access premium masterclasses and deep dives.</li>
                <li style="margin-bottom:8px;">Interact with the active developer community.</li>
                <li>Curate your personalized learning feed.</li>
              </ul>
              <div style="margin-top:32px;text-align:center;">
                <a href="${env.corsOrigins[0] || 'http://localhost:3000'}/login" style="display:inline-block;background:#10b981;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px;text-transform:uppercase;letter-spacing:0.1em;">Go to Dashboard</a>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;text-align:center;border-top:1px solid #1e293b;">
            <p style="margin:0;color:#64748b;font-size:12px;line-height:1.7;">
              &copy; ${year} Minimalistic Learning.<br>Focus on Core. Avoid the Noise.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return smartSend(to, subject, html);
};

/* ─── Post Approved / Live Email ───────────────────────────────────── */
export const sendPostApprovedEmail = async (to: string, userName: string, postTitle: string, postUrl: string) => {
  const subject = 'Your post is now LIVE! 🎉';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <div style="width:48px;height:48px;background:#d1fae5;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <span style="font-size:24px;">🚀</span>
            </div>
            <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Your post is live!</h1>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${userName},</p>
            <p style="margin:10px 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              Great news! Your post <strong>"${postTitle}"</strong> has been approved by our administrators and is now live on Minimalistic Learning.
            </p>
            <div style="margin-top:20px;margin-bottom:30px;">
              <a href="${postUrl}" style="display:inline-block;background:#10b981;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:12px;text-transform:uppercase;letter-spacing:0.1em;">View Your Post</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return smartSend(to, subject, html);
};

/* ─── Post Rejected Email ───────────────────────────────────── */
export const sendPostRejectedEmail = async (to: string, userName: string, postTitle: string, reason: string = 'Did not meet content guidelines.') => {
  const subject = 'Update on your recent post submission';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <div style="width:48px;height:48px;background:#fef08a;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <span style="font-size:24px;">📝</span>
            </div>
            <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Post Update</h1>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${userName},</p>
            <p style="margin:10px 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              Thank you for submitting your post <strong>"${postTitle}"</strong>. After review, we are unable to publish it at this time.
            </p>
            <div style="background:#fefce8;border-left:4px solid #eab308;padding:16px;border-radius:0 12px 12px 0;text-align:left;margin-bottom:20px;">
              <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;font-weight:700;color:#a16207;letter-spacing:0.05em;">Reason</p>
              <p style="margin:0;color:#854d0e;font-size:14px;line-height:1.5;">
                ${reason}
              </p>
            </div>
            <p style="margin:10px 0 0;color:#475569;font-size:15px;line-height:1.6;">
              You can review our submission guidelines and try again. Don't be discouraged!
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return smartSend(to, subject, html);
};

/* ─── Post Deleted Email ───────────────────────────────────── */
export const sendPostDeletedEmail = async (to: string, userName: string, postTitle: string) => {
  const subject = 'Your post has been removed';
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.04);">
        <tr>
          <td style="padding:40px 40px 20px;text-align:center;">
            <div style="width:48px;height:48px;background:#fee2e2;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <span style="font-size:24px;">🗑️</span>
            </div>
            <h1 style="margin:0 0 10px;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Post Removed</h1>
            <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">Hi ${userName},</p>
            <p style="margin:10px 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              We want to let you know that your post <strong>"${postTitle}"</strong> has been removed from Minimalistic Learning by an administrator.
            </p>
            <div style="background:#fff1f2;border-left:4px solid #f43f5e;padding:16px;border-radius:0 12px 12px 0;text-align:left;margin-bottom:20px;">
              <p style="margin:0;color:#881337;font-size:13px;line-height:1.5;">
                This action is typically taken when content violates our community guidelines or terms of service.
              </p>
            </div>
            <p style="margin:10px 0 0;color:#475569;font-size:14px;line-height:1.6;">
              If you have any questions, please contact our support team.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
              &copy; ${year} Minimalistic Learning. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `;
  return smartSend(to, subject, html);
};
