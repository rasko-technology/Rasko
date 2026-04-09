"use client";

import { useState, useCallback, useActionState } from "react";
import { createBooking } from "@/app/actions/bookings";
import { ProductSearchInput } from "@/app/components/booking/ProductSearchInput";
import { BrandSelect } from "@/app/components/booking/BrandSelect";
import { IssueSelector } from "@/app/components/booking/IssueSelector";
import { CustomerSearch } from "@/app/components/booking/CustomerSearch";
import { LocationPicker } from "@/app/components/booking/LocationPicker";

interface ProductResult {
  productName: string;
  brandNames: string[];
  issues: string[];
  category: string;
}

interface SelectedCustomer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
  gst_number: string | null;
  notes: string | null;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

export function BookingForm() {
  const [state, action, pending] = useActionState(createBooking, undefined);

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(
    null,
  );

  // Customer state
  const [selectedCustomer, setSelectedCustomer] =
    useState<SelectedCustomer | null>(null);
  const [customerMode, setCustomerMode] = useState<
    "search" | "selected" | "new"
  >("search");

  // Location state
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLng, setAddressLng] = useState<number | null>(null);
  const [fullAddress, setFullAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = useCallback(
    (location: {
      street: string;
      landmark: string;
      town: string;
      pincode: string;
      fullAddress: string;
      lat: number;
      lng: number;
    }) => {
      setAddressLat(location.lat);
      setAddressLng(location.lng);
      setFullAddress(location.fullAddress);
      // Auto-fill address fields via DOM
      const setNativeValue = (input: HTMLInputElement, value: string) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      const addressInput = document.querySelector<HTMLInputElement>(
        'input[name="address"]',
      );
      const landmarkInput = document.querySelector<HTMLInputElement>(
        'input[name="landmark"]',
      );
      const cityInput =
        document.querySelector<HTMLInputElement>('input[name="city"]');
      const pincodeInput = document.querySelector<HTMLInputElement>(
        'input[name="pincode"]',
      );
      if (addressInput && location.street)
        setNativeValue(addressInput, location.street);
      if (landmarkInput && location.landmark)
        setNativeValue(landmarkInput, location.landmark);
      if (cityInput && location.town) setNativeValue(cityInput, location.town);
      if (pincodeInput && location.pincode)
        setNativeValue(pincodeInput, location.pincode);
    },
    [],
  );

  const handleProductSelect = useCallback((product: ProductResult) => {
    setSelectedProduct(product);
  }, []);

  const handleCustomerSelect = useCallback((customer: SelectedCustomer) => {
    setSelectedCustomer(customer);
    setCustomerMode("selected");
  }, []);

  const handleNewCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerMode("new");
  }, []);

  const handleChangeCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerMode("search");
  }, []);

  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${state.success ? "bg-success/10 border border-success/20 text-success" : "bg-danger/10 border border-danger/20 text-danger"}`}
        >
          {state.message}
        </div>
      )}

      {/* Product Details */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
            🔧
          </span>
          Product Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Product Name *
            </label>
            <ProductSearchInput onProductSelect={handleProductSelect} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Brand Name *
            </label>
            <BrandSelect brands={selectedProduct?.brandNames || []} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Model Name <span className="text-surface-400">(Optional)</span>
            </label>
            <input name="model_name" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Select Problem *
            </label>
            <IssueSelector issues={selectedProduct?.issues || []} />
          </div>
        </div>

        {selectedProduct && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/10">
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                <strong>{selectedProduct.productName}</strong> from{" "}
                <span className="text-emerald-600 dark:text-emerald-500">
                  {selectedProduct.category}
                </span>
                {" — "}
                {selectedProduct.brandNames.length} brands,{" "}
                {selectedProduct.issues.length} known issues
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
            👤
          </span>
          Customer Details
        </h2>

        {/* Customer Search */}
        {customerMode === "search" && (
          <div className="w-full">
            <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
              Search Existing Customer
            </label>
            <div className="w-full flex items-center gap-3">
              <div className="flex-1">
                <CustomerSearch
                  onCustomerSelect={handleCustomerSelect}
                  onNewCustomer={handleNewCustomer}
                />
              </div>
              <button
                type="button"
                onClick={handleNewCustomer}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-600/20 cursor-pointer"
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
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
                New Customer
              </button>
            </div>
            <p className="text-xs text-surface-400 mt-2">
              Search by name, phone, or email.
            </p>
          </div>
        )}

        {/* Selected Existing Customer */}
        {customerMode === "selected" && selectedCustomer && (
          <div>
            <input
              type="hidden"
              name="customer_id"
              value={selectedCustomer.id}
            />
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200/50 dark:border-primary-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {selectedCustomer.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    {selectedCustomer.phone && (
                      <span>{selectedCustomer.phone}</span>
                    )}
                    {selectedCustomer.email && (
                      <>
                        <span>·</span>
                        <span>{selectedCustomer.email}</span>
                      </>
                    )}
                  </div>
                  {(selectedCustomer.address || selectedCustomer.city) && (
                    <p className="text-xs text-surface-400 mt-0.5">
                      {[
                        selectedCustomer.address,
                        selectedCustomer.landmark,
                        selectedCustomer.city,
                        selectedCustomer.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangeCustomer}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* New Customer Form (matching the image format) */}
        {customerMode === "new" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
                New Customer
              </h3>
              <button
                type="button"
                onClick={handleChangeCustomer}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                ← Search existing
              </button>
            </div>

            {/* Row 1: Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Name *
                </label>
                <input
                  name="customer_name"
                  required
                  placeholder="Customer name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Phone *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="customer@example.com"
                className={inputClass}
              />
            </div>

            {/* Row 3: Address + Landmark + City + Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Address
                </label>
                <input
                  name="address"
                  placeholder="Street address"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Landmark
                </label>
                <input
                  name="landmark"
                  placeholder="Near..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  City
                </label>
                <input name="city" placeholder="City" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Pincode
                </label>
                <input
                  name="pincode"
                  placeholder="Pincode"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 4: GST + Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  GST Number
                </label>
                <input
                  name="gst_number"
                  placeholder="GSTIN (optional)"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Notes
                </label>
                <input
                  name="customer_notes"
                  placeholder="Any remarks"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Google Maps Location Picker */}
            <div>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
                {showMap ? "Hide Map" : "📍 Pick location on Google Maps"}
              </button>
              {showMap && (
                <div className="mt-3">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>
              )}
            </div>

            {addressLat && addressLng && (
              <input type="hidden" name="address_lat" value={addressLat} />
            )}
            {addressLat && addressLng && (
              <input type="hidden" name="address_lng" value={addressLng} />
            )}
            {fullAddress && (
              <input type="hidden" name="full_address" value={fullAddress} />
            )}

            <div className="pt-2">
              <span className="text-xs text-surface-400">
                Customer will be saved to your customer database
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation + Submit */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <input
            type="checkbox"
            required
            className="mt-0.5 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Please confirm that the information you entered is correct. For
            doorstep service, an inspection fee may apply based on the issue,
            covering our visit and evaluation.
          </span>
        </label>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={pending || customerMode === "search"}
            className="px-10 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Submitting..." : "Submit Your Request"}
          </button>
        </div>
      </div>
    </form>
  );
}
