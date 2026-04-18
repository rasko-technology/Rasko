declare module "@cashfreepayments/cashfree-js" {
  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement;
  }

  interface SubscriptionsCheckoutOptions {
    subsSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal" | HTMLElement;
    mode?: "sandbox" | "production";
  }

  interface CashfreeInstance {
    checkout: (
      options: CheckoutOptions,
    ) => Promise<{
      error?: unknown;
      paymentDetails?: unknown;
      redirect?: boolean;
    }>;
    subscriptionsCheckout: (
      options: SubscriptionsCheckoutOptions,
    ) => Promise<{ error?: unknown; redirect?: boolean }>;
  }

  export function load(options: {
    mode: "sandbox" | "production";
  }): Promise<CashfreeInstance | null>;
}
