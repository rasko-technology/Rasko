"use server";

import { requireStore, createStoreClient } from "@/app/lib/auth";
import type { ServiceOptionType } from "@/constants/service_option_defaults";

const VALID_TYPES: ServiceOptionType[] = [
  "default_issue",
  "items_received",
  "action_taken",
  "engineer_observation",
  "additional_requirement",
  "customer_note",
];

export async function getProductDefaultOptions(
  catalogProductId: number,
  optionType: string,
): Promise<string[]> {
  if (!VALID_TYPES.includes(optionType as ServiceOptionType)) {
    return [];
  }

  await requireStore();
  const supabase = await createStoreClient();

  const { data } = await supabase
    .from("catalog_product_options")
    .select("name")
    .eq("catalog_product_id", catalogProductId)
    .eq("option_type", optionType)
    .order("name");

  return (data || []).map((d) => d.name);
}
