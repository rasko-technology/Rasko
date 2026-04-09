"use client";

import { useEffect, useState, useTransition } from "react";
import {
  updateBookingStatus,
  deleteBooking,
  confirmBooking,
} from "@/app/actions/bookings";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog } from "@/app/components/ui/Dialog";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
}

interface Booking {
  id: number;
  customer_id: number | null;
  customer: Customer | null;
  product_name: string;
  brand_name: string;
  model_name: string | null;
  problem: string;
  remark: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  in_progress:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export function BookingSummary({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const perPage = 10;

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    id: number;
    name: string;
    action: "confirm" | "delete";
  } | null>(null);

  const filtered = bookings.filter((b) => {
    const customerName = b.customer?.name || "";
    const customerPhone = b.customer?.phone || "";
    const matchSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerPhone.includes(search) ||
      b.product_name.toLowerCase().includes(search.toLowerCase()) ||
      b.brand_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const counts = bookings.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => {
      await updateBookingStatus(id, status);
      setToast({ message: "Status updated.", type: "success" });
    });
  }

  function handleDelete(id: number, name: string) {
    setConfirmDialog({ id, name, action: "delete" });
  }

  function handleConfirm(id: number, name: string) {
    setConfirmDialog({ id, name, action: "confirm" });
  }

  function executeDialogAction() {
    if (!confirmDialog) return;
    const { id, action: dialogAction } = confirmDialog;
    setConfirmDialog(null);

    if (dialogAction === "delete") {
      startTransition(async () => {
        const result = await deleteBooking(id);
        setToast({
          message: result?.message || "Booking deleted.",
          type: result?.success ? "success" : "error",
        });
      });
    } else {
      startTransition(async () => {
        const result = await confirmBooking(id);
        if (result?.success) {
          setToast({
            message: result.message || "Booking confirmed!",
            type: "success",
          });
          const jobcardId = result.data?.jobcardId;
          if (jobcardId) {
            setTimeout(
              () => router.push(`/dashboard/jobcards/${jobcardId}/edit`),
              1200,
            );
          }
        } else {
          setToast({
            message: result?.message || "Failed to confirm booking.",
            type: "error",
          });
        }
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Booking Service Summary
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            {bookings.length} bookings total
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
                {s.replace("_", " ")} ({counts[s]})
              </option>
            ))}
          </select>
          <Link
            href="/dashboard/bookings/new"
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
            Book Service
          </Link>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(
          (s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(statusFilter === s ? "" : s);
                setPage(1);
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${statusFilter === s ? "border-primary-400 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5" : "border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300"}`}
            >
              <p className="text-xs text-surface-500 capitalize">
                {s.replace("_", " ")}
              </p>
              <p className="text-xl font-bold text-surface-900 dark:text-white mt-0.5">
                {counts[s] || 0}
              </p>
            </button>
          ),
        )}
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
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider w-44">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-surface-400 text-sm"
                  >
                    {search || statusFilter
                      ? "No bookings match."
                      : "No bookings yet."}
                  </td>
                </tr>
              ) : (
                paginated.map((booking, idx) => {
                  const customerName = booking.customer?.name || "Unknown";
                  const customerPhone = booking.customer?.phone || "";
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-surface-500">
                        {(page - 1) * perPage + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {customerName}
                        </p>
                        <p className="text-xs text-surface-400">
                          {customerPhone}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-surface-900 dark:text-white">
                          {booking.product_name}
                        </p>
                        <p className="text-xs text-surface-400">
                          {booking.brand_name}
                          {booking.model_name ? ` · ${booking.model_name}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300 max-w-[200px] truncate">
                        {booking.problem}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(booking.id, e.target.value)
                          }
                          disabled={pending}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[booking.status] || "bg-surface-100 text-surface-600"}`}
                        >
                          {[
                            "pending",
                            "confirmed",
                            "in_progress",
                            "completed",
                            "cancelled",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-400">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {booking.status !== "confirmed" &&
                            booking.status !== "cancelled" && (
                              <button
                                onClick={() =>
                                  handleConfirm(booking.id, customerName)
                                }
                                disabled={pending}
                                className="px-2.5 py-1 rounded-lg border border-success/30 text-xs font-medium text-success hover:bg-success/10 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Confirm
                              </button>
                            )}
                          <button
                            onClick={() =>
                              handleDelete(booking.id, customerName)
                            }
                            disabled={pending}
                            className="px-2.5 py-1 rounded-lg border border-danger/30 text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Confirm / Delete Dialog */}
      <Dialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        title={
          confirmDialog?.action === "delete"
            ? "Delete Booking"
            : "Confirm Booking"
        }
        maxWidth="sm"
      >
        <p className="text-sm text-surface-600 dark:text-surface-300 mb-6">
          {confirmDialog?.action === "delete"
            ? `Are you sure you want to delete the booking for "${confirmDialog?.name}"?`
            : `Confirm booking for "${confirmDialog?.name}" and create a job card?`}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDialog(null)}
            className="px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-700 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={executeDialogAction}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer ${
              confirmDialog?.action === "delete"
                ? "bg-danger hover:bg-danger/80"
                : "bg-primary-600 hover:bg-primary-500"
            }`}
          >
            {confirmDialog?.action === "delete" ? "Delete" : "Confirm"}
          </button>
        </div>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
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
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          ) : (
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
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
          )}
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
