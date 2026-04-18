"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  startSubscription,
  cancelSubscription,
  syncSubscriptionStatus,
} from "@/app/actions/subscription";
import { load } from "@cashfreepayments/cashfree-js";
import { Crown, Check, Loader2, AlertTriangle, Zap } from "lucide-react";

interface Subscription {
  id: number;
  store_id: number;
  plan: string;
  status: string;
  plan_amount: number | null;
  plan_interval: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end_date: string | null;
  cashfree_subscription_id: string | null;
  cancelled_at: string | null;
}

export function SubscriptionManager({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const [sub, setSub] = useState(subscription);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  // Sync status on mount
  useEffect(() => {
    syncSubscriptionStatus().then((updated) => {
      if (updated) setSub(updated as Subscription);
    });
  }, []);

  const isTrialing = sub?.plan === "free_trial" && sub?.status === "active";
  const trialDaysLeft = sub?.trial_end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(sub.trial_end_date).getTime() - now) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;
  const trialExpired = isTrialing && trialDaysLeft === 0;
  const isActive = sub?.status === "active" && sub?.plan !== "free_trial";
  const isCancelled = sub?.status === "cancelled";

  // Initialise Cashfree SDK once
  const cashfreeRef = useRef<Awaited<ReturnType<typeof load>> | null>(null);
  useEffect(() => {
    load({
      mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    }).then((sdk) => {
      cashfreeRef.current = sdk;
    });
  }, []);

  const handleSubscribe = (planType: "monthly" | "yearly") => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await startSubscription(planType);

        if (result.subscriptionSessionId) {
          setSuccess("Redirecting to payment...");
          setSub((prev) =>
            prev ? { ...prev, status: "pending", plan: planType } : prev,
          );
          const cashfree = cashfreeRef.current;
          if (cashfree) {
            cashfree.subscriptionsCheckout({
              subsSessionId: result.subscriptionSessionId,
              redirectTarget: "_self",
            });
          } else {
            setError("Payment SDK failed to load. Please try again.");
          }
        } else {
          setError("No payment session returned. Please try again.");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start subscription",
        );
      }
    });
  };

  const handleCancel = () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll lose access at the end of your current billing period.",
      )
    )
      return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await cancelSubscription();
        setSub((prev) =>
          prev
            ? {
                ...prev,
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
              }
            : prev,
        );
        setSuccess(
          "Subscription cancelled. You'll have access until the end of your current period.",
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to cancel subscription",
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Banner */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
              Current Plan
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {isTrialing && !trialExpired && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <Zap className="w-3 h-3" />
                    Free Trial
                  </span>
                  <span className="text-sm text-surface-500">
                    {trialDaysLeft} days remaining
                  </span>
                </>
              )}
              {trialExpired && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  Trial Expired
                </span>
              )}
              {isActive && (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Crown className="w-3 h-3" />
                    {sub?.plan === "yearly" ? "Yearly Plan" : "Monthly Plan"}
                  </span>
                  <span className="text-sm text-surface-500">
                    ₹{sub?.plan_amount}/
                    {sub?.plan_interval === "year" ? "year" : "month"}
                  </span>
                </>
              )}
              {isCancelled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Cancelled
                </span>
              )}
              {sub?.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Payment Pending
                </span>
              )}
            </div>
          </div>
          {isActive && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-sm text-surface-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Cancel Plan
            </button>
          )}
        </div>

        {sub?.current_period_end && isActive && (
          <p className="text-xs text-surface-400 mt-3">
            Current period ends:{" "}
            {new Date(sub.current_period_end).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 rounded-lg text-sm bg-danger/10 text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg text-sm bg-success/10 text-success">
          {success}
        </div>
      )}

      {/* Plan Cards — show when on trial or expired or cancelled */}
      {(!isActive || isCancelled || trialExpired) && (
        <div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            {trialExpired
              ? "Your trial has ended. Choose a plan to continue:"
              : "Upgrade your plan"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <div className="relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
              <h4 className="text-lg font-semibold text-surface-900 dark:text-white">
                Monthly
              </h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-surface-900 dark:text-white">
                  ₹599
                </span>
                <span className="text-surface-500 text-sm">/month</span>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  "Unlimited leads & bookings",
                  "Job card management",
                  "Employee management",
                  "WhatsApp notifications",
                  "Customer reports",
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={isPending}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : isTrialing && !trialExpired ? (
                  "Subscribe — ₹599/mo"
                ) : (
                  "Get Started — ₹599/mo"
                )}
              </button>
              {isTrialing && !trialExpired && (
                <p className="text-xs text-surface-400 mt-2 text-center">
                  First charge after trial ends
                </p>
              )}
            </div>

            {/* Yearly Plan */}
            <div className="relative bg-white dark:bg-surface-900 border-2 border-primary-500 dark:border-primary-600 rounded-2xl p-6 shadow-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
                  Save 30%
                </span>
              </div>
              <h4 className="text-lg font-semibold text-surface-900 dark:text-white">
                Yearly
              </h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-surface-900 dark:text-white">
                  ₹5,999
                </span>
                <span className="text-surface-500 text-sm">/year</span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                That&apos;s just ₹500/month
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Everything in Monthly",
                  "Priority support",
                  "Advanced analytics",
                  "Custom print templates",
                  "API access",
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("yearly")}
                disabled={isPending}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : isTrialing && !trialExpired ? (
                  "Subscribe — ₹5,999/yr"
                ) : (
                  "Get Started — ₹5,999/yr"
                )}
              </button>
              {isTrialing && !trialExpired && (
                <p className="text-xs text-surface-400 mt-2 text-center">
                  First charge after trial ends
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
