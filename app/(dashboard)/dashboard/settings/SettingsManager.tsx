"use client";

import { useState, useActionState } from "react";
import { updateStore, updateOwnerProfile } from "@/app/actions/settings";

interface Store {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  full_address: string | null;
  logo_url: string | null;
}

export function SettingsManager({
  store,
  ownerEmail,
}: {
  store: Store | null;
  ownerEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<"store" | "account">("store");

  const [storeState, storeAction, storePending] = useActionState(
    updateStore,
    undefined,
  );
  const [profileState, profileAction, profilePending] = useActionState(
    updateOwnerProfile,
    undefined,
  );

  const tabs = [
    { id: "store" as const, label: "Store Details" },
    { id: "account" as const, label: "Account" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-white shadow-sm"
                : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Details Tab */}
      {activeTab === "store" && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
            Store Information
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            Update your store details visible to your team
          </p>

          {storeState?.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                storeState.success
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {storeState.message}
            </div>
          )}

          <form action={storeAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Store Name *
                </label>
                <input
                  name="name"
                  defaultValue={store?.name || ""}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
                {storeState?.errors?.name && (
                  <p className="text-xs text-danger mt-1">
                    {storeState.errors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Phone
                </label>
                <input
                  name="phone"
                  defaultValue={store?.phone || ""}
                  placeholder="+91..."
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={store?.email || ""}
                  placeholder="store@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Website
                </label>
                <input
                  name="website"
                  defaultValue={store?.website || ""}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">
                Address
              </label>
              <input
                name="address"
                defaultValue={store?.address || ""}
                placeholder="Street address"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  City
                </label>
                <input
                  name="city"
                  defaultValue={store?.city || ""}
                  placeholder="City"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Pincode
                </label>
                <input
                  name="pincode"
                  defaultValue={store?.pincode || ""}
                  placeholder="Pincode"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            {store?.full_address && (
              <input
                type="hidden"
                name="full_address"
                defaultValue={store.full_address}
              />
            )}

            {/* Store ID info */}
            <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <p className="text-xs text-surface-500">
                <strong>Store ID:</strong>{" "}
                <span className="font-mono text-primary-600 dark:text-primary-400">
                  {store?.id}
                </span>{" "}
                — Employees use this to log in
              </p>
            </div>

            <button
              type="submit"
              disabled={storePending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {storePending ? "Saving..." : "Save Store Details"}
            </button>
          </form>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
            Account Settings
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            Update your login email and password
          </p>

          {profileState?.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                profileState.success
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {profileState.message}
            </div>
          )}

          <form action={profileAction} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                defaultValue={ownerEmail}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              {profileState?.errors?.email && (
                <p className="text-xs text-danger mt-1">
                  {profileState.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">
                New Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              {profileState?.errors?.password && (
                <p className="text-xs text-danger mt-1">
                  {profileState.errors.password[0]}
                </p>
              )}
              <p className="text-xs text-surface-400 mt-1">
                Minimum 8 characters. Leave blank if you don&apos;t want to
                change it.
              </p>
            </div>

            <button
              type="submit"
              disabled={profilePending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {profilePending ? "Saving..." : "Update Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
