"use client";

import { useState, useActionState } from "react";
import { createLead } from "@/app/actions/leads";

interface Props {
  employees: { id: number; name: string }[];
}

export function CreateLeadForm({ employees }: Props) {
  const [state, action, pending] = useActionState(createLead, undefined);
  const [showMore, setShowMore] = useState(false);

  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${state.success ? "bg-success/10 border border-success/20 text-success" : "bg-danger/10 border border-danger/20 text-danger"}`}
        >
          {state.message}
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
            👤
          </span>
          Customer Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Customer Name *
            </label>
            <input
              name="customer_name"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Mobile Number *
            </label>
            <input
              name="phone"
              type="tel"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="+91..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
            Address
          </label>
          <input
            name="address"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            placeholder="Full address"
          />
        </div>
      </div>

      {/* Lead Details */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
            📋
          </span>
          Lead Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Item
            </label>
            <input
              name="item"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Item or service"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Configuration
            </label>
            <input
              name="configuration"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Optional configuration"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              defaultValue={1}
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Payment Mode
            </label>
            <input
              name="payment_mode"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Cash, card, transfer..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Amount (₹)
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue="new"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="mt-4 text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline"
        >
          {showMore ? "▲ Less options" : "▼ More options"}
        </button>

        {showMore && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Action Taken
              </label>
              <input
                name="action_taken"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                placeholder="Optional action summary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Assigned To
              </label>
              <select
                name="assigned_to"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="">Not assigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-y"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Creating..." : "Create Lead"}
        </button>
      </div>
    </form>
  );
}
