"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Status = "loading" | "success" | "failed" | "pending" | "error";

export default function SubscriptionConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subscriptionId = searchParams.get("subscription_id");
  const [status, setStatus] = useState<Status>(
    subscriptionId ? "loading" : "error",
  );
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionId) return;

    fetch(
      `/api/subscription/confirm?subscription_id=${encodeURIComponent(subscriptionId)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setPlan(data.plan);
        if (data.error) {
          setStatus("error");
        } else if (data.status === "active") {
          setStatus("success");
        } else if (data.status === "cancelled" || data.status === "expired") {
          setStatus("failed");
        } else if (data.status === "pending") {
          setStatus("pending");
        } else {
          // past_due, etc. — treat as pending
          setStatus("pending");
        }
      })
      .catch((error) => {
        console.error("Error confirming subscription:", error);
        setStatus("error");
      });
  }, [subscriptionId]);

  // Auto-redirect to dashboard after success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard/settings");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-brand-600 animate-spin" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Confirming your payment...
            </h1>
            <p className="text-surface-500">
              Please wait while we verify your subscription.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Subscription Activated!
            </h1>
            <p className="text-surface-500">
              Your {plan === "yearly" ? "yearly" : "monthly"} plan is now
              active. Redirecting to dashboard...
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4 inline-flex items-center px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Payment Unsuccessful
            </h1>
            <p className="text-surface-500">
              Your subscription could not be activated. Your previous plan has
              been restored. You can try again from settings.
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4 inline-flex items-center px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Settings
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-amber-500 animate-spin" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Payment Processing
            </h1>
            <p className="text-surface-500">
              Your payment is still being processed. This may take a few
              minutes. You can check your subscription status in settings.
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4 inline-flex items-center px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Settings
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="w-16 h-16 mx-auto text-amber-500" />
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Something went wrong
            </h1>
            <p className="text-surface-500">
              We couldn&apos;t verify your payment status. Don&apos;t worry — if
              your payment was successful, it will be updated shortly.
            </p>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="mt-4 inline-flex items-center px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
