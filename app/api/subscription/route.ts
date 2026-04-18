import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getUser, getUserStore } from "@/app/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await getUserStore();
  if (!membership) {
    return NextResponse.json({ error: "No store found" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("store_id", membership.store_id)
    .single();

  if (!subscription) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 },
    );
  }

  // Check if trial has expired
  const isTrialExpired =
    subscription.plan === "free_trial" &&
    subscription.trial_end_date &&
    new Date(subscription.trial_end_date) < new Date();

  return NextResponse.json({
    ...subscription,
    is_trial_expired: isTrialExpired,
  });
}
