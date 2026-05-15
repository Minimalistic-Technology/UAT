import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env';

// 1. Setup Nodemailer (The Reliable Backup)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// 2. Setup Resend (The Professional Choice)
const resend = new Resend(env.RESEND_API_KEY);

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
              <div style="font-size:52px;font-weight:900;color:#1877F2;letter-spacing:16px;font-variant-numeric:tabular-nums;margin:8px 0 4px;">${otp}</div>
              <p style="margin:8px 0 0;color:#64748b;font-size:12px;">Do not share this code with anyone</p>
            </div>
          </td>
        </tr>

        <!-- Security Note -->
        <tr>
          <td style="padding:20px 40px 36px;">
            <div style="background:#fef9ee;border:1px solid #fde68a;border-radius:16px;padding:16px 20px;display:flex;align-items:flex-start;gap:12px;">
              <span style="font-size:20px;line-height:1;">⚠️</span>
              <div>
                <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">Security Notice</p>
                <p style="margin:4px 0 0;color:#a16207;font-size:12px;line-height:1.5;">
                  Minimalistic Learning will never ask for your OTP via phone or chat. If you didn't request this code, please ignore this email — your account is safe.
                </p>
              </div>
            </div>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;text-align:center;">
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

  // Use Resend if API key is present and not a placeholder
  const canAttemptResend = env.RESEND_API_KEY && !env.RESEND_API_KEY.includes('example');

  if (canAttemptResend) {
    try {
      console.log(`[email] Attempting Resend delivery to ${to}...`);
      const { data, error } = await resend.emails.send({
        from: `Minimalistic Learning <${env.RESEND_FROM_EMAIL}>`,
        to,
        subject,
        html,
      });

      if (error) {
        // If it's a domain verification error, we log it and move to fallback
        console.warn('[email] Resend rejected delivery (likely unverified domain). Falling back to Nodemailer...');
        return await sendViaNodemailer(to, subject, html);
      }

      console.log('[email] OTP sent via Resend successfully. ID:', data?.id);
      return data;
    } catch (error: any) {
      console.error('[email] Resend exception. Falling back to Nodemailer:', error.message);
      return await sendViaNodemailer(to, subject, html);
    }
  } else {
    // No Resend config, use Nodemailer directly
    console.log('[email] Resend not configured. Using Nodemailer directly...');
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
    console.error('[email] All email delivery methods failed:', error);
    throw error;
  }
}
