"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StoreOption {
  id: number;
  name: string;
}

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step management: store selection first, then credentials
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [storeSearch, setStoreSearch] = useState("");

  // Fetch stores on mount
  useEffect(() => {
    fetch("/api/auth/employee-login/stores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStores(data);
      })
      .catch(() => setError("Failed to load stores."))
      .finally(() => setStoresLoading(false));
  }, []);

  function handleStoreSelect(store: StoreOption) {
    setSelectedStore(store);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedStore) return;
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/employee-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          store_id: selectedStore.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(storeSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-950 via-primary-950 to-surface-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-primary-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 mb-4">
            <svg
              className="w-6 h-6 text-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Employee Login
          </h1>
          <p className="text-surface-400 mt-2 text-sm">
            {selectedStore
              ? `Signing in to ${selectedStore.name}`
              : "Select your store to continue"}
          </p>
        </div>

        <div className="bg-surface-900/80 backdrop-blur-xl border border-surface-700/50 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {!selectedStore ? (
            /* Step 1: Store selection */
            <div className="space-y-3">
              <p className="text-sm text-surface-300 mb-4">
                Choose the store you work at:
              </p>

              {stores.length > 3 && (
                <div className="relative mb-3">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
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
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Search stores..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  />
                </div>
              )}

              {storesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg
                    className="animate-spin h-6 w-6 text-primary-400"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
              ) : filteredStores.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-4">
                  {storeSearch
                    ? "No stores match your search"
                    : "No stores available"}
                </p>
              ) : (
                <div className="max-h-[40vh] overflow-y-auto no-scrollbar flex flex-col gap-3">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => handleStoreSelect(store)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-800/50 border border-surface-600/50 hover:border-primary-500/50 hover:bg-surface-800 transition-all text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-primary-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {store.name}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-surface-500 ml-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Credentials */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected store badge */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-primary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-primary-300 flex-1">
                  {selectedStore.name}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStore(null);
                    setError("");
                  }}
                  className="text-xs text-surface-400 hover:text-white transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Username, Email, or Phone
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="Enter username, email, or phone"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
