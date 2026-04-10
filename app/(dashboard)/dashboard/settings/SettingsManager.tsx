"use client";

import { useState, useActionState, useRef, useCallback } from "react";
import { updateStore, updateOwnerProfile } from "@/app/actions/settings";
import { Camera, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LocationPicker } from "@/app/components/booking/LocationPicker";

const RichTextEditor = dynamic(
  () =>
    import("@/app/components/ui/RichTextEditor").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] rounded-lg bg-surface-50 dark:bg-surface-800 animate-pulse" />
    ),
  },
);

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
  tagline: string | null;
  gstin: string | null;
  pan: string | null;
  inspection_charges: number | null;
  bank_name: string | null;
  bank_ifsc_code: string | null;
  bank_branch_name: string | null;
  bank_account_holder_name: string | null;
  bank_account_number: string | null;
  bank_upi_id: string | null;
  general_terms: string | null;
  address_lat: number | null;
  address_lng: number | null;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

type SettingsTab = "store" | "bank_details" | "general_terms" | "account";

export function SettingsManager({
  store,
  ownerEmail,
}: {
  store: Store | null;
  ownerEmail: string;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [showPassword, setShowPassword] = useState(false);
  const [storeState, storeAction, storePending] = useActionState(
    updateStore,
    undefined,
  );
  const [profileState, profileAction, profilePending] = useActionState(
    updateOwnerProfile,
    undefined,
  );

  // Logo upload
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    store?.logo_url || null,
  );
  const [logoUrl, setLogoUrl] = useState<string>(store?.logo_url || "");
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to S3
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", "logos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.images?.[0]?.url) {
        setLogoUrl(data.images[0].url);
      }
    } catch {
      // keep preview but URL won't be set
    } finally {
      setLogoUploading(false);
    }
  };

  // Location picker
  const [showMap, setShowMap] = useState(false);
  const [addressLat, setAddressLat] = useState<number | null>(
    store?.address_lat ?? null,
  );
  const [addressLng, setAddressLng] = useState<number | null>(
    store?.address_lng ?? null,
  );
  const [fullAddress, setFullAddress] = useState(store?.full_address || "");

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
      // Fill in the form fields
      const form = document.getElementById(
        "store-details-form",
      ) as HTMLFormElement | null;
      if (!form) return;

      const setVal = (name: string, val: string) => {
        const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input) {
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
          )?.set?.call(input, val);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      };
      if (location.street) setVal("address", location.street);
      if (location.town) setVal("city", location.town);
      if (location.pincode) setVal("pincode", location.pincode);
    },
    [],
  );

  // General terms (Quill HTML)
  const [generalTermsHtml, setGeneralTermsHtml] = useState(
    store?.general_terms || "",
  );

  const tabs = [
    { id: "store" as const, label: "Store Details" },
    { id: "bank_details" as const, label: "Bank Details" },
    { id: "general_terms" as const, label: "General Terms" },
    { id: "account" as const, label: "Account" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
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

          <form
            id="store-details-form"
            action={storeAction}
            className="space-y-4"
          >
            <input type="hidden" name="_section" value="store" />
            <input type="hidden" name="logo_url" value={logoUrl} />
            <input type="hidden" name="full_address" value={fullAddress} />
            <input type="hidden" name="address_lat" value={addressLat ?? ""} />
            <input type="hidden" name="address_lng" value={addressLng ?? ""} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Store Name *
                </label>
                <input
                  name="name"
                  defaultValue={store?.name || ""}
                  required
                  className={inputClass}
                />
                {storeState?.errors?.name && (
                  <p className="text-xs text-danger mt-1">
                    {storeState.errors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Tagline
                </label>
                <input
                  name="tagline"
                  defaultValue={store?.tagline || ""}
                  placeholder="e.g. Desktop | Laptop | Printers"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Store Logo
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-lg flex justify-start cursor-pointer overflow-hidden"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-20 w-auto max-w-fit max-h-full object-contain rounded-md"
                        width={80}
                        height={80}
                        unoptimized={logoPreview.startsWith("data:")}
                      />
                    ) : (
                      <label className="h-10 bg-surface-50 dark:bg-surface-800 text-surface-400 text-sm w-full px-4 py-2.5 border-2 border-dashed rounded-lg cursor-pointer flex items-center justify-start gap-2">
                        <Camera size={16} />
                        Upload Image
                      </label>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={logoInputRef}
                      onChange={handleLogoChange}
                    />
                  </div>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoUrl("");
                        if (logoInputRef.current) {
                          logoInputRef.current.value = "";
                        }
                      }}
                      className="px-3 py-2.5 rounded-lg bg-danger/10 text-danger text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  {logoUploading && (
                    <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Phone
                </label>
                <input
                  name="phone"
                  defaultValue={store?.phone || ""}
                  placeholder="+91..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={store?.email || ""}
                  placeholder="store@example.com"
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Address
                </label>
                <input
                  name="address"
                  defaultValue={store?.address || ""}
                  placeholder="Street address"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  City
                </label>
                <input
                  name="city"
                  defaultValue={store?.city || ""}
                  placeholder="City"
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>
            </div>

            {/* Full Address (read-only, set by LocationPicker) */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">
                Full Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fullAddress}
                  readOnly
                  className={`${inputClass} flex-1 bg-surface-100 dark:bg-surface-800/50 cursor-not-allowed`}
                  placeholder="Use location picker to set full address"
                />
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {showMap ? "Hide Map" : "Pick Location"}
                </button>
              </div>
            </div>

            {showMap && (
              <div className="animate-fade-in">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialCenter={
                    addressLat && addressLng
                      ? { lat: addressLat, lng: addressLng }
                      : undefined
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Inspection Charges
                </label>
                <input
                  name="inspection_charges"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={store?.inspection_charges ?? ""}
                  placeholder="300"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  GSTIN
                </label>
                <input
                  name="gstin"
                  defaultValue={store?.gstin || ""}
                  placeholder="GST2332534"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  PAN
                </label>
                <input
                  name="pan"
                  defaultValue={store?.pan || ""}
                  placeholder="XXXXX0000X"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={storePending || logoUploading}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {storePending ? "Saving..." : "Save Store Details"}
            </button>
          </form>
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === "bank_details" && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
            Bank Information
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            {`Update your store's bank details for payments and invoices`}
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
            <input type="hidden" name="_section" value="bank" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Bank Name
                </label>
                <input
                  name="bank_name"
                  defaultValue={store?.bank_name || ""}
                  placeholder="e.g., State Bank of India"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  IFSC Code
                </label>
                <input
                  name="bank_ifsc_code"
                  defaultValue={store?.bank_ifsc_code || ""}
                  placeholder="e.g., SBIN0000123"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Branch Name
                </label>
                <input
                  name="bank_branch_name"
                  defaultValue={store?.bank_branch_name || ""}
                  placeholder="Branch name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Account Holder Name
                </label>
                <input
                  name="bank_account_holder_name"
                  defaultValue={store?.bank_account_holder_name || ""}
                  placeholder="Account holder's name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Account Number
                </label>
                <input
                  name="bank_account_number"
                  defaultValue={store?.bank_account_number || ""}
                  placeholder="Account number"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  UPI ID
                </label>
                <input
                  name="bank_upi_id"
                  defaultValue={store?.bank_upi_id || ""}
                  placeholder="e.g., yourname@upi"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={storePending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {storePending ? "Saving..." : "Save Bank Details"}
            </button>
          </form>
        </div>
      )}

      {/* General Terms Tab */}
      {activeTab === "general_terms" && (
        <div className="animate-fade-in">
          <form action={storeAction} className="space-y-6">
            <input type="hidden" name="_section" value="terms" />
            <input
              type="hidden"
              name="general_terms"
              value={generalTermsHtml}
            />

            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-1">
                General Terms &amp; Conditions
              </h3>
              <p className="text-sm text-surface-500 mb-4">
                These terms will be used as default for all document types
                unless overridden in individual templates.
              </p>
              <RichTextEditor
                defaultValue={store?.general_terms || ""}
                onChange={setGeneralTermsHtml}
                placeholder="Enter your general terms and conditions..."
              />
            </div>

            {storeState?.message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  storeState.success
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                }`}
              >
                {storeState.message}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={storePending}
                className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 cursor-pointer"
              >
                {storePending ? "Saving..." : "Save Settings"}
              </button>
            </div>
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
                className={inputClass}
              />
              {profileState?.errors?.email && (
                <p className="text-xs text-danger mt-1">
                  {profileState.errors.email[0]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
              <div className="">
                <label className="block text-xs font-medium text-surface-500 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    name="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
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
