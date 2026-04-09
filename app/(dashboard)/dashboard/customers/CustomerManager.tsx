"use client";

import { useState, useCallback, useActionState } from "react";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/actions/customers";
import { LocationPicker } from "@/app/components/booking/LocationPicker";
import { ConfirmDialog, AlertDialog } from "@/app/components/ui/Dialog";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
  address_lat: number | null;
  address_lng: number | null;

  gst_number: string | null;
  notes: string | null;
  created_at: string;
}

export function CustomerManager({ customers }: { customers: Customer[] }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [state, action, pending] = useActionState(createCustomer, undefined);
  const [showMap, setShowMap] = useState(false);
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLng, setAddressLng] = useState<number | null>(null);
  const [fullAddress, setFullAddress] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editPending, setEditPending] = useState(false);
  const [editMsg, setEditMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  // Confirm & alert dialogs
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariant, setAlertVariant] = useState<"success" | "error">(
    "success",
  );

  const handleDeleteClick = useCallback(
    (customer: { id: number; name: string }) => {
      setConfirmTarget(customer);
      setConfirmOpen(true);
    },
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    setDeleteLoading(true);
    const result = await deleteCustomer(confirmTarget.id);
    setDeleteLoading(false);
    setConfirmOpen(false);
    setConfirmTarget(null);
    if (result?.success) {
      setAlertVariant("success");
      setAlertMsg(result.message || "Customer deleted.");
    } else {
      setAlertVariant("error");
      setAlertMsg(result?.message || "Failed to delete customer.");
    }
    setAlertOpen(true);
  }, [confirmTarget]);

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
      const setNativeValue = (input: HTMLInputElement, value: string) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      const addressInput = document.querySelector<HTMLInputElement>(
        'form input[name="address"]',
      );
      const landmarkInput = document.querySelector<HTMLInputElement>(
        'form input[name="landmark"]',
      );
      const cityInput = document.querySelector<HTMLInputElement>(
        'form input[name="city"]',
      );
      const pincodeInput = document.querySelector<HTMLInputElement>(
        'form input[name="pincode"]',
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

  const startEdit = useCallback((customer: Customer) => {
    setEditingId(customer.id);
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      landmark: customer.landmark || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      gst_number: customer.gst_number || "",
      notes: customer.notes || "",
    });
    setEditMsg(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingId) return;
      setEditPending(true);
      setEditMsg(null);

      const formData = new FormData(e.currentTarget);
      const result = await updateCustomer(editingId, undefined, formData);
      setEditPending(false);

      if (result?.success) {
        setEditMsg({ text: result.message || "Updated.", ok: true });
        setEditingId(null);
      } else {
        setEditMsg({ text: result?.message || "Failed to update.", ok: false });
      }
    },
    [editingId],
  );

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          onClick={() => setShowForm(!showForm)}
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Customer
        </button>

        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-sm">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        <span className="text-xs text-surface-400 ml-auto">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 animate-slide-up shadow-sm">
          <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-4 uppercase tracking-wider">
            New Customer
          </h3>
          {state?.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${state.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
            >
              {state.message}
            </div>
          )}
          <form action={action} className="space-y-4">
            {/* Row 1: Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="Customer name"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91..."
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
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
                className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
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
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Landmark
                </label>
                <input
                  name="landmark"
                  placeholder="Near..."
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  City
                </label>
                <input
                  name="city"
                  placeholder="City"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Pincode
                </label>
                <input
                  name="pincode"
                  placeholder="Pincode"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
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
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">
                  Notes
                </label>
                <input
                  name="notes"
                  placeholder="Any remarks"
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Creating..." : "Create Customer"}
            </button>

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
                {showMap
                  ? "Hide Map"
                  : "\ud83d\udccd Pick location on Google Maps"}
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
          </form>
        </div>
      )}

      {/* Customer List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <svg
            className="mx-auto w-14 h-14 text-surface-300 dark:text-surface-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={0.8}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <p className="text-surface-500 text-sm font-medium">
            {search ? "No customers match your search" : "No customers yet"}
          </p>
          <p className="text-surface-400 text-xs mt-1">
            {search
              ? "Try a different search term"
              : "Add your first customer to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => {
            const isExpanded = expandedId === customer.id;
            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {customer.phone && (
                          <span className="text-xs text-surface-500 flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                              />
                            </svg>
                            {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span className="text-xs text-surface-500 truncate max-w-50">
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {customer.city && (
                      <span className="hidden sm:inline text-xs text-surface-400">
                        {customer.city}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (editingId === customer.id) {
                          setEditingId(null);
                        } else {
                          startEdit(customer);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-surface-400 hover:text-primary-600 transition-colors cursor-pointer"
                      title="Edit customer"
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
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick({
                          id: customer.id,
                          name: customer.name,
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors cursor-pointer"
                      title="Delete customer"
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
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                    <svg
                      className={`w-4 h-4 text-surface-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>

                {/* Edit form */}
                {editingId === customer.id && (
                  <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-800 pt-4 animate-slide-up">
                    {editMsg && (
                      <div
                        className={`mb-3 p-3 rounded-lg text-sm ${editMsg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                      >
                        {editMsg.text}
                      </div>
                    )}
                    <form onSubmit={handleEditSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Name *
                          </label>
                          <input
                            name="name"
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Phone
                          </label>
                          <input
                            name="phone"
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Address
                          </label>
                          <input
                            name="address"
                            value={editForm.address || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                address: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Landmark
                          </label>
                          <input
                            name="landmark"
                            value={editForm.landmark || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                landmark: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            City
                          </label>
                          <input
                            name="city"
                            value={editForm.city || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, city: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Pincode
                          </label>
                          <input
                            name="pincode"
                            value={editForm.pincode || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                pincode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            GST Number
                          </label>
                          <input
                            name="gst_number"
                            value={editForm.gst_number || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                gst_number: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-500 mb-1">
                            Notes
                          </label>
                          <input
                            name="notes"
                            value={editForm.notes || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                notes: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={editPending}
                          className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {editPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-5 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-800 pt-4 animate-slide-up">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <DetailItem label="Phone" value={customer.phone} />
                      <DetailItem label="Email" value={customer.email} />

                      <DetailItem label="Address" value={customer.address} />
                      <DetailItem label="Landmark" value={customer.landmark} />
                      <DetailItem label="City" value={customer.city} />
                      <DetailItem label="Pincode" value={customer.pincode} />
                      <DetailItem
                        label="GST Number"
                        value={customer.gst_number}
                      />
                      <DetailItem
                        label="Added on"
                        value={new Date(customer.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      />
                      {customer.notes && (
                        <div className="sm:col-span-3">
                          <DetailItem label="Notes" value={customer.notes} />
                        </div>
                      )}
                      {customer.address_lat && customer.address_lng && (
                        <div className="sm:col-span-3">
                          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">
                            Location
                          </p>
                          <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                            <iframe
                              title={`${customer.name} location`}
                              width="100%"
                              height="200"
                              style={{ border: 0 }}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${customer.address_lat},${customer.address_lng}&zoom=15`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={
          confirmTarget
            ? `Are you sure you want to delete "${confirmTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertVariant === "success" ? "Success" : "Error"}
        message={alertMsg}
        variant={alertVariant}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm text-surface-900 dark:text-white mt-0.5">
        {value || "—"}
      </p>
    </div>
  );
}
