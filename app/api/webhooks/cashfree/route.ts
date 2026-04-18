import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

// Cashfree Subscription Webhook Handler (API version 2025-01-01)
// Docs: https://www.cashfree.com/docs/api-reference/payments/latest/subscription/webhooks
//
// Event types:
//   SUBSCRIPTION_STATUS_CHANGED               — subscription status changed
//   SUBSCRIPTION_AUTH_STATUS                   — auth (checkout) completed (success or failed)
//   SUBSCRIPTION_PAYMENT_NOTIFICATION_INITIATED — payment notification sent to customer
//   SUBSCRIPTION_PAYMENT_SUCCESS               — payment charged successfully
//   SUBSCRIPTION_PAYMENT_FAILED                — payment charge failed
//   SUBSCRIPTION_PAYMENT_CANCELLED             — payment cancelled by user
//   SUBSCRIPTION_REFUND_STATUS                 — refund processed
//   SUBSCRIPTION_CARD_EXPIRY_REMINDER          — card expiring soon (7 days)
//
// Payload shapes (2025-01-01):
//   Status events:  body.data.subscription_details.{subscription_id, cf_subscription_id, subscription_status}
//   Payment events: body.data.{subscription_id, cf_subscription_id, payment_id, cf_payment_id, payment_status, ...}
//   Auth events:    body.data.{subscription_id, cf_subscription_id, authorization_details.authorization_status, ...}
//   Refund events:  body.data.{payment_id, cf_payment_id, refund_status, ...}

// ─── Helpers ──────────────────────────────────────────────────────

/** Extract subscription_id and cf_subscription_id from any webhook payload shape */
function extractSubIds(data: Record<string, unknown>): {
  localSubId: string | null;
  cfSubId: string | null;
} {
  // Status events nest IDs under subscription_details
  const details = data.subscription_details as
    | Record<string, unknown>
    | undefined;
  // Card expiry nests under subscription_status_webhook.subscription_details
  const cardDetails = (
    data.subscription_status_webhook as Record<string, unknown> | undefined
  )?.subscription_details as Record<string, unknown> | undefined;
  // Payment/auth events have IDs at top level of data
  const localSubId =
    (details?.subscription_id as string) ||
    (cardDetails?.subscription_id as string) ||
    (data.subscription_id as string) ||
    null;
  const cfSubId =
    (details?.cf_subscription_id as string) ||
    (cardDetails?.cf_subscription_id as string) ||
    (data.cf_subscription_id as string) ||
    null;
  return { localSubId, cfSubId };
}

/** Extract payment ID from any webhook payload shape */
function extractPaymentId(data: Record<string, unknown>): string | null {
  return (data.cf_payment_id as string) || (data.payment_id as string) || null;
}

/** Look up subscription in DB by local ID first, then by cf ID */
async function findSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  localSubId: string | null,
  cfSubId: string | null,
) {
  if (localSubId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("cashfree_subscription_id", localSubId)
      .single();
    if (data) return data;
  }
  if (cfSubId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("cashfree_subscription_id", cfSubId)
      .single();
    if (data) return data;
  }
  return null;
}

/** Calculate period end from plan interval */
function calcPeriodEnd(planInterval: string | null): string {
  const periodEnd = new Date();
  if (planInterval === "year") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }
  return periodEnd.toISOString();
}

