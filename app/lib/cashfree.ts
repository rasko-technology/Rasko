import "server-only";

// Cashfree Subscription API client
// Docs: https://www.cashfree.com/docs/api-reference/payments/latest/subscription/overview

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const API_VERSION = "2025-01-01";

function headers() {
  return {
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version": API_VERSION,
    "Content-Type": "application/json",
  };
}

// ============================================
// PLAN TYPES
// ============================================

export interface CreatePlanParams {
  plan_id: string;
  plan_name: string;
  plan_type: "PERIODIC" | "ON_DEMAND";
  plan_currency?: string;
  plan_recurring_amount?: number;
  plan_max_amount: number;
  plan_max_cycles?: number;
  plan_intervals?: number;
  plan_interval_type?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  plan_note?: string;
}

export interface PlanEntity {
  plan_id: string;
  plan_name: string;
  plan_type: string;
  plan_currency: string;
  plan_recurring_amount: number;
  plan_max_amount: number;
  plan_max_cycles?: number;
  plan_intervals?: number;
  plan_interval_type?: string;
  plan_note?: string;
  plan_status?: string;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export interface CreateSubscriptionParams {
  subscription_id: string;
  customer_details: {
    customer_name?: string;
    customer_email: string;
    customer_phone: string;
  };
  plan_details: {
    plan_id?: string;
    plan_name?: string;
    plan_type?: "PERIODIC" | "ON_DEMAND";
    plan_currency?: string;
    plan_amount?: number;
    plan_max_amount?: number;
    plan_max_cycles?: number;
    plan_intervals?: number;
    plan_interval_type?: "DAY" | "WEEK" | "MONTH" | "YEAR";
  };
  subscription_meta?: {
    return_url?: string;
    notification_channel?: string[];
  };
  subscription_expiry_time?: string;
  subscription_first_charge_time?: string;
  subscription_note?: string;
  subscription_tags?: Record<string, string>;
}

export interface SubscriptionEntity {
  subscription_id: string;
  subscription_status: string;
  cf_subscription_id?: string;
  subscription_session_id?: string;
  plan_details?: {
    plan_id: string;
    plan_name: string;
    plan_type: string;
    plan_amount: number;
    plan_max_amount: number;
    plan_intervals: number;
    plan_interval_type: string;
  };
  authorization_details?: {
    authorization_amount: number;
    authorization_status: string;
    payment_id: string;
    payment_method: string;
  };
  subscription_meta?: {
    return_url: string;
  };
  subscription_expiry_time?: string;
  subscription_first_charge_time?: string;
  subscription_note?: string;
  subscription_tags?: Record<string, string>;
}

// ============================================
// API METHODS
// ============================================

async function cashfreeRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Cashfree API error:", JSON.stringify(data, null, 2));
    throw new Error(data.message || `Cashfree API error: ${res.status}`);
  }

  return data as T;
}

// ---- Plans ----

export async function createPlan(
  params: CreatePlanParams,
): Promise<PlanEntity> {
  return cashfreeRequest<PlanEntity>("POST", "/plans", params);
}

export async function fetchPlan(planId: string): Promise<PlanEntity> {
  return cashfreeRequest<PlanEntity>(
    "GET",
    `/plans/${encodeURIComponent(planId)}`,
  );
}

// ---- Subscriptions ----

export async function createSubscription(
  params: CreateSubscriptionParams,
): Promise<SubscriptionEntity> {
  return cashfreeRequest<SubscriptionEntity>("POST", "/subscriptions", params);
}

export async function fetchSubscription(
  subscriptionId: string,
): Promise<SubscriptionEntity> {
  return cashfreeRequest<SubscriptionEntity>(
    "GET",
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
}

export async function manageSubscription(
  subscriptionId: string,
  action: "CANCEL" | "PAUSE" | "RESUME" | "CHANGE_PLAN",
  actionDetails?: { plan_id?: string },
): Promise<SubscriptionEntity> {
  return cashfreeRequest<SubscriptionEntity>(
    "POST",
    `/subscriptions/${encodeURIComponent(subscriptionId)}/manage`,
    {
      subscription_id: subscriptionId,
      action,
      action_details: actionDetails,
    },
  );
}

// ---- Subscription Payments ----

export interface CreateSubscriptionPaymentParams {
  subscription_id: string;
  subscription_session_id?: string;
  payment_id: string;
  payment_type: "AUTH" | "CHARGE";
  payment_amount?: number;
  payment_schedule_date?: string;
  payment_remarks?: string;
}

export interface CreateSubscriptionPaymentResponse {
  cf_payment_id?: string;
  payment_id?: string;
  payment_amount?: number;
  payment_status?: string;
  payment_type?: string;
  subscription_id?: string;
  data?: Record<string, unknown>;
}

export async function createSubscriptionPayment(
  params: CreateSubscriptionPaymentParams,
): Promise<CreateSubscriptionPaymentResponse> {
  return cashfreeRequest<CreateSubscriptionPaymentResponse>(
    "POST",
    "/subscriptions/pay",
    params,
  );
}

export async function fetchSubscriptionPayments(subscriptionId: string) {
  return cashfreeRequest<unknown[]>(
    "GET",
    `/subscriptions/${encodeURIComponent(subscriptionId)}/payments`,
  );
}

// ============================================
// PLAN CONSTANTS
// ============================================

export const PLAN_MONTHLY_ID = "rasko-monthly-599";
export const PLAN_YEARLY_ID = "rasko-yearly-5999";

export const PLANS = {
  monthly: {
    id: PLAN_MONTHLY_ID,
    name: "Rasko Monthly",
    amount: 599,
    interval_type: "MONTH" as const,
    intervals: 1,
    max_amount: 599,
  },
  yearly: {
    id: PLAN_YEARLY_ID,
    name: "Rasko Yearly",
    amount: 5999,
    interval_type: "YEAR" as const,
    intervals: 1,
    max_amount: 5999,
  },
} as const;

/**
 * Ensures Cashfree plans exist. Call once during setup/seed.
 */
export async function ensurePlansExist() {
  for (const plan of Object.values(PLANS)) {
    // Check if plan exists with a quiet fetch (no error logging)
    const res = await fetch(
      `${BASE_URL}/plans/${encodeURIComponent(plan.id)}`,
      { method: "GET", headers: headers() },
    );
    if (res.ok) continue;

    // Plan doesn't exist, create it
    await createPlan({
      plan_id: plan.id,
      plan_name: plan.name,
      plan_type: "PERIODIC",
      plan_currency: "INR",
      plan_recurring_amount: plan.amount,
      plan_max_amount: plan.max_amount,
      plan_intervals: plan.intervals,
      plan_interval_type: plan.interval_type,
    });
  }
}
