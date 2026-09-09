import { config } from "../config/env.js";
import { sendEmail } from "./email.js";
import { reserveEmailSend } from "./emailThrottle.js";

/**
 * Transactional (event-driven) emails for the job portal.
 *
 * Every notification goes through {@link dispatch}, which:
 *  - runs it past the rate limiter ({@link reserveEmailSend}),
 *  - renders a shared, theme-neutral HTML shell,
 *  - and is strictly fire-and-forget: a mail failure must never break the
 *    request that triggered it. Errors are logged and swallowed.
 *
 * Callers should `void`-call these helpers (no `await`) from controllers.
 */

const clientUrl = (config.clientUrl || "").replace(/\/$/, "");

const escapeHtml = (value: string): string =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => {
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

const isLikelyRealEmail = (
  email: string | null | undefined,
): email is string => {
  if (!email) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (/@temp\.com$/i.test(email)) return false;
  return true;
};

interface CallToAction {
  label: string;
  url: string;
}

interface EmailContent {
  heading: string;
  /** Paragraphs of body copy. Plain text — rendered escaped. */
  paragraphs: string[];
  /** Optional label/value rows rendered as a summary table. */
  details?: Array<{ label: string; value: string }>;
  cta?: CallToAction;
  /** Small print shown under the CTA. Plain text. */
  footnote?: string;
}

const renderHtml = (content: EmailContent): string => {
  const detailRows = (content.details || [])
    .filter((row) => row.value != null && row.value !== "")
    .map(
      (row) => `
          <tr>
            <td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;vertical-align:top;">${escapeHtml(
              row.label,
            )}</td>
            <td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${escapeHtml(
              row.value,
            )}</td>
          </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
        <h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(content.heading)}</h1>
        ${content.paragraphs
          .map(
            (p) =>
              `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;">${escapeHtml(
                p,
              )}</p>`,
          )
          .join("")}
        ${
          detailRows
            ? `<table style="border-collapse:collapse;margin:8px 0 20px;">${detailRows}</table>`
            : ""
        }
        ${
          content.cta && clientUrl
            ? `<p style="margin:20px 0;">
                 <a href="${escapeHtml(content.cta.url)}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;display:inline-block;">${escapeHtml(
                   content.cta.label,
                 )}</a>
               </p>`
            : ""
        }
        ${
          content.footnote
            ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#6b7280;">${escapeHtml(
                content.footnote,
              )}</p>`
            : ""
        }
      </div>
      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px;">
        &copy; ${new Date().getFullYear()} Job Portal
      </p>
    </div>
  </body>
