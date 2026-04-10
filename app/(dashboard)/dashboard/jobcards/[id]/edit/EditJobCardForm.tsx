"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useActionState,
} from "react";
import { updateJobcard } from "@/app/actions/jobcards";
import { createCustomer } from "@/app/actions/customers";
import { createServiceOption } from "@/app/actions/service-options";
import { useRouter } from "next/navigation";
import { MultiSelectOptions } from "@/app/components/jobcard/MultiSelectOptions";
import { ImageUploader } from "@/app/components/jobcard/ImageUploader";
import { ForwardJobCardDialog } from "@/app/components/jobcard/ForwardJobCardDialog";
import { ProductSearchInput } from "@/app/components/booking/ProductSearchInput";
import { BrandSelect } from "@/app/components/booking/BrandSelect";
import { Dialog } from "@/app/components/ui/Dialog";
import { LocationPicker } from "@/app/components/booking/LocationPicker";
import { useCustomerSearch } from "@/app/hooks/use-customers";
import { useDebouncedValue } from "@/app/hooks/use-debounced-value";

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

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  jobcard: any;
  employees: { id: number; name: string }[];
  serviceOptions: ServiceOption[];
}

const REPAIR_STATUSES = [
  "Open",
  "Approval Pending",
  "Approved",
  "Buy Back",
  "Cancel",
  "Completed With Repair",
  "Intentionally Left Out",
  "Internal Billing",
  "Need Tech Support",
  "Out For Warranty",
  "Part Required",
  "Pending",
  "Ready For Delivery",
  "Return Without Repair",
  "Repair Start",
  "Repair Closed",
  "Warranty Created",
  "Waiting For Pickup (OW)",
];

const CLOSING_STATUSES = [
  "Delivered to Customer",
  "Delivered via Courier",
  "Closed - Unrepairable",
  "Closed - Customer Rejected",
  "Closed - Warranty Claim",
];

const inputClass =
  "w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500";

