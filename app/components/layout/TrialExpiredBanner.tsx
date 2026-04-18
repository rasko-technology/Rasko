"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function TrialExpiredBanner({
  trialEndDate,
  plan,
  status,
}: {
  trialEndDate: string | null;
  plan: string;
  status: string;
}) {
  if (plan !== "free_trial" || status !== "active") return null;
  if (!trialEndDate) return null;

  const trialEnd = new Date(trialEndDate);
  const now = new Date();
  const daysLeft = Math.ceil(
    (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm rounded-xl mb-4 ${
        isExpired
          ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {isExpired
            ? "Your free trial has expired. Subscribe to continue using all features."
            : `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Subscribe to keep full access.`}
        </span>
      </div>
      <Link
        href="/dashboard/settings?tab=subscription"
        className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
