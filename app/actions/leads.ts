"use server";

import { requireStore, createStoreClient } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/lib/definitions";

export async function createLead(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();

  const customer_id = formData.get("customer_id")?.toString();
  if (!customer_id) {
    return { message: "Please select a customer." };
  }

  const assigned_to = formData.get("assigned_to")?.toString();

  let productRequirements = null;
  try {
    const raw = formData.get("product_requirements")?.toString();
    if (raw) productRequirements = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  const supabase = await createStoreClient();
  const { error } = await supabase.from("leads").insert({
    store_id: membership.store_id,
    customer_id: parseInt(customer_id),
    user_type: formData.get("user_type")?.toString()?.trim() || null,
    incoming_source:
      formData.get("incoming_source")?.toString()?.trim() || null,
    advance_amount:
      parseFloat(formData.get("advance_amount")?.toString() || "0") || null,
    priority: formData.get("priority")?.toString() || "medium",
    booking_date_time: formData.get("booking_date_time")?.toString() || null,
    payment_mode: formData.get("payment_mode")?.toString()?.trim() || null,
    product_requirements: productRequirements,
    status: "new",
    notes: formData.get("notes")?.toString()?.trim() || null,
    assigned_to: assigned_to ? parseInt(assigned_to) : null,
  });

  if (error) {
    console.error("Lead creation error:", error);
    return { message: "Failed to create lead." };
  }

  revalidatePath("/dashboard/leads");
  return { success: true, message: "Lead created successfully." };
}

export async function updateLeadStatus(
  id: number,
  status: string,
): Promise<FormState> {
  await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { message: "Failed to update status." };
  }

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function updateLead(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const membership = await requireStore();

  const leadId = formData.get("lead_id")?.toString();
  if (!leadId) return { message: "Lead ID is required." };

  const customer_id = formData.get("customer_id")?.toString();
  if (!customer_id) return { message: "Please select a customer." };

  const assigned_to = formData.get("assigned_to")?.toString();

  let productRequirements = null;
  try {
    const raw = formData.get("product_requirements")?.toString();
    if (raw) productRequirements = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  const supabase = await createStoreClient();
  const { error } = await supabase
    .from("leads")
    .update({
      customer_id: parseInt(customer_id),
      user_type: formData.get("user_type")?.toString()?.trim() || null,
      incoming_source:
        formData.get("incoming_source")?.toString()?.trim() || null,
      advance_amount:
        parseFloat(formData.get("advance_amount")?.toString() || "0") || null,
      priority: formData.get("priority")?.toString() || "medium",
      booking_date_time: formData.get("booking_date_time")?.toString() || null,
      payment_mode: formData.get("payment_mode")?.toString()?.trim() || null,
      product_requirements: productRequirements,
      notes: formData.get("notes")?.toString()?.trim() || null,
      assigned_to: assigned_to ? parseInt(assigned_to) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parseInt(leadId))
    .eq("store_id", membership.store_id);

  if (error) {
    console.error("Lead update error:", error);
    return { message: "Failed to update lead." };
  }

  revalidatePath("/dashboard/leads");
  return { success: true, message: "Lead updated successfully." };
}

export async function deleteLead(id: number): Promise<FormState> {
  await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    return { message: "Failed to delete lead." };
  }

  revalidatePath("/dashboard/leads");
  return { success: true, message: "Lead deleted." };
}
