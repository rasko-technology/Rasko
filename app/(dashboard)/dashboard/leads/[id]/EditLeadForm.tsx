"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useActionState,
} from "react";
import { updateLead } from "@/app/actions/leads";
import { createCustomer } from "@/app/actions/customers";
import { useRouter } from "next/navigation";
import { ProductSearchInput } from "@/app/components/booking/ProductSearchInput";
import { BrandSelect } from "@/app/components/booking/BrandSelect";
import { Dialog } from "@/app/components/ui/Dialog";
import { LocationPicker } from "@/app/components/booking/LocationPicker";
import { useCustomerSearch } from "@/app/hooks/use-customers";
import { useDebouncedValue } from "@/app/hooks/use-debounced-value";

interface CustomerResult {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
}

interface ProductRow {
  product_name: string;
  brand_name: string;
  model: string;
  configuration: string;
  qty: number;
  referral_link: string;
  service_item_id: number | null;
  brandOptions: string[];
}

interface Lead {
  id: number;
  customer_id: number;
  customers: CustomerResult | null;
  user_type: string | null;
  incoming_source: string | null;
  advance_amount: number | null;
  priority: string;
  booking_date_time: string | null;
  payment_mode: string | null;
  product_requirements: Array<{
    product_name: string;
    brand_name: string;
    model: string;
    configuration: string;
    qty: number;
    referral_link: string;
  }> | null;
  notes: string | null;
  assigned_to: number | null;
  status: string;
}

interface Props {
  lead: Lead;
  employees: { id: number; name: string }[];
}

const USER_TYPES = [
  "Govt",
  "Hospital",
  "Hotel",
  "Home",
  "Office",
  "School/College",
  "Student",
  "Studio",
];

const PAYMENT_MODES = ["BAJAJ FINSERV", "CASH", "SWIPE", "UPI", "NEFT/RTGS"];

const INCOMING_SOURCES = [
  "Email",
  "Facebook",
  "Google",
  "Instagram",
  "Just Dial",
  "News Paper",
  "Old Customer",
  "Phone Call",
  "Referral",
  "Step In",
  "Walk In",
  "WhatsApp",
];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

const selectClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

const emptyRow: ProductRow = {
  product_name: "",
  brand_name: "",
  model: "",
  configuration: "",
  qty: 1,
  referral_link: "",
  service_item_id: null,
  brandOptions: [],
};

