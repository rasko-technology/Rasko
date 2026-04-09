"use server";

import { requireStore, createStoreClient } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";

function parseListField(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .flatMap((value) => value.toString().split(/\r?\n|,/))
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function createJobcard(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const customerName = formData.get("customer_name") as string;
  if (!customerName?.trim()) {
    return { errors: { customer_name: ["Customer name is required."] } };
  }

  // If new customer fields are provided (no existing customer_id), create the customer first
  let customerId = formData.get("customer_id")
    ? parseInt(formData.get("customer_id") as string)
    : null;

  const accessoriesReceived = parseListField(formData, "accessories_received");
  const defaultIssues = parseListField(formData, "default_issues");
  const additionalRequirements = parseListField(
    formData,
    "additional_requirements",
  );

  // Parse serial numbers
  const serialNumbers: string[] = [];
  const s1 = formData.get("serial_1") as string;
  const s2 = formData.get("serial_2") as string;
  const s3 = formData.get("serial_3") as string;
  if (s1?.trim()) serialNumbers.push(s1.trim());
  if (s2?.trim()) serialNumbers.push(s2.trim());
  if (s3?.trim()) serialNumbers.push(s3.trim());

  const employeeId = formData.get("assigned_to") as string;
  const bookingId = formData.get("booking_id") as string;

  const { error } = await supabase.from("jobcards").insert({
    store_id: membership.store_id,
    customer_name: customerName.trim(),
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    carrier_name: (formData.get("carrier_name") as string) || null,
    carrier_phone: (formData.get("carrier_phone") as string) || null,
    payment_type: (formData.get("payment_type") as string) || "chargeable",
    incoming_source: (formData.get("incoming_source") as string) || "carry_in",
    priority: (formData.get("priority") as string) || "medium",
    product_name: (formData.get("product_name") as string) || null,
    brand:
      (formData.get("brand_name") as string) ||
      (formData.get("brand") as string) ||
      null,
    model_name: (formData.get("model_name") as string) || null,
    serial_numbers: serialNumbers,
    device_password: (formData.get("device_password") as string) || null,
    estimation_amount:
      parseFloat((formData.get("estimation_amount") as string) || "0") || 0,
    advance_amount:
      parseFloat((formData.get("advance_amount") as string) || "0") || 0,
    accessories_received: accessoriesReceived,
    default_issues: defaultIssues,
    additional_requirements: additionalRequirements,
    assigned_to: employeeId ? parseInt(employeeId) : null,
    employee_id: employeeId ? parseInt(employeeId) : null,
    booking_id: bookingId ? parseInt(bookingId) : null,
    notes: (formData.get("notes") as string) || null,
    purchase_date: (formData.get("purchase_date") as string) || null,
    courier_name: (formData.get("courier_name_delivery") as string) || null,
    courier_date: (formData.get("courier_date") as string) || null,
    doc_number: (formData.get("doc_number") as string) || null,
    customer_id: customerId,
    images: parseListField(formData, "images"),
    booking_date_time: (formData.get("booking_date_time") as string) || null,
    inspection_charges:
      parseFloat((formData.get("inspection_charges") as string) || "0") || 0,
  });

  if (error) {
    console.error("Jobcard creation failed:", error);
    return { message: "Failed to create job card. " + error.message };
  }

  revalidatePath("/dashboard/jobcards");
  return { success: true, message: "Job card created successfully!" };
}

export async function updateJobcard(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const id = formData.get("id") as string;
  if (!id) return { message: "Job card ID is required." };

  const customerName = formData.get("customer_name") as string;
  if (!customerName?.trim()) {
    return { errors: { customer_name: ["Customer name is required."] } };
  }

  let customerId = formData.get("customer_id")
    ? parseInt(formData.get("customer_id") as string)
    : null;

  const accessoriesReceived = parseListField(formData, "accessories_received");
  const defaultIssues = parseListField(formData, "default_issues");
  const additionalRequirements = parseListField(
    formData,
    "additional_requirements",
  );
  const engineerObservations = parseListField(
    formData,
    "engineer_observations",
  );
  const customerNotes = parseListField(formData, "customer_notes");
  const actionTaken = parseListField(formData, "action_taken");

  const serialNumbers: string[] = [];
  const s1 = formData.get("serial_1") as string;
  const s2 = formData.get("serial_2") as string;
  const s3 = formData.get("serial_3") as string;
  if (s1?.trim()) serialNumbers.push(s1.trim());
  if (s2?.trim()) serialNumbers.push(s2.trim());
  if (s3?.trim()) serialNumbers.push(s3.trim());

  const employeeId = formData.get("assigned_to") as string;

  const { error } = await supabase
    .from("jobcards")
    .update({
      customer_name: customerName.trim(),
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      carrier_name: (formData.get("carrier_name") as string) || null,
      carrier_phone: (formData.get("carrier_phone") as string) || null,
      payment_type: (formData.get("payment_type") as string) || "chargeable",
      incoming_source:
        (formData.get("incoming_source") as string) || "carry_in",
      priority: (formData.get("priority") as string) || "medium",
      product_name: (formData.get("product_name") as string) || null,
      brand:
        (formData.get("brand_name") as string) ||
        (formData.get("brand") as string) ||
        null,
      model_name: (formData.get("model_name") as string) || null,
      serial_numbers: serialNumbers,
      device_password: (formData.get("device_password") as string) || null,
      estimation_amount:
        parseFloat((formData.get("estimation_amount") as string) || "0") || 0,
      advance_amount:
        parseFloat((formData.get("advance_amount") as string) || "0") || 0,
      inspection_charges:
        parseFloat((formData.get("inspection_charges") as string) || "0") || 0,
      accessories_received: accessoriesReceived,
      default_issues: defaultIssues,
      additional_requirements: additionalRequirements,
      assigned_to: employeeId ? parseInt(employeeId) : null,
      employee_id: employeeId ? parseInt(employeeId) : null,
      notes: (formData.get("notes") as string) || null,
      purchase_date: (formData.get("purchase_date") as string) || null,
      courier_name: (formData.get("courier_name_delivery") as string) || null,
      courier_date: (formData.get("courier_date") as string) || null,
      doc_number: (formData.get("doc_number") as string) || null,
      customer_id: customerId,
      images: parseListField(formData, "images"),
      booking_date_time: (formData.get("booking_date_time") as string) || null,
      status: (formData.get("status") as string) || "open",
      engineer_observations: engineerObservations,
      engineer_observation_notes:
        (formData.get("engineer_observation_notes") as string) || null,
      customer_notes: customerNotes,
      customer_note_text:
        (formData.get("customer_note_text") as string) || null,
      action_taken: actionTaken,
      receiver_same_as_customer:
        formData.get("receiver_same_as_customer") === "true",
      receiver_name:
        formData.get("receiver_same_as_customer") === "true"
          ? null
          : (formData.get("receiver_name") as string) || null,
      receiver_phone:
        formData.get("receiver_same_as_customer") === "true"
          ? null
          : (formData.get("receiver_phone") as string) || null,
      original_jobsheet_received:
        formData.get("original_jobsheet_received") === "true",
      jobsheet_not_received_reason:
        formData.get("original_jobsheet_received") === "true"
          ? null
          : (formData.get("jobsheet_not_received_reason") as string) || null,
      repair_status: (formData.get("repair_status") as string) || "open",
      closing_date_time: (formData.get("closing_date_time") as string) || null,
      closing_status: (formData.get("closing_status") as string) || null,
      receiver_image: (formData.get("receiver_image") as string) || null,
    })
    .eq("id", parseInt(id))
    .eq("store_id", membership.store_id);

  if (error) {
    console.error("Jobcard update failed:", error);
    return { message: "Failed to update job card. " + error.message };
  }

  revalidatePath("/dashboard/jobcards");
  return { success: true, message: "Job card updated successfully!" };
}

export async function updateJobcardStatus(
  id: number,
  status: string,
): Promise<FormState> {
  await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase
    .from("jobcards")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { message: "Failed to update status." };
  }

  revalidatePath("/dashboard/jobcards");
  return { success: true, message: "Status updated." };
}
