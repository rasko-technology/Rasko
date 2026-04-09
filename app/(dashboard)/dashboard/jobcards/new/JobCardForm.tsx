"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useActionState,
} from "react";
import { createJobcard } from "@/app/actions/jobcards";
import { createCustomer } from "@/app/actions/customers";
import { createServiceOption } from "@/app/actions/service-options";
import { useRouter } from "next/navigation";
import { MultiSelectOptions } from "@/app/components/jobcard/MultiSelectOptions";
import { ImageUploader } from "@/app/components/jobcard/ImageUploader";
import { ProductSearchInput } from "@/app/components/booking/ProductSearchInput";
import { BrandSelect } from "@/app/components/booking/BrandSelect";
import { Dialog } from "@/app/components/ui/Dialog";
import { LocationPicker } from "@/app/components/booking/LocationPicker";

interface ServiceOption {
  id: number;
  option_type: string;
  name: string;
  service_item_id: number | null;
}

interface CustomerResult {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

interface Props {
  employees: { id: number; name: string }[];
  serviceOptions: ServiceOption[];
}

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

export function JobCardForm({ employees, serviceOptions }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createJobcard, undefined);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [carrierSame, setCarrierSame] = useState(true);
  const [paymentType, setPaymentType] = useState("chargeable");
  const [incomingSource, setIncomingSource] = useState("carry_in");

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerResult[]>([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResult | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const customerWrapperRef = useRef<HTMLDivElement>(null);
  const customerDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // New customer form (dialog)
  const [custFormState, custFormAction, custFormPending] = useActionState(
    createCustomer,
    undefined,
  );
  const [showCustMap, setShowCustMap] = useState(false);
  const [custAddressLat, setCustAddressLat] = useState<number | null>(null);
  const [custAddressLng, setCustAddressLng] = useState<number | null>(null);
  const [custFullAddress, setCustFullAddress] = useState("");

  // Product / Brand
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [selectedServiceItemId, setSelectedServiceItemId] = useState<
    number | null
  >(null);

  // Multi-select state
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    [],
  );

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Custom option dialog
  const [customOptionDialog, setCustomOptionDialog] = useState<{
    optionType: string;
    name: string;
    label: string;
  } | null>(null);
  const [customOptionSaving, setCustomOptionSaving] = useState(false);
  const [localOptions, setLocalOptions] = useState<ServiceOption[]>([]);

  const allOptions = [...serviceOptions, ...localOptions];

  // Filter service options by type and selected product
  const filterByProduct = (opts: ServiceOption[]) =>
    opts.filter(
      (o) =>
        o.service_item_id === null ||
        o.service_item_id === selectedServiceItemId,
    );
  const accessoryOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "items_received"),
  );
  const issueOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "default_issue"),
  );
  const requirementOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "additional_requirement"),
  );

  const OPTION_TYPE_MAP: Record<
    string,
    { setter: (fn: (prev: string[]) => string[]) => void; label: string }
  > = {
    items_received: {
      setter: (fn) => setSelectedAccessories(fn),
      label: "Accessory",
    },
    default_issue: { setter: (fn) => setSelectedIssues(fn), label: "Issue" },
    additional_requirement: {
      setter: (fn) => setSelectedRequirements(fn),
      label: "Requirement",
    },
  };

  const handleCreateCustomOption = useCallback(
    async (name: string) => {
      if (!customOptionDialog) return;
      setCustomOptionSaving(true);
      const result = await createServiceOption(
        customOptionDialog.optionType,
        name,
        selectedServiceItemId,
      );
      setCustomOptionSaving(false);
      if (result.success) {
        const newOpt: ServiceOption = {
          id: Date.now(),
          option_type: customOptionDialog.optionType,
          name,
          service_item_id: selectedServiceItemId,
        };
        setLocalOptions((prev) => [...prev, newOpt]);
        OPTION_TYPE_MAP[customOptionDialog.optionType]?.setter((prev) => [
          ...prev,
          name,
        ]);
        setCustomOptionDialog(null);
      } else {
        setToast({
          message: result.message || "Failed to create option.",
          type: "error",
        });
      }
    },
    [customOptionDialog, selectedServiceItemId],
  );

  // Customer search logic
  // Redirect on successful creation
  useEffect(() => {
    if (state?.success) {
      setToast({
        message: state.message || "Job card created!",
        type: "success",
      });
      const timer = setTimeout(() => router.push("/dashboard/jobcards"), 1500);
      return () => clearTimeout(timer);
    } else if (state?.message && !state?.success) {
      setToast({ message: state.message, type: "error" });
    }
  }, [state, router]);

  const fetchCustomers = useCallback(async (search: string) => {
    setCustomerLoading(true);
    try {
      const res = await fetch(
        `/api/customers?search=${encodeURIComponent(search)}`,
      );
      const data = await res.json();
      setCustomerResults(Array.isArray(data) ? data : []);
      setCustomerOpen(true);
    } catch {
      setCustomerResults([]);
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customerDebounceRef.current) clearTimeout(customerDebounceRef.current);
    if (customerQuery.length >= 2) {
      customerDebounceRef.current = setTimeout(
        () => fetchCustomers(customerQuery),
        300,
      );
    } else {
      setCustomerResults([]);
      setCustomerOpen(false);
    }
    return () => {
      if (customerDebounceRef.current)
        clearTimeout(customerDebounceRef.current);
    };
  }, [customerQuery, fetchCustomers]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        customerWrapperRef.current &&
        !customerWrapperRef.current.contains(e.target as Node)
      ) {
        setCustomerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCustomerSelect = useCallback((customer: CustomerResult) => {
    setSelectedCustomer(customer);
    setCustomerQuery("");
    setCustomerOpen(false);
  }, []);

  // Auto-select customer after dialog creation succeeds
  useEffect(() => {
    if (custFormState?.success && custFormState.data) {
      const d = custFormState.data;
      setSelectedCustomer({
        id: d.id as number,
        name: d.name as string,
        phone: (d.phone as string) || null,
        address: (d.address as string) || null,
      });
      setShowCustomerDialog(false);
      setShowCustMap(false);
      setCustAddressLat(null);
      setCustAddressLng(null);
      setCustFullAddress("");
    }
  }, [custFormState]);

  const handleCustLocationSelect = useCallback(
    (location: {
      street: string;
      landmark: string;
      town: string;
      pincode: string;
      fullAddress: string;
      lat: number;
      lng: number;
    }) => {
      setCustAddressLat(location.lat);
      setCustAddressLng(location.lng);
      setCustFullAddress(location.fullAddress);
      const setNativeValue = (input: HTMLInputElement, value: string) => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      };
      const form = document.getElementById("new-customer-dialog-form");
      if (!form) return;
      const addressInput = form.querySelector<HTMLInputElement>(
        'input[name="address"]',
      );
      const landmarkInput = form.querySelector<HTMLInputElement>(
        'input[name="landmark"]',
      );
      const cityInput =
        form.querySelector<HTMLInputElement>('input[name="city"]');
      const pincodeInput = form.querySelector<HTMLInputElement>(
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

  const showPurchaseDate = paymentType === "warranty" || paymentType === "amc";
  const showCourierFields = incomingSource === "courier";

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium ${
              toast.type === "success"
                ? "bg-success/10 border-success/20 text-success"
                : "bg-danger/10 border-danger/20 text-danger"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 shrink-0"
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
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 cursor-pointer opacity-60 hover:opacity-100"
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <form action={action} className="space-y-6">
        {/* Hidden fields for multi-select and images */}
        {selectedCustomer && (
          <>
            <input
              type="hidden"
              name="customer_id"
              value={selectedCustomer.id}
            />
            <input
              type="hidden"
              name="phone"
              value={selectedCustomer.phone || ""}
            />
            <input
              type="hidden"
              name="address"
              value={selectedCustomer.address || ""}
            />
          </>
        )}
        {selectedAccessories.map((item) => (
          <input
            key={`acc-${item}`}
            type="hidden"
            name="accessories_received"
            value={item}
          />
        ))}
        {selectedIssues.map((item) => (
          <input
            key={`iss-${item}`}
            type="hidden"
            name="default_issues"
            value={item}
          />
        ))}
        {selectedRequirements.map((item) => (
          <input
            key={`req-${item}`}
            type="hidden"
            name="additional_requirements"
            value={item}
          />
        ))}
        {imageUrls.map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}

        {/* ===== Customer Details ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
              👤
            </span>
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mobile Number with search */}
            <div ref={customerWrapperRef} className="relative">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Mobile Number *
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/20">
                  <div className="min-w-0">
                    {/* <p className="text-xs font-normal text-surface-900 dark:text-white truncate">
                      {selectedCustomer.name}
                    </p> */}
                    <p className="text-sm font-medium text-surface-500">
                      {selectedCustomer.phone || "No phone"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerQuery("");
                    }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer ml-2 shrink-0"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      name={!selectedCustomer ? "phone" : undefined}
                      type="text"
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      onFocus={() => {
                        if (customerQuery.length >= 2)
                          fetchCustomers(customerQuery);
                      }}
                      autoComplete="off"
                      className={inputClass}
                      placeholder="Search by name or phone..."
                    />
                    {customerLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {customerOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-slide-up">
                      {customerResults.length > 0 ? (
                        customerResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleCustomerSelect(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
                          >
                            <p className="text-sm font-medium text-surface-900 dark:text-white">
                              {c.name}
                            </p>
                            <p className="text-xs text-surface-400">
                              {c.phone || "No phone"}
                              {c.address ? ` · ${c.address}` : ""}
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center">
                          <p className="text-sm text-surface-400 mb-2">
                            No customers found
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomerDialog(true);
                              setCustomerOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
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
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                            Add New Customer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Customer Name *
              </label>
              <input
                name="customer_name"
                type="text"
                required
                defaultValue={selectedCustomer?.name || ""}
                key={selectedCustomer?.id || "new"}
                readOnly={!!selectedCustomer}
                className={`${inputClass} ${selectedCustomer ? "bg-surface-100 dark:bg-surface-800/50 cursor-not-allowed" : ""}`}
                placeholder="Full name"
              />
            </div>

            {/* booking date & time  */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Booking Date &amp; Time
              </label>
              <input
                name="booking_date_time"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Booking Date & Time + Carrier toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={carrierSame}
                  onChange={(e) => setCarrierSame(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Carrier same as customer
                </span>
              </label>
            </div>
          </div>

          {/* Carrier details */}
          {!carrierSame && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Carrier&apos;s Mobile Number
                </label>
                <input name="carrier_phone" type="tel" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Carrier&apos;s Person Name
                </label>
                <input name="carrier_name" type="text" className={inputClass} />
              </div>
            </div>
          )}

          {/* Inspection Charges, Estimation Amount, Advance Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Inspection Charges
              </label>
              <input
                name="inspection_charges"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="₹0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Estimation Amount
              </label>
              <input
                name="estimation_amount"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="₹0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Advance Amount
              </label>
              <input
                name="advance_amount"
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="₹0.00"
              />
            </div>
          </div>

          {/* Payment Type, Incoming Source, Priority, Assigned To */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Payment Type *
              </label>
              <select
                name="payment_type"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className={inputClass}
              >
                <option value="warranty">Warranty</option>
                <option value="chargeable">Chargeable</option>
                <option value="amc">AMC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Incoming Source *
              </label>
              <select
                name="incoming_source"
                value={incomingSource}
                onChange={(e) => setIncomingSource(e.target.value)}
                className={inputClass}
              >
                <option value="carry_in">Carry in</option>
                <option value="onsite">Onsite</option>
                <option value="courier">Courier</option>
                <option value="remote">Remote</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                defaultValue="medium"
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Assigned To
              </label>
              <select name="assigned_to" className={inputClass}>
                <option value="">Not assigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Date — shown for Warranty / AMC */}
          {showPurchaseDate && (
            <div className="mt-4 animate-slide-up">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Purchase Date *
              </label>
              <input
                name="purchase_date"
                type="date"
                required
                className={`max-w-xs ${inputClass}`}
              />
            </div>
          )}

          {/* Courier fields — shown when incoming source is courier */}
          {showCourierFields && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Courier Name *
                </label>
                <input
                  name="courier_name_delivery"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="e.g. BlueDart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Courier Date *
                </label>
                <input
                  name="courier_date"
                  type="date"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  DOC Number *
                </label>
                <input
                  name="doc_number"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Document/tracking number"
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== Device Details ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm">
              💻
            </span>
            Device Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Product Name *
              </label>
              <ProductSearchInput
                onProductSelect={(product) => {
                  setBrandNames(product.brandNames);
                  setSelectedServiceItemId(product.serviceItemId);
                  setSelectedAccessories([]);
                  setSelectedIssues([]);
                  setSelectedRequirements([]);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Brand Name
              </label>
              <BrandSelect brands={brandNames} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Model Name
              </label>
              <input
                name="model_name"
                type="text"
                className={inputClass}
                placeholder="e.g. Inspiron 15"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Serial / IMEI No. 1
              </label>
              <input
                name="serial_1"
                type="text"
                className={inputClass}
                placeholder="Serial number 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Serial / IMEI No. 2
              </label>
              <input
                name="serial_2"
                type="text"
                className={inputClass}
                placeholder="Serial number 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Device Password
              </label>
              <input
                name="device_password"
                type="text"
                className={inputClass}
                placeholder="Pin / password"
              />
            </div>
          </div>
        </div>

        {/* ===== Multi-select options ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <MultiSelectOptions
              label="Accessories Received"
              options={accessoryOptions}
              selected={selectedAccessories}
              onChange={setSelectedAccessories}
              placeholder="Search accessories..."
              onCreateCustom={(name) =>
                setCustomOptionDialog({
                  optionType: "items_received",
                  name,
                  label: "Accessory",
                })
              }
            />
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <MultiSelectOptions
              label="Default Issues"
              options={issueOptions}
              selected={selectedIssues}
              onChange={setSelectedIssues}
              placeholder="Search issues..."
              onCreateCustom={(name) =>
                setCustomOptionDialog({
                  optionType: "default_issue",
                  name,
                  label: "Issue",
                })
              }
            />
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <MultiSelectOptions
              label="Additional Requirements"
              options={requirementOptions}
              selected={selectedRequirements}
              onChange={setSelectedRequirements}
              placeholder="Search requirements..."
              onCreateCustom={(name) =>
                setCustomOptionDialog({
                  optionType: "additional_requirement",
                  name,
                  label: "Requirement",
                })
              }
            />
          </div>
        </div>

        {/* ===== Notes & Photos ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm">
              📝
            </span>
            Photos &amp; Notes
          </h2>
          <div className="">
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-3">
              Device Photos (including any damage)
            </p>
            <ImageUploader onImagesChange={setImageUrls} maxImages={10} />
          </div>
          <textarea
            name="notes"
            rows={3}
            className={`${inputClass} resize-none mt-4`}
            placeholder="Any additional remarks..."
          />
        </div>

        {/* ===== Submit ===== */}
        <div className="flex justify-end gap-3 pt-2">
          <a
            href="/dashboard/jobcards"
            className="px-6 py-3 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 cursor-pointer"
          >
            {pending ? (
              <span className="flex items-center gap-2">
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
                Creating...
              </span>
            ) : (
              "Submit Job Card"
            )}
          </button>
        </div>
      </form>
      {/* ===== New Customer Dialog ===== */}
      <Dialog
        open={showCustomerDialog}
        onClose={() => {
          setShowCustomerDialog(false);
          setShowCustMap(false);
        }}
        title="Add New Customer"
        maxWidth="max-w-3xl"
      >
        {custFormState?.message && !custFormState.success && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-danger/10 text-danger">
            {custFormState.message}
          </div>
        )}
        <form
          id="new-customer-dialog-form"
          action={custFormAction}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">
                Name *
              </label>
              <input
                name="name"
                required
                placeholder="Customer name"
                className={inputClass}
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
                className={inputClass}
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
              placeholder="customer@example.com"
              className={inputClass}
            />
          </div>
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
                name="notes"
                placeholder="Any remarks"
                className={inputClass}
              />
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <button
              type="button"
              onClick={() => setShowCustMap(!showCustMap)}
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
              {showCustMap
                ? "Hide Map"
                : "\ud83d\udccd Pick location on Google Maps"}
            </button>
            {showCustMap && (
              <div className="mt-3">
                <LocationPicker onLocationSelect={handleCustLocationSelect} />
              </div>
            )}
          </div>

          {custAddressLat && custAddressLng && (
            <input type="hidden" name="address_lat" value={custAddressLat} />
          )}
          {custAddressLat && custAddressLng && (
            <input type="hidden" name="address_lng" value={custAddressLng} />
          )}
          {custFullAddress && (
            <input type="hidden" name="full_address" value={custFullAddress} />
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 dark:border-surface-800">
            <button
              type="button"
              onClick={() => {
                setShowCustomerDialog(false);
                setShowCustMap(false);
              }}
              className="px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={custFormPending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {custFormPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Customer"
              )}
            </button>
          </div>
        </form>
      </Dialog>

      {/* ===== Custom Option Dialog ===== */}
      <Dialog
        open={!!customOptionDialog}
        onClose={() => setCustomOptionDialog(null)}
        title={`Add New ${customOptionDialog?.label || "Option"}`}
        maxWidth="max-w-md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const name = (fd.get("option_name") as string)?.trim();
            if (name) await handleCreateCustomOption(name);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-surface-500 mb-1">
              Name *
            </label>
            <input
              name="option_name"
              required
              defaultValue={customOptionDialog?.name || ""}
              autoFocus
              className={inputClass}
              placeholder={`Enter ${customOptionDialog?.label?.toLowerCase() || "option"} name...`}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 dark:border-surface-800">
            <button
              type="button"
              onClick={() => setCustomOptionDialog(null)}
              className="px-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={customOptionSaving}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {customOptionSaving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Create & Add"
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
