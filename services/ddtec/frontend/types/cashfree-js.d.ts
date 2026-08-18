declare module '@cashfreepayments/cashfree-js' {
    export interface CashfreeCheckoutOptions {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_blank' | '_top' | HTMLElement;
    }

    export interface CashfreeInstance {
        checkout: (options: CashfreeCheckoutOptions) => Promise<void>;
    }

    export function load(config: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;
}
