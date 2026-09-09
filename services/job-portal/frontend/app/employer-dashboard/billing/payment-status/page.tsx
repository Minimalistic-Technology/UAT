import { Suspense } from "react";
import PaymentStatusClient from "./payment-status-client";

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-muted-foreground">Loading…</div>}
    >
      <PaymentStatusClient />
    </Suspense>
  );
}
