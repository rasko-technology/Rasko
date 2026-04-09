"use server";

import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";
import type { ServiceOptionType } from "@/constants/service_option_defaults";

const VALID_TYPES: ServiceOptionType[] = [
  "default_issue",
  "items_received",
  "action_taken",
  "engineer_observation",
  "additional_requirement",
  "customer_note",
];

function validateOptionType(type: string): type is ServiceOptionType {
  return VALID_TYPES.includes(type as ServiceOptionType);
}

const TYPE_PATH_MAP: Record<ServiceOptionType, string> = {
  default_issue: "/dashboard/service/default-issues",
  items_received: "/dashboard/service/items-received",
  action_taken: "/dashboard/service/action-taken",
  engineer_observation: "/dashboard/service/engineer-observation",
  additional_requirement: "/dashboard/service/additional-requirements",
  customer_note: "/dashboard/service/customer-note",
};

export async function createServiceOption(
  optionType: string,
  name: string,
  serviceItemId?: number | null,
) {
  if (!validateOptionType(optionType)) {
    return { message: "Invalid option type." };
  }

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 500) {
    return { message: "Name must be between 1 and 500 characters." };
  }

  const membership = await requireStore();
  const supabase = await createClient();

  const row: Record<string, unknown> = {
    store_id: membership.store_id,
    option_type: optionType,
    name: trimmed,
  };
  if (serviceItemId) row.service_item_id = serviceItemId;

  const { error } = await supabase.from("store_service_options").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { message: "This option already exists." };
    }
    console.error("createServiceOption error:", error);
    return { message: `Failed to create option: ${error.message}` };
  }

  revalidatePath(TYPE_PATH_MAP[optionType]);
  return { success: true, message: "Option created." };
}

export async function updateServiceOption(id: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 500) {
    return { message: "Name must be between 1 and 500 characters." };
  }

  await requireStore();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("store_service_options")
    .select("option_type")
    .eq("id", id)
    .single();

  if (!existing) {
    return { message: "Option not found." };
  }

  const { error } = await supabase
    .from("store_service_options")
    .update({ name: trimmed })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { message: "An option with this name already exists." };
    }
    return { message: "Failed to update option." };
  }

  if (validateOptionType(existing.option_type)) {
    revalidatePath(TYPE_PATH_MAP[existing.option_type]);
  }
  return { success: true, message: "Option updated." };
}

export async function toggleServiceOption(id: number, isActive: boolean) {
  await requireStore();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("store_service_options")
    .select("option_type")
    .eq("id", id)
    .single();

  if (!existing) {
    return { message: "Option not found." };
  }

  const { error } = await supabase
    .from("store_service_options")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { message: "Failed to update option." };
  }

  if (validateOptionType(existing.option_type)) {
    revalidatePath(TYPE_PATH_MAP[existing.option_type]);
  }
  return { success: true };
}

export async function deleteServiceOption(id: number) {
  await requireStore();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("store_service_options")
    .select("option_type")
    .eq("id", id)
    .single();

  if (!existing) {
    return { message: "Option not found." };
  }

  const { error } = await supabase
    .from("store_service_options")
    .delete()
    .eq("id", id);

  if (error) {
    return { message: "Failed to delete option." };
  }

  if (validateOptionType(existing.option_type)) {
    revalidatePath(TYPE_PATH_MAP[existing.option_type]);
  }
  return { success: true, message: "Option deleted." };
}

export async function bulkImportServiceOptions(
  optionType: string,
  names: string[],
  serviceItemId?: number | null,
) {
  if (!validateOptionType(optionType)) {
    return { message: "Invalid option type." };
  }

  if (!names.length || names.length > 200) {
    return { message: "Please select between 1 and 200 options to import." };
  }

  const membership = await requireStore();
  const supabase = await createClient();

  // Fetch existing names to avoid duplicate key errors
  let query = supabase
    .from("store_service_options")
    .select("name")
    .eq("store_id", membership.store_id)
    .eq("option_type", optionType);

  if (serviceItemId) {
    query = query.eq("service_item_id", serviceItemId);
  } else {
    query = query.is("service_item_id", null);
  }

  const { data: existing } = await query;

  const existingNames = new Set((existing || []).map((e) => e.name));
  const newNames = names
    .map((n) => n.trim())
    .filter((n) => n && !existingNames.has(n));

  if (newNames.length === 0) {
    revalidatePath(TYPE_PATH_MAP[optionType]);
    return { success: true, message: "All selected options already exist." };
  }

  const rows = newNames.map((name) => {
    const row: Record<string, unknown> = {
      store_id: membership.store_id,
      option_type: optionType,
      name,
    };
    if (serviceItemId) row.service_item_id = serviceItemId;
    return row;
  });

  const { error } = await supabase.from("store_service_options").insert(rows);

  if (error) {
    console.error("bulkImportServiceOptions error:", error);
    return { message: `Failed to import options: ${error.message}` };
  }

  revalidatePath(TYPE_PATH_MAP[optionType]);
  return {
    success: true,
    message: `Imported ${newNames.length} option${newNames.length !== 1 ? "s" : ""}.`,
  };
}