// ─── Webhook Handler ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    console.log("Cashfree webhook received:", JSON.stringify(body, null, 2));

    const eventType: string = body.type || "";
    const eventTime: string = body.event_time || "";
    const data = (body.data || {}) as Record<string, unknown>;

    // Build a unique event ID for idempotency
    // Cashfree doesn't send event_id, so derive from type + subscription + timestamp
    const { localSubId, cfSubId } = extractSubIds(data);
    const cfPaymentId = extractPaymentId(data);
    const eventId = `${eventType}_${localSubId || cfSubId || "unknown"}_${eventTime || Date.now()}`;

    // Idempotency: skip if already processed
    const { data: existing } = await supabase
      .from("subscription_webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Already processed" });
    }

    // Log the event
    await supabase.from("subscription_webhook_events").insert({
      event_id: eventId,
      event_type: eventType || "unknown",
      cashfree_subscription_id: localSubId || cfSubId,
      payment_id: cfPaymentId,
      payload: body,
    });

    if (!localSubId && !cfSubId) {
      return NextResponse.json({ message: "No subscription ID in payload" });
    }

    // Look up subscription in DB
    const sub = await findSubscription(supabase, localSubId, cfSubId);

    if (!sub) {
      console.warn(
        `Webhook: no subscription found for sub_id=${localSubId}, cf_sub_id=${cfSubId}`,
      );
      return NextResponse.json({ message: "Subscription not found in DB" });
    }

    // Store previous state for revert on failure
    const previousPlan = sub.plan;
    const previousStatus = sub.status;
    const previousAmount = sub.plan_amount;
    const previousInterval = sub.plan_interval;

    const updateData: Record<string, unknown> = {};

    // ─── Handle each event type ───────────────────────────────────

    switch (eventType) {
      // ── Subscription status changed ──
      case "SUBSCRIPTION_STATUS_CHANGED": {
        const details = data.subscription_details as
          | Record<string, unknown>
          | undefined;
        const cfStatus = (details?.subscription_status as string) || "";

        const statusMap: Record<string, string> = {
          ACTIVE: "active",
          ON_HOLD: "past_due",
          CANCELLED: "cancelled",
          CUSTOMER_CANCELLED: "cancelled",
          COMPLETED: "completed",
          EXPIRED: "expired",
          LINK_EXPIRED: "expired",
          CARD_EXPIRED: "past_due",
          BANK_APPROVAL_PENDING: "pending",
          CUSTOMER_PAUSED: "paused",
          INITIALIZED: "pending",
        };

        const newStatus = statusMap[cfStatus];
        if (newStatus) {
          updateData.status = newStatus;
        }

        if (cfStatus === "CANCELLED" || cfStatus === "CUSTOMER_CANCELLED") {
          updateData.cancelled_at = new Date().toISOString();
        }

        // If subscription becomes active and was pending/trial, set period dates
        if (newStatus === "active" && previousStatus !== "active") {
          updateData.current_period_start = new Date().toISOString();
          updateData.current_period_end = calcPeriodEnd(sub.plan_interval);
        }
        break;
      }

      // ── Auth status (checkout completed — success or failure) ──
      case "SUBSCRIPTION_AUTH_STATUS": {
        const authDetails = data.authorization_details as
          | Record<string, unknown>
          | undefined;
        const authStatus = (authDetails?.authorization_status as string) || "";
        const paymentStatus = (data.payment_status as string) || "";

        if (authStatus === "ACTIVE" || paymentStatus === "SUCCESS") {
          // Auth succeeded — subscription will become active via status webhook
          // but update status optimistically
          updateData.status = "active";
          if (previousStatus !== "active") {
            updateData.current_period_start = new Date().toISOString();
            updateData.current_period_end = calcPeriodEnd(sub.plan_interval);
          }
        } else if (authStatus === "FAILED" || paymentStatus === "FAILED") {
          // Auth failed — revert to previous plan
          if (previousStatus === "pending" || previousPlan === "free_trial") {
            updateData.status =
              previousPlan === "free_trial" ? "active" : "pending";
            updateData.plan = previousPlan;
            updateData.plan_amount = previousAmount;
            updateData.plan_interval = previousInterval;
            updateData.cashfree_subscription_id = null;
            updateData.cashfree_plan_id = null;
            updateData.payment_link = null;
          } else {
            updateData.status = "past_due";
          }
        }
        // PENDING — no action, wait for final auth status
        break;
      }

      // ── Payment success ──
      case "SUBSCRIPTION_PAYMENT_SUCCESS": {
        updateData.status = "active";
        updateData.current_period_start = new Date().toISOString();
        updateData.current_period_end = calcPeriodEnd(sub.plan_interval);

        if (cfPaymentId) {
          updateData.last_payment_id = cfPaymentId;
        }
        break;
      }

      // ── Payment failed ──
      case "SUBSCRIPTION_PAYMENT_FAILED": {
        // If first payment (activating from trial/pending), revert to previous state
        if (previousStatus === "pending" || previousPlan === "free_trial") {
          updateData.status =
            previousPlan === "free_trial" ? "active" : previousStatus;
          updateData.plan = previousPlan;
          updateData.plan_amount = previousAmount;
          updateData.plan_interval = previousInterval;
          updateData.cashfree_subscription_id = null;
          updateData.cashfree_plan_id = null;
          updateData.payment_link = null;
        } else {
          // Ongoing subscription payment failed
          updateData.status = "past_due";
        }
        break;
      }

      // ── Payment cancelled by user ──
      case "SUBSCRIPTION_PAYMENT_CANCELLED": {
        // Similar to failed — if first payment, revert; otherwise mark past_due
        if (previousStatus === "pending" || previousPlan === "free_trial") {
          updateData.status =
            previousPlan === "free_trial" ? "active" : previousStatus;
          updateData.plan = previousPlan;
          updateData.plan_amount = previousAmount;
          updateData.plan_interval = previousInterval;
          updateData.cashfree_subscription_id = null;
          updateData.cashfree_plan_id = null;
          updateData.payment_link = null;
        } else {
          updateData.status = "past_due";
        }
        break;
      }

      // ── Payment notification initiated (informational) ──
      case "SUBSCRIPTION_PAYMENT_NOTIFICATION_INITIATED": {
        console.log(
          `Payment notification sent for subscription ${localSubId || cfSubId}`,
        );
        break;
      }

      // ── Refund status ──
      case "SUBSCRIPTION_REFUND_STATUS": {
        const refundStatus = data.refund_status as string;
        console.log(
          `Refund ${refundStatus} for payment ${cfPaymentId}, subscription ${localSubId || cfSubId}`,
        );
        // Refunds don't change subscription status — just log
        break;
      }

      // ── Card expiry reminder ──
      case "SUBSCRIPTION_CARD_EXPIRY_REMINDER": {
        const cardExpiry = data.card_expiry_date as string;
        console.log(
          `Card expiring ${cardExpiry} for subscription ${localSubId || cfSubId}`,
        );
        // Could send notification to store owner in the future
        break;
      }

      default: {
        console.log(`Unhandled webhook event type: ${eventType}`);
        break;
      }
    }

    // ─── Apply updates ────────────────────────────────────────────

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", sub.id);

      if (error) {
        console.error("Failed to update subscription:", error);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 },
        );
      }

      console.log(
        `Webhook processed: ${eventType} → updated sub ${sub.id}:`,
        updateData,
      );
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