</html>`;
};

const toPlainText = (content: EmailContent): string => {
  const lines = [...content.paragraphs];
  for (const row of content.details || []) {
    if (row.value) lines.push(`${row.label}: ${row.value}`);
  }
  if (content.cta) lines.push(`${content.cta.label}: ${content.cta.url}`);
  if (content.footnote) lines.push(content.footnote);
  return lines.join("\n\n");
};

interface DispatchArgs {
  to: string | null | undefined;
  /**
   * `<event>:<scope>` — the scope (everything after the first colon) is the
   * dedupe key, e.g. `application-status:<applicationId>:SHORTLISTED`.
   */
  eventKey: string;
  /** Minimum gap between two mails sharing this eventKey. */
  cooldownSeconds: number;
  subject: string;
  content: EmailContent;
}

const dispatch = async ({
  to,
  eventKey,
  cooldownSeconds,
  subject,
  content,
}: DispatchArgs): Promise<void> => {
  try {
    if (!isLikelyRealEmail(to)) return;

    const decision = await reserveEmailSend(to, eventKey, cooldownSeconds);
    if (!decision.allowed) {
      console.info(
        `[txnEmail] Skipped "${eventKey}" for ${to} (${decision.reason})`,
      );
      return;
    }

    await sendEmail({
      email: to,
      subject,
      message: toPlainText(content),
      html: renderHtml(content),
    });
  } catch (error: any) {
    console.error(
      `[txnEmail] Failed to send "${eventKey}" to ${to}: ${error?.message || error}`,
    );
  }
};

// ---------------------------------------------------------------------------
// Cooldown windows (seconds) per event family
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60;
const COOLDOWN = {
  interviewScheduled: DAY,
  applicationStatus: 6 * 60 * 60,
  subscriptionActivated: 7 * DAY,
  paymentFailed: 60 * 60,
  refundProcessed: 7 * DAY,
  postCreditsExhausted: 3 * DAY,
  subscriptionCancelled: 7 * DAY,
  kycSubmitted: 6 * 60 * 60,
  kycReviewed: DAY,
  memberAdded: DAY,
  memberStatusChanged: 60 * 60,
  memberRemoved: DAY,
} as const;

const fullName = (first?: string | null, last?: string | null): string =>
  `${first ?? ""} ${last ?? ""}`.trim();

const formatMoney = (amountMinor: number, currency = "INR"): string => {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
};

const formatDateTime = (value: Date | string): string => {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ---------------------------------------------------------------------------
// Application lifecycle (job seeker)
// ---------------------------------------------------------------------------

const APPLICATION_STATUS_COPY: Record<
  string,
  { subject: string; heading: string; line: string } | undefined
> = {
  REVIEWED: {
    subject: "Your application is under review",
    heading: "Your application is being reviewed",
    line: "The employer has started reviewing your application.",
  },
  SHORTLISTED: {
    subject: "You've been shortlisted",
    heading: "Good news — you've been shortlisted",
    line: "The employer has shortlisted your application for the next stage.",
  },
  INTERVIEW: {
    subject: "You've been invited to interview",
    heading: "You've moved to the interview stage",
    line: "The employer wants to interview you for this role.",
  },
  OFFERED: {
    subject: "You've received an offer",
    heading: "You've received an offer",
    line: "The employer has extended an offer for this role.",
  },
  ACCEPTED: {
    subject: "Your offer is confirmed",
    heading: "Your offer has been confirmed",
    line: "Congratulations — the employer has confirmed your acceptance.",
  },
  REJECTED: {
    subject: "Update on your application",
    heading: "Update on your application",
    line: "After careful consideration, the employer has decided not to move forward with your application this time.",
  },
  WITHDRAWN: {
    subject: "Your application was withdrawn",
    heading: "Your application has been withdrawn",
    line: "Your application for this role has been withdrawn.",
  },
};

export const emailApplicationStatusChanged = (args: {
  seekerEmail: string | null | undefined;
  seekerFirstName?: string | null;
  listingTitle: string;
  status: string;
  note?: string | null;
}): void => {
  const copy = APPLICATION_STATUS_COPY[args.status];
  if (!copy) return; // PENDING and unknown statuses are not notified

  void dispatch({
    to: args.seekerEmail,
    eventKey: `application-status:${args.listingTitle}:${args.status}`,
    cooldownSeconds: COOLDOWN.applicationStatus,
    subject: copy.subject,
    content: {
      heading: copy.heading,
      paragraphs: [
        `Hi${args.seekerFirstName ? ` ${args.seekerFirstName}` : ""},`,
        `${copy.line} (Role: ${args.listingTitle})`,
        ...(args.note ? [`Note from the employer: ${args.note}`] : []),
      ],
      cta: {
        label: "View your applications",
        url: `${clientUrl}/dashboard/applications`,
      },
    },
  });
};

export const emailInterviewScheduled = (args: {
  seekerEmail: string | null | undefined;
  seekerFirstName?: string | null;
  listingTitle: string;
  interviewDate: Date | string;
  note?: string | null;
}): void => {
  void dispatch({
    to: args.seekerEmail,
    eventKey: `interview-scheduled:${args.listingTitle}:${new Date(
      args.interviewDate,
    ).toISOString()}`,
    cooldownSeconds: COOLDOWN.interviewScheduled,
    subject: `Interview scheduled — ${args.listingTitle}`,
    content: {
      heading: "Your interview has been scheduled",
      paragraphs: [
        `Hi${args.seekerFirstName ? ` ${args.seekerFirstName}` : ""},`,
        `The employer has scheduled an interview for your application to ${args.listingTitle}.`,
        ...(args.note ? [`Note from the employer: ${args.note}`] : []),
      ],
      details: [
        { label: "Interview", value: formatDateTime(args.interviewDate) },
      ],
      cta: {
        label: "View your applications",
        url: `${clientUrl}/dashboard/applications`,
      },
      footnote:
        "Please make sure your contact details and resume are up to date before the interview.",
    },
  });
};

// ---------------------------------------------------------------------------
// Billing / subscription (employer / company owner)
// ---------------------------------------------------------------------------

export const emailSubscriptionActivated = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  planName: string;
  subscriptionId: string;
  postsGranted: number;
  expiryDate: Date | string;
  amountMinor?: number | null;
  currency?: string | null;
}): void => {
  const posts =
    args.postsGranted === -1 ? "Unlimited" : String(args.postsGranted);

  void dispatch({
    to: args.ownerEmail,
    eventKey: `subscription-activated:${args.subscriptionId}`,
    cooldownSeconds: COOLDOWN.subscriptionActivated,
    subject: `Your ${args.planName} plan is active`,
    content: {
      heading: "Your plan is now active",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        `Your purchase is complete and the ${args.planName} plan is now active on your account.`,
      ],
      details: [
        { label: "Plan", value: args.planName },
        { label: "Job posts included", value: posts },
        { label: "Valid until", value: formatDateTime(args.expiryDate) },
        ...(args.amountMinor
          ? [
              {
                label: "Amount paid",
                value: formatMoney(args.amountMinor, args.currency || "INR"),
              },
            ]
          : []),
      ],
      cta: {
        label: "Go to billing",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

export const emailPaymentFailed = (args: {
  userEmail: string | null | undefined;
  userFirstName?: string | null;
  planName?: string | null;
  orderId: string;
  reason?: string | null;
}): void => {
  void dispatch({
    to: args.userEmail,
    eventKey: `payment-failed:${args.orderId}`,
    cooldownSeconds: COOLDOWN.paymentFailed,
    subject: "Your payment could not be completed",
    content: {
      heading: "Payment unsuccessful",
      paragraphs: [
        `Hi${args.userFirstName ? ` ${args.userFirstName}` : ""},`,
        `We couldn't complete your payment${
          args.planName ? ` for the ${args.planName} plan` : ""
        }. You have not been charged.`,
        ...(args.reason ? [`Reason: ${args.reason}`] : []),
        "You can safely retry the payment from your billing page.",
      ],
      cta: {
        label: "Retry payment",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

export const emailRefundProcessed = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  amountMinor: number;
  currency?: string | null;
  paymentId: string;
  status: string;
}): void => {
  const processed = args.status === "PROCESSED";
  void dispatch({
    to: args.ownerEmail,
    eventKey: `refund:${args.paymentId}`,
    cooldownSeconds: COOLDOWN.refundProcessed,
    subject: processed
      ? "Your refund has been processed"
      : "Your refund has been initiated",
    content: {
      heading: processed ? "Refund processed" : "Refund initiated",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        processed
          ? "Your refund has been processed by our payment provider."
          : "Your refund has been initiated. It typically reaches your account within 5–7 business days.",
      ],
      details: [
        {
          label: "Refund amount",
          value: formatMoney(args.amountMinor, args.currency || "INR"),
        },
      ],
      cta: {
        label: "View billing",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

export const emailPostCreditsExhausted = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  planName: string;
  subscriptionId: string;
}): void => {
  void dispatch({
    to: args.ownerEmail,
    eventKey: `credits-exhausted:${args.subscriptionId}`,
    cooldownSeconds: COOLDOWN.postCreditsExhausted,
    subject: "You've used all your job post credits",
    content: {
      heading: "You're out of job post credits",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        `You've used all the job posts included in your ${args.planName} plan. Existing posts stay live, but you'll need to upgrade or renew to publish new ones.`,
      ],
      cta: {
        label: "View plans",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

export const emailSubscriptionCancelled = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  planName: string;
  subscriptionId: string;
  refundInitiated?: boolean;
}): void => {
  void dispatch({
    to: args.ownerEmail,
    eventKey: `subscription-cancelled:${args.subscriptionId}`,
    cooldownSeconds: COOLDOWN.subscriptionCancelled,
    subject: `Your ${args.planName} plan has been cancelled`,
    content: {
      heading: "Your subscription has been cancelled",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        `Your ${args.planName} plan has been cancelled. You will no longer be able to publish new job posts under this plan.`,
        ...(args.refundInitiated
          ? ["A 50% refund has been initiated for this cancellation."]
          : []),
      ],
      cta: {
        label: "View plans",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

export const emailSubscriptionExpired = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  planName: string;
  subscriptionId: string;
}): void => {
  void dispatch({
    to: args.ownerEmail,
    eventKey: `subscription-expired:${args.subscriptionId}`,
    cooldownSeconds: COOLDOWN.subscriptionCancelled,
    subject: `Your ${args.planName} plan has expired`,
    content: {
      heading: "Your subscription has expired",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        `Your ${args.planName} plan has expired. Renew to continue posting jobs and internships and to keep managing your team.`,
      ],
      cta: {
        label: "Renew your plan",
        url: `${clientUrl}/employer-dashboard/billing`,
      },
    },
  });
};

// ---------------------------------------------------------------------------
// KYC (employer / company owner)
// ---------------------------------------------------------------------------

export const emailKycSubmitted = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  kycId: string;
}): void => {
  void dispatch({
    to: args.ownerEmail,
    eventKey: `kyc-submitted:${args.kycId}`,
    cooldownSeconds: COOLDOWN.kycSubmitted,
    subject: "We've received your KYC documents",
    content: {
      heading: "KYC submitted",
      paragraphs: [
        `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
        "We've received your KYC documents. Our team will review them shortly — this usually takes 1–2 business days. We'll email you once the review is complete.",
      ],
    },
  });
};

