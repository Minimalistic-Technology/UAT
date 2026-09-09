"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyCashfreePayment } from "@/features/employer/services/payment.service";

type State = "checking" | "paid" | "failed";

export default function PaymentStatusClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [state, setState] = useState<State>("checking");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!orderId) {
      setState("failed");
      return;
    }

    verifyCashfreePayment(orderId)
      .then((res) => {
        setState(res.data.paymentStatus === "CAPTURED" ? "paid" : "failed");
      })
      .catch((error) => {
        console.error("Failed to verify payment", error);
        setState("failed");
      });
  }, [orderId]);

  useEffect(() => {
    if (state !== "paid") return;
    const t = setTimeout(() => router.push("/employer-dashboard/billing"), 4000);
    return () => clearTimeout(t);
  }, [state, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          {state === "checking" && (
            <>
              <Loader2 className="size-14 animate-spin text-primary" />
              <h2 className="text-xl font-bold">Confirming payment…</h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your payment with Cashfree. Do not
                close this window.
              </p>
            </>
          )}

          {state === "paid" && (
            <>
              <CheckCircle2 className="size-14 text-emerald-600" />
              <h2 className="text-2xl font-bold">Payment successful!</h2>
              <p className="text-sm text-muted-foreground">
                Your plan is now active. You can view and download your invoice
                in the Billing section. Redirecting you there…
              </p>
              <Button asChild className="mt-2 w-full">
                <Link href="/employer-dashboard/billing">Go to Billing</Link>
              </Button>
            </>
          )}

          {state === "failed" && (
            <>
              <XCircle className="size-14 text-red-600" />
              <h2 className="text-2xl font-bold">Payment not completed</h2>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t confirm your payment. If any amount was
                deducted it will be refunded automatically. You can try again
                from the plans page.
              </p>
              <div className="mt-2 flex w-full flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/employer-dashboard/billing">Back to Billing</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/employer-dashboard/plans">View Plans</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
