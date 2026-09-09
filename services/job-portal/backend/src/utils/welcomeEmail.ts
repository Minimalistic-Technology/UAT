import { config } from "../config/env.js";
import { sendEmail } from "./email.js";

type WelcomeEmailAudience = "jobseeker" | "employer";

interface WelcomeEmailParams {
  email: string;
  firstName?: string | null;
  audience: WelcomeEmailAudience;
  companyName?: string | null;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });

const isLikelyRealEmail = (email: string): boolean => {
  if (!email) return false;
  // Basic shape check + skip the synthetic addresses used for phone-only signups.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (/@temp\.com$/i.test(email)) return false;
  return true;
};

const buildHtml = (params: WelcomeEmailParams, greetingName: string): string => {
  const clientUrl = config.clientUrl?.replace(/\/$/, "") || "";
  const dashboardPath = params.audience === "employer" ? "/employer" : "/jobs";
  const ctaUrl = `${clientUrl}${dashboardPath}`;
  const ctaLabel =
    params.audience === "employer" ? "Go to your dashboard" : "Browse jobs";

  const intro =
    params.audience === "employer"
      ? `Your employer account${
          params.companyName
            ? ` for <strong>${escapeHtml(params.companyName)}</strong>`
            : ""
        } is ready. You can now post jobs, review applicants, and manage your team.`
      : `Your account is ready. You can now build your profile, search openings, and apply to jobs in a single click.`;

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:22px;">Welcome${
          greetingName ? `, ${escapeHtml(greetingName)}` : ""
        }!</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${intro}</p>
        ${
          clientUrl
            ? `<p style="margin:24px 0;">
                 <a href="${escapeHtml(ctaUrl)}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;display:inline-block;">${ctaLabel}</a>
               </p>`
            : ""
        }
        <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
          If you did not create this account, please contact our support team.
        </p>
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
        &copy; ${new Date().getFullYear()} Job Portal
      </p>
    </div>
  </body>
</html>`;
};

/**
 * Sends a welcome email after a successful signup.
 *
 * This is intentionally fire-and-forget: signup must never fail because the
 * welcome email could not be delivered. Any error is logged and swallowed.
 */
export const sendWelcomeEmail = async (
  params: WelcomeEmailParams,
): Promise<void> => {
  try {
    if (!isLikelyRealEmail(params.email)) {
      return;
    }

    const greetingName = (params.firstName || "").trim();
    const subject =
      params.audience === "employer"
        ? "Welcome to Job Portal for Employers"
        : "Welcome to Job Portal";

    const message =
      params.audience === "employer"
        ? `Welcome${greetingName ? `, ${greetingName}` : ""}! Your employer account${
            params.companyName ? ` for ${params.companyName}` : ""
          } is ready. Sign in to post jobs and manage applicants.`
        : `Welcome${greetingName ? `, ${greetingName}` : ""}! Your account is ready. Sign in to search and apply to jobs.`;

    await sendEmail({
      email: params.email,
      subject,
      message,
      html: buildHtml(params, greetingName),
    });
  } catch (error: any) {
    console.error(
      `[welcomeEmail] Failed to send welcome email to ${params.email}: ${error?.message || error}`,
    );
  }
};
