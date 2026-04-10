"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus, deleteLead } from "@/app/actions/leads";
import Link from "next/link";

interface ProductReq {
  product_name: string;
  brand_name: string;
  model: string;
  configuration: string;
  qty: number;
  referral_link: string;
}

interface Lead {
  id: number;
  customer_id: number;
  customers: {
    id: number;
    name: string;
    phone: string | null;
    city: string | null;
  } | null;
  user_type: string | null;
  incoming_source: string | null;
  advance_amount: number | null;
  priority: string | null;
  booking_date_time: string | null;
  payment_mode: string | null;
  product_requirements: ProductReq[] | null;
  item: string | null;
  amount: number | null;
  status: string;
  action_taken: string | null;
  notes: string | null;
  assigned_to: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  contacted:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  qualified:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  converted:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

interface Props {
  leads: Lead[];
  employees: { id: number; name: string }[];
}

export function LeadSummary({ leads, employees }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const perPage = 10;

  const employeeMap = Object.fromEntries(
    employees.map((e) => [String(e.id), e.name]),
  );

  const filtered = leads.filter((l) => {
    const name = l.customers?.name || "";
    const phone = l.customers?.phone || "";
    const city = l.customers?.city || "";
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search) ||
      city.toLowerCase().includes(search.toLowerCase()) ||
      (l.incoming_source || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const counts = leads.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => {
      await updateLeadStatus(id, status);
    });
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete lead "${name}"?`)) return;
    startTransition(async () => {
      await deleteLead(id);
    });
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Lead Summary
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            {leads.length} leads total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-48 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-white"
          >
            <option value="">All statuses</option>
            {Object.keys(counts).map((s) => (
              <option key={s} value={s}>
                {s} ({counts[s]})
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/leads/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-600/20 whitespace-nowrap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create Lead
          </Link>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {["new", "contacted", "qualified", "converted", "lost"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(statusFilter === s ? "" : s);
              setPage(1);
            }}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${statusFilter === s ? "border-primary-400 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5" : "border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300"}`}
          >
            <p className="text-xs text-surface-500 capitalize">{s}</p>
            <p className="text-xl font-bold text-surface-900 dark:text-white mt-0.5">
              {counts[s] || 0}
            </p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider w-10">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-surface-400 text-sm"
                  >
                    {search || statusFilter
                      ? "No leads match."
                      : "No leads yet."}
                  </td>
                </tr>
              ) : (
                paginated.map((lead, idx) => (
                  <>
                    <tr
                      key={lead.id}
                      onClick={() =>
                        setExpandedId(expandedId === lead.id ? null : lead.id)
                      }
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-surface-500">
                        {(page - 1) * perPage + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {lead.customers?.name || "—"}
                        </p>
                        {lead.customers?.city && (
                          <p className="text-xs text-surface-400">
                            {lead.customers.city}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">
                        {lead.customers?.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">
                        {lead.incoming_source || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lead.priority && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[lead.priority] || ""}`}
                          >
                            {lead.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">
                        {lead.assigned_to
                          ? employeeMap[String(lead.assigned_to)] || "—"
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={lead.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(lead.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={pending}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[lead.status] || "bg-surface-100 text-surface-600"}`}
                        >
                          {[
                            "new",
                            "contacted",
                            "qualified",
                            "converted",
                            "lost",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg border border-primary-300 dark:border-primary-500/30 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                lead.id,
                                lead.customers?.name || "Unknown",
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg border border-danger/30 text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === lead.id && (
                      <tr
                        key={`${lead.id}-detail`}
                        className="bg-surface-50/50 dark:bg-surface-800/30"
                      >
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-xs text-surface-400 mb-0.5">
                                User Type
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {lead.user_type || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-surface-400 mb-0.5">
                                Payment Mode
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {lead.payment_mode || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-surface-400 mb-0.5">
                                Advance Amount
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {lead.advance_amount
                                  ? `₹${lead.advance_amount}`
                                  : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-surface-400 mb-0.5">
                                Booking Date & Time
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {lead.booking_date_time
                                  ? formatDateTime(lead.booking_date_time)
                                  : "—"}
                              </p>
                            </div>
                          </div>
                          {lead.notes && (
                            <div className="mb-4">
                              <p className="text-xs text-surface-400 mb-0.5">
                                Notes
                              </p>
                              <p className="text-sm text-surface-700 dark:text-surface-300">
                                {lead.notes}
                              </p>
                            </div>
                          )}
                          {lead.product_requirements &&
                            lead.product_requirements.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-surface-500 uppercase mb-2">
                                  Product Requirements
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-surface-200 dark:border-surface-700">
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Product
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Brand
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Model
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Config
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Qty
                                      </th>
                                      <th className="px-2 py-1 text-left text-xs text-surface-400">
                                        Link
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {lead.product_requirements.map((p, i) => (
                                      <tr
                                        key={i}
                                        className="border-b border-surface-100 dark:border-surface-800"
                                      >
                                        <td className="px-2 py-1.5 text-surface-700 dark:text-surface-300">
                                          {p.product_name || "—"}
                                        </td>
                                        <td className="px-2 py-1.5 text-surface-700 dark:text-surface-300">
                                          {p.brand_name || "—"}
                                        </td>
                                        <td className="px-2 py-1.5 text-surface-700 dark:text-surface-300">
                                          {p.model || "—"}
                                        </td>
                                        <td className="px-2 py-1.5 text-surface-700 dark:text-surface-300">
                                          {p.configuration || "—"}
                                        </td>
                                        <td className="px-2 py-1.5 text-surface-700 dark:text-surface-300">
                                          {p.qty}
                                        </td>
                                        <td className="px-2 py-1.5">
                                          {p.referral_link ? (
                                            <a
                                              href={p.referral_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary-600 dark:text-primary-400 hover:underline"
                                            >
                                              View
                                            </a>
                                          ) : (
                                            "—"
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 disabled:opacity-30 cursor-pointer"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${p === page ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 disabled:opacity-30 cursor-pointer"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