export const emailKycReviewed = (args: {
  ownerEmail: string | null | undefined;
  ownerFirstName?: string | null;
  kycId: string;
  approved: boolean;
  rejectionReason?: string | null;
}): void => {
  void dispatch({
    to: args.ownerEmail,
    eventKey: `kyc-reviewed:${args.kycId}:${args.approved ? "APPROVED" : "REJECTED"}`,
    cooldownSeconds: COOLDOWN.kycReviewed,
    subject: args.approved
      ? "Your KYC has been approved"
      : "Your KYC needs attention",
    content: {
      heading: args.approved ? "KYC approved" : "KYC rejected",
      paragraphs: args.approved
        ? [
            `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
            "Your KYC has been approved and your company is now verified. You can now post jobs and internships.",
          ]
        : [
            `Hi${args.ownerFirstName ? ` ${args.ownerFirstName}` : ""},`,
            "We reviewed your KYC documents and couldn't approve them this time.",
            ...(args.rejectionReason
              ? [`Reason: ${args.rejectionReason}`]
              : []),
            "Please re-submit your documents from your dashboard.",
          ],
      cta: {
        label: args.approved ? "Post a job" : "Re-submit KYC",
        url: `${clientUrl}/employer-dashboard`,
      },
    },
  });
};

// ---------------------------------------------------------------------------
// Team members
// ---------------------------------------------------------------------------

export const emailCompanyMemberAdded = (args: {
  memberEmail: string | null | undefined;
  memberFirstName?: string | null;
  companyName: string;
  role: string;
}): void => {
  void dispatch({
    to: args.memberEmail,
    eventKey: `member-added:${args.companyName}:${args.memberEmail}`,
    cooldownSeconds: COOLDOWN.memberAdded,
    subject: `You've been added to ${args.companyName} on Job Portal`,
    content: {
      heading: `Welcome to the ${args.companyName} team`,
      paragraphs: [
        `Hi${args.memberFirstName ? ` ${args.memberFirstName}` : ""},`,
        `You've been added to ${args.companyName} on Job Portal as ${args.role}. An account has been created for you with this email address.`,
        'For security, please sign in and reset your password using the "Forgot password" option.',
      ],
      cta: { label: "Sign in", url: `${clientUrl}/login` },
    },
  });
};

export const emailCompanyMemberStatusChanged = (args: {
  memberEmail: string | null | undefined;
  memberFirstName?: string | null;
  companyName: string;
  isActive: boolean;
}): void => {
  void dispatch({
    to: args.memberEmail,
    eventKey: `member-status:${args.companyName}:${args.memberEmail}:${
      args.isActive ? "ACTIVE" : "INACTIVE"
    }`,
    cooldownSeconds: COOLDOWN.memberStatusChanged,
    subject: args.isActive
      ? `Your access to ${args.companyName} has been restored`
      : `Your access to ${args.companyName} has been paused`,
    content: {
      heading: args.isActive ? "Access restored" : "Access paused",
      paragraphs: [
        `Hi${args.memberFirstName ? ` ${args.memberFirstName}` : ""},`,
        args.isActive
          ? `Your access to the ${args.companyName} workspace on Job Portal has been restored. You can sign in again.`
          : `Your access to the ${args.companyName} workspace on Job Portal has been paused by an administrator. You won't be able to sign in until it's restored.`,
      ],
    },
  });
};

export const emailCompanyMemberRemoved = (args: {
  memberEmail: string | null | undefined;
  memberFirstName?: string | null;
  companyName: string;
}): void => {
  void dispatch({
    to: args.memberEmail,
    eventKey: `member-removed:${args.companyName}:${args.memberEmail}`,
    cooldownSeconds: COOLDOWN.memberRemoved,
    subject: `Your ${args.companyName} account has been removed`,
    content: {
      heading: "Your account has been removed",
      paragraphs: [
        `Hi${args.memberFirstName ? ` ${args.memberFirstName}` : ""},`,
        `Your team member account for ${args.companyName} on Job Portal has been removed by an administrator. You no longer have access to the workspace.`,
      ],
    },
  });
};

export { fullName };