export function EditJobCardForm({ jobcard, employees, serviceOptions }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateJobcard, undefined);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [carrierSame, setCarrierSame] = useState(true);
  const [paymentType, setPaymentType] = useState(
    jobcard.payment_type || "chargeable",
  );
  const [incomingSource, setIncomingSource] = useState(
    jobcard.incoming_source || "carry_in",
  );

  // Customer search
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerResult | null>(
      jobcard.customer_id
        ? {
            id: jobcard.customer_id,
            name: jobcard.customer_name,
            phone: jobcard.customers?.phone ?? jobcard.phone,
            address: jobcard.address,
          }
        : null,
    );
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const customerWrapperRef = useRef<HTMLDivElement>(null);
  const debouncedCustomerQuery = useDebouncedValue(customerQuery, 300);
  const { customers: customerResults, isLoading: customerLoading } =
    useCustomerSearch(debouncedCustomerQuery);

  // New customer dialog
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
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(
    jobcard.accessories_received || [],
  );
  const [selectedIssues, setSelectedIssues] = useState<string[]>(
    jobcard.default_issues || [],
  );
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    jobcard.additional_requirements || [],
  );

  // Edit-only multi-selects
  const [selectedObservations, setSelectedObservations] = useState<string[]>(
    jobcard.engineer_observations || [],
  );
  const [selectedCustNotes, setSelectedCustNotes] = useState<string[]>(
    jobcard.customer_notes || [],
  );
  const [selectedActions, setSelectedActions] = useState<string[]>(
    jobcard.action_taken || [],
  );

  // Edit-only fields
  const [receiverSame, setReceiverSame] = useState(
    jobcard.receiver_same_as_customer ?? true,
  );
  const [originalJobsheet, setOriginalJobsheet] = useState(
    jobcard.original_jobsheet_received ?? true,
  );
  const [repairStatus, setRepairStatus] = useState(
    jobcard.repair_status || "Open",
  );
  const [closingStatus, setClosingStatus] = useState(
    jobcard.closing_status || "",
  );

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>(jobcard.images || []);
  const [receiverImageUrl, setReceiverImageUrl] = useState<string>(
    jobcard.receiver_image || "",
  );

  // Receiver name/phone
  const [receiverName, setReceiverName] = useState(jobcard.receiver_name || "");
  const [receiverPhone, setReceiverPhone] = useState(
    jobcard.receiver_phone || "",
  );

  // Custom option dialog
  const [customOptionDialog, setCustomOptionDialog] = useState<{
    optionType: string;
    name: string;
    label: string;
  } | null>(null);
  const [customOptionSaving, setCustomOptionSaving] = useState(false);
  const [localOptions, setLocalOptions] = useState<ServiceOption[]>([]);

  // Jobsheet reason
  const [jobsheetReason, setJobsheetReason] = useState(
    jobcard.jobsheet_not_received_reason || "",
  );

  // Forward dialog
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const isForwarded = jobcard.status === "forwarded";

  const allOptions = [...serviceOptions, ...localOptions];

  // Filter service options
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
  const observationOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "engineer_observation"),
  );
  const custNoteOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "customer_note"),
  );
  const actionTakenOptions = filterByProduct(
    allOptions.filter((o) => o.option_type === "action_taken"),
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
    engineer_observation: {
      setter: (fn) => setSelectedObservations(fn),
      label: "Observation",
    },
    customer_note: { setter: (fn) => setSelectedCustNotes(fn), label: "Note" },
    action_taken: { setter: (fn) => setSelectedActions(fn), label: "Action" },
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

  // Redirect on success
  useEffect(() => {
    if (state?.success) {
      setToast({
        message: state.message || "Job card updated!",
        type: "success",
      });
      const timer = setTimeout(() => router.push("/dashboard/jobcards"), 1500);
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
      {/* Toast */}
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
        <input type="hidden" name="id" value={jobcard.id} />

        {/* Hidden fields */}
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
        {selectedObservations.map((item) => (
          <input
            key={`obs-${item}`}
            type="hidden"
            name="engineer_observations"
            value={item}
          />
        ))}
        {selectedCustNotes.map((item) => (
          <input
            key={`cn-${item}`}
            type="hidden"
            name="customer_notes"
            value={item}
          />
        ))}
        {selectedActions.map((item) => (
          <input
            key={`act-${item}`}
            type="hidden"
            name="action_taken"
            value={item}
          />
        ))}
        {imageUrls.map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}
        <input
          type="hidden"
          name="receiver_same_as_customer"
          value={String(receiverSame)}
        />
        <input
          type="hidden"
          name="original_jobsheet_received"
          value={String(originalJobsheet)}
        />
        {receiverImageUrl && (
          <input type="hidden" name="receiver_image" value={receiverImageUrl} />
        )}

        
        {/* ===== Forwarding Info Banner ===== */}
        {isForwarded && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
              <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                Forwarded
              </span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              This job card was forwarded to{" "}
              <strong>{jobcard.forwarded_to_store_name}</strong>
              {jobcard.forwarded_to_store_address && (
                <> &middot; {jobcard.forwarded_to_store_address}</>
              )}
              {jobcard.forwarded_to_store_phone && (
                <> &middot; {jobcard.forwarded_to_store_phone}</>
              )}
            </p>
          </div>
        )}

        {/* ===== Forwarded From Banner ===== */}
        {jobcard.forwarded_from_store_name && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859"
                />
              </svg>
              <span className="font-semibold text-sm text-blue-700 dark:text-blue-400">
                Forwarded from another store
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-500">
              Originally from{" "}
              <strong>{jobcard.forwarded_from_store_name}</strong>
              {jobcard.forwarded_from_jobcard_id && (
                <> (Job Card #{jobcard.forwarded_from_jobcard_id})</>
              )}
            </p>
          </div>
        )}

        {/* ===== Customer Details ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm">
              👤
            </span>
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer search */}
            <div ref={customerWrapperRef} className="relative">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Mobile Number *
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-primary-50/50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/20">
                  <div className="min-w-0">
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
                      name="phone"
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
                defaultValue={selectedCustomer?.name || jobcard.customer_name}
                key={selectedCustomer?.id || "edit"}
                readOnly={!!selectedCustomer}
                className={`${inputClass} ${selectedCustomer ? "bg-surface-100 dark:bg-surface-800/50 cursor-not-allowed" : ""}`}
                placeholder="Full name"
              />
            </div>

            {/* Booking date */}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Booking Date &amp; Time
              </label>
              <input
                name="booking_date_time"
                type="datetime-local"
                defaultValue={
                  jobcard.booking_date_time
                    ? new Date(jobcard.booking_date_time)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Carrier toggle */}
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

          {!carrierSame && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Carrier&apos;s Mobile Number
                </label>
                <input
                  name="carrier_phone"
                  type="tel"
                  defaultValue={jobcard.carrier_phone || ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Carrier&apos;s Person Name
                </label>
                <input
                  name="carrier_name"
                  type="text"
                  defaultValue={jobcard.carrier_name || ""}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Amounts */}
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
                defaultValue={jobcard.inspection_charges || ""}
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
                defaultValue={jobcard.estimation_amount || ""}
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
                defaultValue={jobcard.advance_amount || ""}
                className={inputClass}
                placeholder="₹0.00"
              />
            </div>
          </div>

          {/* Payment, Source, Priority, Assigned */}
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
                defaultValue={jobcard.priority || "medium"}
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
              <select
                name="assigned_to"
                defaultValue={jobcard.assigned_to || ""}
                className={inputClass}
              >
                <option value="">Not assigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Status
              </label>
              <select
                name="status"
                defaultValue={jobcard.status || "open"}
                className={inputClass}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Purchase Date */}
          {showPurchaseDate && (
            <div className="mt-4 animate-slide-up">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Purchase Date *
              </label>
              <input
                name="purchase_date"
                type="date"
                required
                defaultValue={jobcard.purchase_date || ""}
                className={`max-w-xs ${inputClass}`}
              />
            </div>
          )}

          {/* Courier fields */}
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
                  defaultValue={jobcard.courier_name || ""}
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
                  defaultValue={jobcard.courier_date || ""}
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
                  defaultValue={jobcard.doc_number || ""}
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
                value={jobcard.product_name || ""}
                onProductSelect={(product) => {
                  setBrandNames(product.brandNames);
                  setSelectedServiceItemId(product.serviceItemId);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Brand Name
              </label>
              <BrandSelect brands={brandNames} value={jobcard.brand || ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Model Name
              </label>
              <input
                name="model_name"
                type="text"
                defaultValue={jobcard.model_name || ""}
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
                defaultValue={jobcard.serial_numbers?.[0] || ""}
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
                defaultValue={jobcard.serial_numbers?.[1] || ""}
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
                defaultValue={jobcard.device_password || ""}
                className={inputClass}
                placeholder="Pin / password"
              />
            </div>
          </div>
        </div>

        {/* ===== Multi-select options (from creation) ===== */}
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

        {/* ===== Engineer Observations & Customer Notes ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <MultiSelectOptions
              label="Engineer Observations"
              options={observationOptions}
              selected={selectedObservations}
              onChange={setSelectedObservations}
              placeholder="Search observations..."
              onCreateCustom={(name) =>
                setCustomOptionDialog({
                  optionType: "engineer_observation",
                  name,
                  label: "Observation",
                })
              }
            />
            {/* <textarea
              name="engineer_observation_notes"
              rows={3}
              defaultValue={jobcard.engineer_observation_notes || ""}
              className={`${inputClass} resize-none mt-4`}
              placeholder="Additional observation notes..."
            /> */}
          </div>
          <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
            <MultiSelectOptions
              label="Customer Notes"
              options={custNoteOptions}
              selected={selectedCustNotes}
              onChange={setSelectedCustNotes}
              placeholder="Search customer notes..."
              onCreateCustom={(name) =>
                setCustomOptionDialog({
                  optionType: "customer_note",
                  name,
                  label: "Note",
                })
              }
            />
            {/* <textarea
              name="customer_note_text"
              rows={3}
              defaultValue={jobcard.customer_note_text || ""}
              className={`${inputClass} resize-none mt-4`}
              placeholder="Additional customer notes..."
            /> */}
          </div>
        </div>

        {/* ===== Action Taken ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <MultiSelectOptions
            label="Action Taken"
            options={actionTakenOptions}
            selected={selectedActions}
            onChange={setSelectedActions}
            placeholder="Search actions..."
            onCreateCustom={(name) =>
              setCustomOptionDialog({
                optionType: "action_taken",
                name,
                label: "Action",
              })
            }
          />
        </div>

        {/* ===== Closing & Receiver Details ===== */}
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm">
              📋
            </span>
            Closing &amp; Receiver Details
          </h2>

          {/* Radio toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
                Receiver person is same as that of customer *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={receiverSame}
                    onChange={() => setReceiverSame(true)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!receiverSame}
                    onChange={() => setReceiverSame(false)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    No
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
                Original Job Sheet Received *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={originalJobsheet}
                    onChange={() => setOriginalJobsheet(true)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!originalJobsheet}
                    onChange={() => setOriginalJobsheet(false)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700 dark:text-surface-300">
                    No
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Jobsheet not received reason */}
          {!originalJobsheet && (
            <div className="mt-4 animate-slide-up">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Reason for not receiving original job sheet *
              </label>
              <input
                name="jobsheet_not_received_reason"
                type="text"
                required
                value={jobsheetReason}
                onChange={(e) => setJobsheetReason(e.target.value)}
                className={inputClass}
                placeholder="Enter reason..."
              />
            </div>
          )}

          {/* Receiver Name & Phone when not same as customer */}
          {!receiverSame && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Receiver Name *
                </label>
                <input
                  name="receiver_name"
                  type="text"
                  required
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className={inputClass}
                  placeholder="Enter receiver name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                  Receiver Phone Number *
                </label>
                <input
                  name="receiver_phone"
                  type="tel"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Enter receiver phone number"
                />
              </div>
            </div>
          )}

          {/* Repair Status, Closing Date, Closing Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Repair Status *
              </label>
              <select
                name="repair_status"
                value={repairStatus}
                onChange={(e) => setRepairStatus(e.target.value)}
                className={inputClass}
              >
                {REPAIR_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Closing Date &amp; Time
              </label>
              <input
                name="closing_date_time"
                type="datetime-local"
                defaultValue={
                  jobcard.closing_date_time
                    ? new Date(jobcard.closing_date_time)
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Closing Status
              </label>
              <select
                name="closing_status"
                value={closingStatus}
                onChange={(e) => setClosingStatus(e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                {CLOSING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Receiver Person Image */}
          <div className="mt-5">
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-3">
              Receiver Person Image{" "}
              {!receiverSame && (
                <span className="text-surface-400 font-normal">(optional)</span>
              )}
            </p>
            <ImageUploader
              onImagesChange={(urls) => setReceiverImageUrl(urls[0] || "")}
              maxImages={1}
              existingImages={
                jobcard.receiver_image ? [jobcard.receiver_image] : []
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
          <div>
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-3">
              Device Photos (including any damage)
            </p>
            <ImageUploader
              onImagesChange={setImageUrls}
              maxImages={10}
              existingImages={jobcard.images || []}
            />
          </div>
          <textarea
            name="notes"
            rows={3}
            defaultValue={jobcard.notes || ""}
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
          {!isForwarded && (
            <button
              type="button"
              onClick={() => setShowForwardDialog(true)}
              className="px-6 py-3 rounded-xl border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
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
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
                Forward
              </span>
            </button>
          )}
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
                Saving...
              </span>
            ) : (
              "Save Changes"
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

      {/* ===== Forward Job Card Dialog ===== */}
      <ForwardJobCardDialog
        open={showForwardDialog}
        onClose={() => setShowForwardDialog(false)}
        jobcardId={jobcard.id}
        jobcardCustomerName={jobcard.customer_name}
      />
    </>
  );
}
