import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;
let isSandbox = false;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  // Default: SendGrid SMTP relay, reusing the SENDGRID_API_KEY already
  // provisioned for the main ddtec backend (see backend/scripts/test-sendgrid.ts).
  if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    return transporter;
  }

  // Fallback: generic SMTP configured via EMAIL_HOST/EMAIL_USER/EMAIL_PASS,
  // matching the pattern used in backend/src/services/notification.service.ts.
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: process.env.EMAIL_SECURE === 'true' || port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    return transporter;
  }

  // No real SMTP configured — fall back to an Ethereal sandbox account so the
  // service is testable end-to-end without real credentials. Never used if
  // SENDGRID_API_KEY or EMAIL_HOST/USER/PASS are set.
  const testAccount = await nodemailer.createTestAccount();
  isSandbox = true;
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
  console.log(`[MAILER] No SMTP configured — using Ethereal sandbox (account: ${testAccount.user})`);
  return transporter;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || '"DDTEC Official" <info@ddtec.in>';
}

interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

async function sendMail({ to, subject, html }: SendMailOptions) {
  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: getFromAddress(),
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    html
  });

  if (isSandbox) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[MAILER] Ethereal preview: ${previewUrl}`);
  }

  return info;
}

export { sendMail, getFromAddress };
