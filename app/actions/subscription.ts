"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireAuth, getUserStore } from "@/app/lib/auth";
import {
  createSubscription,
  manageSubscription,
  fetchSubscription,
  PLANS,
  ensurePlansExist,
} from "@/app/lib/cashfree";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function getSubscription() {
  const user = await requireAuth();
  const membership = await getUserStore();
  if (!membership) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("store_id", membership.store_id)
    .single();

  return data;
}

export async function startSubscription(planType: "monthly" | "yearly") {
  const user = await requireAuth();
  const membership = await getUserStore();
  if (!membership) throw new Error("No store found");

  const supabase = await createClient();

  const store = membership.stores as unknown as {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  };

  // Get current subscription
  const { data: currentSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("store_id", membership.store_id)
    .single();

  if (!currentSub) throw new Error("No subscription record found");

  // Don't allow if already on a paid plan
  if (currentSub.plan === planType && currentSub.cashfree_subscription_id) {
    throw new Error("Already subscribed to this plan");
  }

  // Ensure plans exist in Cashfree
  await ensurePlansExist();

  const plan = PLANS[planType];
  const subscriptionId = `sub_${membership.store_id}_${planType}_${Date.now()}`;

  // Calculate first charge time: after trial ends or now (if trial expired)
  const trialEnd = currentSub.trial_end_date
    ? new Date(currentSub.trial_end_date)
    : null;
  const now = new Date();
  const firstChargeTime =
    trialEnd && trialEnd > now ? trialEnd.toISOString() : undefined;

  // Create Cashfree subscription
  const cfSub = await createSubscription({
    subscription_id: subscriptionId,
    customer_details: {
      customer_name: store.name || "Valued Customer",
      customer_email: store.email || "noemail@example.com",
      customer_phone: store.phone || "9999999999", // Will be updated from store details
    },
    plan_details: {
      plan_id: plan.id,
    },
    subscription_meta: {
      return_url: `${APP_URL}/subscription/confirm?subscription_id=${subscriptionId}`,
      notification_channel: ["EMAIL"],
    },
    subscription_first_charge_time: firstChargeTime,
    subscription_note: `Rasko ${planType} plan for store ${membership.store_id}`,
    subscription_tags: {
      store_id: String(membership.store_id),
      plan_type: planType,
    },
  });

  // Update local subscription record
  // Store our local subscription_id (not cf_subscription_id) because
  // Cashfree's GET API expects subscription_id, not cf_subscription_id
  await supabase
    .from("subscriptions")
    .update({
      cashfree_subscription_id: subscriptionId,
      cashfree_plan_id: plan.id,
      plan: planType === "monthly" ? "monthly" : "yearly",
      plan_amount: plan.amount,
      plan_interval: plan.interval_type.toLowerCase(),
      status: "pending",
      payment_link: cfSub.subscription_meta?.return_url || null,
    })
    .eq("store_id", membership.store_id);

  // Return the subscription_session_id — used to redirect to Cashfree's hosted checkout
  return {
    subscriptionId: cfSub.subscription_id || subscriptionId,
    cfSubscriptionId: cfSub.cf_subscription_id,
    subscriptionSessionId: cfSub.subscription_session_id,
    status: cfSub.subscription_status,
  };
}

export async function cancelSubscription() {
  const membership = await getUserStore();
  if (!membership) throw new Error("No store found");

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("store_id", membership.store_id)
    .single();

  if (!sub?.cashfree_subscription_id) {
    throw new Error("No active Cashfree subscription found");
  }

  // Cancel on Cashfree
  await manageSubscription(sub.cashfree_subscription_id, "CANCEL");

  // Update local record
  await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("store_id", membership.store_id);

  return { success: true };
}

export async function syncSubscriptionStatus() {
  const membership = await getUserStore();
  if (!membership) return null;

  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("store_id", membership.store_id)
    .single();

  if (!sub?.cashfree_subscription_id) return sub;

  try {
    const cfSub = await fetchSubscription(sub.cashfree_subscription_id);

    const statusMap: Record<string, string> = {
      INITIALIZED: "pending",
      ACTIVE: "active",
      ON_HOLD: "past_due",
      CANCELLED: "cancelled",
      COMPLETED: "completed",
      EXPIRED: "expired",
    };

    const newStatus = statusMap[cfSub.subscription_status] || sub.status;

    if (newStatus !== sub.status) {
      await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("store_id", membership.store_id);
    }

    return { ...sub, status: newStatus };
  } catch {
    return sub;
  }
}
