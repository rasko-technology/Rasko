"use client";

import { useActionState, useCallback, useState } from "react";
import { createStore } from "@/app/actions/store";
import { AddressAutocomplete } from "@/app/components/booking/AddressAutocomplete";

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(createStore, undefined);
  const [addressFields, setAddressFields] = useState({
    address: "",
    city: "",
    pincode: "",
    fullAddress: "",
    lat: "",
    lng: "",
  });

  const handleAddressSelect = useCallback(
    (result: {
      address: string;
      city: string;
      pincode: string;
      fullAddress: string;
      lat: number;
      lng: number;
    }) => {
      setAddressFields({
        address: result.address,
        city: result.city,
        pincode: result.pincode,
        fullAddress: result.fullAddress,
        lat: String(result.lat),
        lng: String(result.lng),
      });
    },
    [],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-surface-950 to-primary-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-400/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/30 mb-4">
            <svg
              className="w-8 h-8 text-primary-400"
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
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Set Up Your Store
          </h1>
          <p className="text-surface-400 mt-2">
            Tell us about your business to get started
          </p>
        </div>

        <div className="bg-surface-900/80 backdrop-blur-xl border border-surface-700/50 rounded-2xl p-8 shadow-2xl">
          {state?.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${state.success ? "bg-success/10 border border-success/20 text-success" : "bg-danger/10 border border-danger/20 text-danger"}`}
            >
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-surface-300 mb-1.5"
              >
                Store Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                placeholder="My Service Business"
              />
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-danger">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="+91..."
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="store@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Address
              </label>
              <AddressAutocomplete
                onSelect={handleAddressSelect}
                placeholder="Search for your store address..."
              />
              <input
                type="hidden"
                name="address"
                value={addressFields.address}
              />
              <input
                type="hidden"
                name="full_address"
                value={addressFields.fullAddress}
              />
              <input
                type="hidden"
                name="address_lat"
                value={addressFields.lat}
              />
              <input
                type="hidden"
                name="address_lng"
                value={addressFields.lng}
              />
            </div>

            {addressFields.fullAddress && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/50 border border-surface-600/50">
                <svg
                  className="w-4 h-4 text-primary-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span className="text-sm text-surface-300 truncate">
                  {addressFields.fullAddress}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={addressFields.city}
                  onChange={(e) =>
                    setAddressFields((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-surface-300 mb-1.5"
                >
                  Pincode
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={addressFields.pincode}
                  onChange={(e) =>
                    setAddressFields((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                  placeholder="110001"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-surface-300 mb-1.5"
              >
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                className="w-full px-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 mt-2 cursor-pointer"
            >
              {pending ? "Creating store..." : "Create Store & Continue →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
