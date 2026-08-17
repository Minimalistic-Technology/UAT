import axios from 'axios';
import crypto from 'crypto';

const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const getBaseUrl = () => {
    return process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg';
};

const getHeaders = () => ({
    'x-client-id': process.env.CASHFREE_APP_ID || '',
    'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
    'x-api-version': CASHFREE_API_VERSION,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
});

export interface CashfreeCreateOrderResult {
    cfOrderId: string;
    paymentSessionId: string;
    orderStatus: string;
}

class CashfreeService {
    /**
     * Creates an order at Cashfree and returns the payment_session_id used to launch checkout.
     */
    static async createOrder(params: {
        orderId: string;
        amount: number;
        customerId: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        returnUrl: string;
    }): Promise<CashfreeCreateOrderResult> {
        const payload = {
            order_id: params.orderId,
            order_amount: Number(params.amount.toFixed(2)),
            order_currency: 'INR',
            customer_details: {
                customer_id: params.customerId,
                customer_name: params.customerName || 'Customer',
                customer_email: params.customerEmail,
                customer_phone: params.customerPhone || '9999999999'
            },
            order_meta: {
                return_url: params.returnUrl
            }
        };

        const response = await axios.post(`${getBaseUrl()}/orders`, payload, { headers: getHeaders() });

        return {
            cfOrderId: response.data.cf_order_id,
            paymentSessionId: response.data.payment_session_id,
            orderStatus: response.data.order_status
        };
    }

    /**
     * Fetches the current status of an order directly from Cashfree (source of truth).
     */
    static async fetchOrder(orderId: string): Promise<any> {
        const response = await axios.get(`${getBaseUrl()}/orders/${orderId}`, { headers: getHeaders() });
        return response.data;
    }

    /**
     * Verifies the `x-webhook-signature` sent by Cashfree using the raw request body and timestamp.
     * Signature = Base64(HMAC-SHA256(timestamp + rawBody, secretKey))
     */
    static verifyWebhookSignature(signature: string, rawBody: string, timestamp: string): boolean {
        const secretKey = process.env.CASHFREE_SECRET_KEY || '';
        if (!signature || !timestamp || !secretKey) return false;

        const signedPayload = timestamp + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(signedPayload)
            .digest('base64');

        try {
            return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
        } catch {
            return false;
        }
    }
}

export default CashfreeService;
