import { prisma } from "../lib/prisma.js";
import { emailPostCreditsExhausted } from "./transactionalEmails.js";

/**
 * After a job/internship is published, check whether that post consumed the
 * company's last remaining credit (subscription flipped to DEPLETED) and, if so,
 * email the company owner. The email layer de-duplicates, so calling this on
 * every create is safe.
 *
 * Fire-and-forget: never awaited by the caller, never throws.
 */
export const notifyIfPostCreditsExhausted = (companyId: string): void => {
  void (async () => {
    try {
      const depleted = await prisma.subscription.findFirst({
        where: { companyId, status: "DEPLETED", postsRemaining: 0 },
        orderBy: { updatedAt: "desc" },
        include: {
          plan: { select: { name: true } },
          company: {
            select: { owner: { select: { email: true, firstName: true } } },
          },
        },
      });

      if (!depleted) return;

      emailPostCreditsExhausted({
        ownerEmail: depleted.company.owner?.email,
        ownerFirstName: depleted.company.owner?.firstName,
        planName: depleted.plan.name,
        subscriptionId: depleted.id,
      });
    } catch (error: any) {
      console.error(
        `[postCreditsNotifier] check failed for company ${companyId}: ${
          error?.message || error
        }`,
      );
    }
  })();
};
