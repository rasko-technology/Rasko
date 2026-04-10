"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog } from "@/app/components/ui/Dialog";
import { forwardJobcard } from "@/app/actions/jobcards";
import { useRouter } from "next/navigation";

interface StoreResult {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  jobcardId: number;
  jobcardCustomerName: string;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

export function ForwardJobCardDialog({
  open,
  onClose,
  jobcardId,
  jobcardCustomerName,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StoreResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search stores with debounce
  const searchStores = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/stores/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || selectedStore) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchStores(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchStores, selectedStore]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedStore(null);
      setManualMode(false);
      setManualName("");
      setManualAddress("");
      setManualPhone("");
      setError(null);
    }
  }, [open]);

  const handleSelectStore = (store: StoreResult) => {
    setSelectedStore(store);
    setQuery(store.name);
    setResults([]);
    setManualMode(false);
    setManualName("");
    setManualAddress("");
    setManualPhone("");
  };

  const handleEnterManually = () => {
    setManualMode(true);
    setSelectedStore(null);
    setQuery("");
    setResults([]);
  };

  const handleBackToSearch = () => {
    setManualMode(false);
    setManualName("");
    setManualAddress("");
    setManualPhone("");
  };

  const handleForward = async () => {
    setError(null);
    const storeName = selectedStore ? selectedStore.name : manualName.trim();
    const storeAddress = selectedStore
      ? [selectedStore.address, selectedStore.city].filter(Boolean).join(", ")
      : manualAddress.trim();
    const storePhone = selectedStore
      ? selectedStore.phone || ""
      : manualPhone.trim();
    const storeId = selectedStore ? selectedStore.id : null;

    if (!storeName) {
      setError("Please select or enter a store name.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await forwardJobcard(
        jobcardId,
        storeId,
        storeName,
        storeAddress,
        storePhone,
      );

      if (result?.success) {
        setToast({ message: result.message || "Forwarded!", type: "success" });
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1200);
      } else {
        setError(result?.message || "Failed to forward job card.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Forward Job Card"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <svg
            className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium">Forwarding Job Card #{jobcardId}</p>
            <p className="mt-0.5 text-amber-600 dark:text-amber-500">
              Customer: {jobcardCustomerName}. This job card&apos;s status will
              be changed to &quot;Forwarded&quot;. If the destination store is
              in our system, a copy will be created for them.
            </p>
          </div>
        </div>

        {!manualMode ? (
          <>
            {/* Store search */}
            <div className="relative">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Search for Store
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Search by store name, city, or phone..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (selectedStore) setSelectedStore(null);
                  }}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search results dropdown */}
              {results.length > 0 && !selectedStore && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  {results.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                      onClick={() => handleSelectStore(store)}
                    >
                      <div className="font-medium text-sm text-surface-900 dark:text-white">
                        {store.name}
                      </div>
                      <div className="text-xs text-surface-500 mt-0.5">
                        {[store.address, store.city, store.phone]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 &&
                !searching &&
                results.length === 0 &&
                !selectedStore && (
                  <p className="text-xs text-surface-400 mt-1">
                    No stores found matching &quot;{query}&quot;
                  </p>
                )}
            </div>

            {/* Selected store preview */}
            {selectedStore && (
              <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-primary-700 dark:text-primary-400">
                      {selectedStore.name}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-500 mt-0.5">
                      {[
                        selectedStore.address,
                        selectedStore.city,
                        selectedStore.phone,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    onClick={() => {
                      setSelectedStore(null);
                      setQuery("");
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Manual entry link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleEnterManually}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Store not found? Enter details manually
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Manual store entry */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  Enter Store Details
                </label>
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                >
                  &larr; Back to search
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter store name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter store address"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Enter phone number"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleForward}
            disabled={
              submitting || (!selectedStore && !manualName.trim()) || !!toast
            }
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Forwarding...
              </span>
            ) : (
              "Forward Job Card"
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
