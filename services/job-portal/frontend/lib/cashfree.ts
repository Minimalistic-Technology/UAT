import { load, type CashfreeInstance } from "@cashfreepayments/cashfree-js";

let cashfreePromise: Promise<CashfreeInstance> | null = null;

/**
 * Lazily loads the Cashfree JS SDK (browser only) and memoizes the instance.
 * Mode is driven by NEXT_PUBLIC_CASHFREE_MODE ("production" | "sandbox").
 */
export function getCashfree(): Promise<CashfreeInstance> {
  if (!cashfreePromise) {
    cashfreePromise = load({
      mode:
        process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
          ? "production"
          : "sandbox",
    });
  }
  return cashfreePromise;
}
