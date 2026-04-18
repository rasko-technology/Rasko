import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { fetchSubscription } from "@/app/lib/cashfree";

// This route is called after the user returns from Cashfree payment.
// It doesn't require auth because the user's session may have expired
// during payment. It uses the subscription_id to look up and sync status.

export async function GET(request: NextRequest) {
  const subscriptionId = request.nextUrl.searchParams.get("subscription_id");

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Missing subscription_id" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // Find the subscription in our DB — try cashfree_subscription_id first,
  // then fall back to matching the local subscription_id pattern in tags
  let { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("cashfree_subscription_id", subscriptionId)
    .single();

  // The return_url uses our local subscription_id (e.g. sub_7_monthly_...),
  // but cashfree_subscription_id may be the Cashfree cf_subscription_id.
  // Parse store_id from the local ID pattern: sub_{store_id}_{plan}_{timestamp}
  if (!sub) {
    const match = subscriptionId.match(/^sub_(\d+)_/);
    if (match) {
      const storeId = parseInt(match[1], 10);
      const { data: storeSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("store_id", storeId)
        .single();
      if (storeSub) {
        sub = storeSub;
        // Fix the stored ID: replace cf_subscription_id with our local subscription_id
        // so future API calls and webhook lookups work correctly
        if (sub.cashfree_subscription_id !== subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({ cashfree_subscription_id: subscriptionId })
            .eq("id", sub.id);
          sub.cashfree_subscription_id = subscriptionId;
        }
      }
    }
  }

  if (!sub) {
    return NextResponse.json(
      { error: "Subscription not found" },
      { status: 404 },
    );
  }

  // cashfree_subscription_id stores our local subscription_id (e.g. sub_7_monthly_...)
  // which is what Cashfree's GET API expects
  const apiSubscriptionId = sub.cashfree_subscription_id || subscriptionId;

  try {
    if (!apiSubscriptionId) {
      // No Cashfree subscription yet — return current DB status
      return NextResponse.json({
        status: sub.status,
        plan: sub.plan,
        store_id: sub.store_id,
      });
    }

    // Fetch latest status from Cashfree using our subscription_id
    const cfSub = await fetchSubscription(apiSubscriptionId);

    console.log("Fetched subscription from Cashfree:", cfSub);

    const statusMap: Record<string, string> = {
      INITIALIZED: "pending",
      ACTIVE: "active",
      ON_HOLD: "past_due",
      CANCELLED: "cancelled",
      COMPLETED: "completed",
      EXPIRED: "expired",
    };

    const newStatus = statusMap[cfSub.subscription_status] || sub.status;

    const updateData: Record<string, unknown> = { status: newStatus };

    // If subscription is now active, set period dates
    if (newStatus === "active" && sub.status !== "active") {
      updateData.current_period_start = new Date().toISOString();
      const periodEnd = new Date();
      if (sub.plan_interval === "year") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      updateData.current_period_end = periodEnd.toISOString();
    }

    // If payment failed or subscription is not active, revert to previous plan
    if (
      newStatus === "cancelled" ||
      newStatus === "expired" ||
      cfSub.subscription_status === "INITIALIZED"
    ) {
      // If the user was on a free trial before attempting payment, restore it
      if (sub.plan === "monthly" || sub.plan === "yearly") {
        // Check if they had a trial that's still valid
        if (sub.trial_end_date && new Date(sub.trial_end_date) > new Date()) {
          updateData.plan = "free_trial";
          updateData.status = "active";
          updateData.plan_amount = 0;
          updateData.cashfree_subscription_id = null;
          updateData.cashfree_plan_id = null;
          updateData.payment_link = null;
        }
      }
    }

    await supabase.from("subscriptions").update(updateData).eq("id", sub.id);

    return NextResponse.json({
      status: newStatus,
      plan: sub.plan,
      store_id: sub.store_id,
    });
  } catch (error) {
    console.error("Failed to fetch subscription from Cashfree:", error);
    return NextResponse.json({
      status: sub.status,
      plan: sub.plan,
      store_id: sub.store_id,
      sync_error: true,
    });
  }
}
