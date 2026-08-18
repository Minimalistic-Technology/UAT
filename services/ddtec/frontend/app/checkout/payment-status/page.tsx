"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

type VerifyState = "checking" | "paid" | "failed";

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const [state, setState] = useState<VerifyState>("checking");

    useEffect(() => {
        const verify = async () => {
            if (!orderId) {
                setState("failed");
                return;
            }
            try {
                const res = await api.get(`/orders/${orderId}/payment/verify`);
                setState(res.data.paymentStatus === "paid" ? "paid" : "failed");
            } catch (error) {
                console.error("Failed to verify payment", error);
                setState("failed");
            }
        };

        verify();
    }, [orderId]);

    return (
        <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-6 bg-slate-50 dark:bg-slate-950 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800"
            >
                {state === "checking" && (
                    <>
                        <div className="size-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                            <Loader2 className="size-10 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirming Payment...</h2>
                        <p className="text-slate-600 dark:text-slate-400">Please wait while we verify your payment status with Cashfree.</p>
                    </>
                )}

                {state === "paid" && (
                    <>
                        <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="size-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Your order has been confirmed. You&apos;ll receive an email confirmation with your invoice shortly.
                        </p>
                        <Link
                            href="/orders"
                            className="block w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25"
                        >
                            View My Orders
                        </Link>
                    </>
                )}

                {state === "failed" && (
                    <>
                        <div className="size-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <XCircle className="size-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Failed</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            We couldn&apos;t confirm your payment. No amount was deducted for this attempt. You can try again or choose Cash on Delivery.
                        </p>
                        <Link
                            href="/cart"
                            className="block w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25"
                        >
                            Back to Cart
                        </Link>
                    </>
                )}
            </motion.div>
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={null}>
            <PaymentStatusContent />
        </Suspense>
    );
}
