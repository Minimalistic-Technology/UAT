import crypto from "crypto";
import { config } from "../config/env.js";

const getBaseUrl = () =>
  config.cashfreeEnvironment === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const getHeaders = () => ({
  "x-client-id": config.cashfreeAppId,
  "x-client-secret": config.cashfreeSecretKey,
  "x-api-version": config.cashfreeApiVersion,
  "Content-Type": "application/json",
  Accept: "application/json",
});

const request = async (path: string, init: RequestInit = {}) => {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: { ...getHeaders(), ...(init.headers || {}) },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error_description)) ||
      `Cashfree API error (${response.status})`;
    const err = new Error(message) as Error & { status?: number; data?: unknown };
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export interface CashfreeCreateOrderResult {
  cfOrderId: string;
  paymentSessionId: string;
  orderStatus: string;
}

export interface CashfreeRefundResult {
  cfRefundId: string;
  refundId: string;
  refundStatus: string;
}

const CashfreeService = {
  /**
   * Creates an order at Cashfree and returns the payment_session_id used to launch checkout.
   */
  async createOrder(params: {
    orderId: string;
    amount: number; // in the major currency unit (rupees), not paise
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    returnUrl: string;
  }): Promise<CashfreeCreateOrderResult> {
    const payload = {
      order_id: params.orderId,
      order_amount: Number(params.amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: params.customerId,
        customer_name: params.customerName || "Customer",
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone || "9999999999",
      },
      order_meta: {
        return_url: params.returnUrl,
      },
    };

    const data = await request("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      cfOrderId: String(data.cf_order_id),
      paymentSessionId: data.payment_session_id,
      orderStatus: data.order_status,
    };
  },

  /**
   * Fetches the current status of an order directly from Cashfree (source of truth).
   */
  async fetchOrder(orderId: string): Promise<any> {
    return request(`/orders/${orderId}`, { method: "GET" });
  },

  /**
   * Initiates a refund against a Cashfree order.
   */
  async createRefund(
    orderId: string,
    params: { refundAmount: number; refundId: string; note?: string },
  ): Promise<CashfreeRefundResult> {
    const data = await request(`/orders/${orderId}/refunds`, {
      method: "POST",
      body: JSON.stringify({
        refund_amount: Number(params.refundAmount.toFixed(2)),
        refund_id: params.refundId,
        refund_note: params.note || "Refund",
      }),
    });

    return {
      cfRefundId: String(data.cf_refund_id),
      refundId: data.refund_id,
      refundStatus: data.refund_status,
    };
  },

  /**
   * Verifies the `x-webhook-signature` sent by Cashfree using the raw request body and timestamp.
   * Signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
   */
  verifyWebhookSignature(
    signature: string,
    rawBody: string,
    timestamp: string,
  ): boolean {
    const secretKey = config.cashfreeSecretKey;
    if (!signature || !timestamp || !secretKey) return false;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(timestamp + rawBody)
      .digest("base64");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      );
    } catch {
      return false;
    }
  },
};

export default CashfreeService;