export function EditLeadForm({ lead, employees }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateLead, undefined);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResult | null>(
      lead.customers
        ? {
            id: lead.customers.id,
            name: lead.customers.name,
            phone: lead.customers.phone,
            address: lead.customers.address,
            city: lead.customers.city,
          }
        : null,
    );
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const customerWrapperRef = useRef<HTMLDivElement>(null);
  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 300);
  const { customers: customerResults, isLoading: customerLoading } =
    useCustomerSearch(debouncedCustomerQuery);

  // New customer form (dialog)
  const [custFormState, custFormAction, custFormPending] = useActionState(
    createCustomer,
    undefined,
  );
  const [showCustMap, setShowCustMap] = useState(false);
  const [custAddressLat, setCustAddressLat] = useState<number | null>(null);
  const [custAddressLng, setCustAddressLng] = useState<number | null>(null);
  const [custFullAddress, setCustFullAddress] = useState("");

  // Product requirements rows
  const initialRows: ProductRow[] =
    lead.product_requirements && lead.product_requirements.length > 0
      ? lead.product_requirements.map((p) => ({
          product_name: p.product_name || "",
          brand_name: p.brand_name || "",
          model: p.model || "",
          configuration: p.configuration || "",
          qty: p.qty || 1,
          referral_link: p.referral_link || "",
          service_item_id: null,
          brandOptions: p.brand_name ? [p.brand_name] : [],
        }))
      : [{ ...emptyRow }];
  const [productRows, setProductRows] = useState<ProductRow[]>(initialRows);

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      setToast({ message: state.message || "Lead updated!", type: "success" });
      const timer = setTimeout(() => router.push("/dashboard/leads"), 1500);
      return () => clearTimeout(timer);
    } else if (state?.message && !state?.success) {
      setToast({ message: state.message, type: "error" });
    }
  }, [state, router]);

  // Open dropdown when SWR results arrive
  useEffect(() => {
    if (debouncedCustomerQuery.length >= 2 && customerResults.length > 0) {
      setCustomerOpen(true);
    } else if (debouncedCustomerQuery.length < 2) {
      setCustomerOpen(false);
    }
  }, [customerResults, debouncedCustomerQuery]);

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
        city: (d.city as string) || null,
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
      const form = document.getElementById("edit-lead-customer-form");
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

  // Product rows management
  const addProductRow = () =>
    setProductRows((prev) => [...prev, { ...emptyRow }]);

  const removeProductRow = (index: number) =>
    setProductRows((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );

  const updateProductRow = (
    index: number,
    field: keyof ProductRow,
    value: string | number | string[] | null,
  ) => {
    setProductRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const bookingDateDefault = lead.booking_date_time
    ? new Date(lead.booking_date_time).toISOString().slice(0, 16)
    : "";

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
        {/* Hidden fields */}
        <input type="hidden" name="lead_id" value={lead.id} />
        {selectedCustomer && (
          <input type="hidden" name="customer_id" value={selectedCustomer.id} />
        )}
        <input
          type="hidden"
          name="product_requirements"
          value={JSON.stringify(
            productRows
              .filter((r) => r.product_name.trim())
              .map(({ brandOptions, service_item_id, ...rest }) => rest),
          )}
        />

        {/* ===== Customer Details ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
              &#x1F464;
            </span>
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Mobile No with search */}
            <div ref={customerWrapperRef} className="relative">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Mobile No <span className="text-danger">*</span>
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/20">
                  <p className="text-sm font-medium text-surface-500">
                    {selectedCustomer.phone || "No phone"}
                  </p>
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      onFocus={() => {
                        if (
                          customerQuery.length >= 2 &&
                          customerResults.length > 0
                        )
                          setCustomerOpen(true);
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
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerDialog(true);
                      setCustomerOpen(false);
                    }}
                    className="px-3 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors cursor-pointer shrink-0"
                    title="Add New Customer"
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
                  </button>
                </div>
              )}

              {customerOpen && !selectedCustomer && (
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
            </div>

            {/* Customer Name (display only) */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Customer Name
              </label>
              <input
                type="text"
                value={selectedCustomer?.name || ""}
                readOnly
                className={`${inputClass} bg-surface-100 dark:bg-surface-800/50 cursor-not-allowed`}
                placeholder="Select a customer"
              />
            </div>

            {/* City (display only) */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                City
              </label>
              <input
                type="text"
                value={selectedCustomer?.city || ""}
                readOnly
                className={`${inputClass} bg-surface-100 dark:bg-surface-800/50 cursor-not-allowed`}
                placeholder="—"
              />
            </div>

            {/* Booking Date & Time */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Booking Date &amp; Time <span className="text-danger">*</span>
              </label>
              <input
                name="booking_date_time"
                type="datetime-local"
                required
                defaultValue={bookingDateDefault}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                User Type <span className="text-danger">*</span>
              </label>
              <select
                name="user_type"
                required
                defaultValue={lead.user_type || ""}
                className={selectClass}
              >
                <option value="">Select</option>
                {USER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Payment Mode <span className="text-danger">*</span>
              </label>
              <select
                name="payment_mode"
                required
                defaultValue={lead.payment_mode || ""}
                className={selectClass}
              >
                <option value="">Select</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Incoming Source */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Incoming Source <span className="text-danger">*</span>
              </label>
              <select
                name="incoming_source"
                required
                defaultValue={lead.incoming_source || ""}
                className={selectClass}
              >
                <option value="">Select</option>
                {INCOMING_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Advance Amount
              </label>
              <input
                name="advance_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={lead.advance_amount ?? ""}
                className={inputClass}
                placeholder="&#x20B9;0.00"
              />
            </div>
          </div>
        </div>

        {/* ===== Product Requirement Information ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm">
              &#x1F4E6;
            </span>
            Product Requirement Information
          </h2>

          <div className="">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase">
                    Brand Name
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase">
                    Model
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase">
                    Configuration
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase w-20">
                    Qty
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-surface-500 uppercase">
                    Referral Link
                  </th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-surface-500 uppercase w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-surface-100 dark:border-surface-800"
                  >
                    <td className="px-2 py-2">
                      <ProductSearchInput
                        value={row.product_name}
                        onProductSelect={(product) => {
                          setProductRows((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? {
                                    ...r,
                                    product_name: product.productName,
                                    service_item_id: product.serviceItemId,
                                    brandOptions: product.brandNames,
                                    brand_name: product.brandNames[0] || "",
                                  }
                                : r,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <BrandSelect
                        brands={row.brandOptions}
                        value={row.brand_name}
                        onChange={(brand) =>
                          updateProductRow(idx, "brand_name", brand)
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.model}
                        onChange={(e) =>
                          updateProductRow(idx, "model", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Model"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.configuration}
                        onChange={(e) =>
                          updateProductRow(idx, "configuration", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Config"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) =>
                          updateProductRow(
                            idx,
                            "qty",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.referral_link}
                        onChange={(e) =>
                          updateProductRow(idx, "referral_link", e.target.value)
                        }
                        className={inputClass}
                        placeholder="URL"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={addProductRow}
                          className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors cursor-pointer"
                          title="Add row"
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
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProductRow(idx)}
                          disabled={productRows.length === 1}
                          className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove row"
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
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== Priority & Assignment ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Priority <span className="text-danger">*</span>
              </label>
              <select
                name="priority"
                required
                defaultValue={lead.priority}
                className={selectClass}
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Assigned To <span className="text-danger">*</span>
              </label>
              <select
                name="assigned_to"
                required
                defaultValue={lead.assigned_to ?? ""}
                className={selectClass}
              >
                <option value="">Select</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Notes
              </label>
              <input
                name="notes"
                defaultValue={lead.notes || ""}
                className={inputClass}
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Saving..." : "Update Lead"}
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
          id="edit-lead-customer-form"
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
          {custAddressLat && (
            <>
              <input type="hidden" name="address_lat" value={custAddressLat} />
              <input type="hidden" name="address_lng" value={custAddressLng!} />
              <input
                type="hidden"
                name="full_address"
                value={custFullAddress}
              />
            </>
          )}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowCustMap((v) => !v)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              {showCustMap ? "Hide Map" : "Pick Location on Map"}
            </button>
            <button
              type="submit"
              disabled={custFormPending}
              className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {custFormPending ? "Creating..." : "Create Customer"}
            </button>
          </div>
          {showCustMap && (
            <div className="mt-3">
              <LocationPicker onLocationSelect={handleCustLocationSelect} />
            </div>
          )}
        </form>
      </Dialog>
    </>
  );
}
