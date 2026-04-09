"use server";

import { requireStore, createStoreClient } from "@/app/lib/auth";
import { revalidatePath } from "next/cache";

export async function addServiceItem(catalogProductId: number) {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data: serviceItem, error } = await supabase
    .from("store_service_items")
    .insert({
      store_id: membership.store_id,
      catalog_product_id: catalogProductId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { message: "This product is already in your service list." };
    }
    return { message: "Failed to add service item." };
  }

  // Auto-import all catalog default options for this product
  const { data: defaults } = await supabase
    .from("catalog_product_options")
    .select("option_type, name")
    .eq("catalog_product_id", catalogProductId);

  if (defaults && defaults.length > 0) {
    const rows = defaults.map((d) => ({
      store_id: membership.store_id,
      option_type: d.option_type,
      name: d.name,
      service_item_id: serviceItem.id,
    }));

    // Insert in batches of 500 to avoid payload limits
    for (let i = 0; i < rows.length; i += 500) {
      await supabase
        .from("store_service_options")
        .insert(rows.slice(i, i + 500))
        .then(({ error: insertErr }) => {
          if (insertErr) {
            console.error("Auto-import options error:", insertErr.message);
          }
        });
    }
  }

  revalidatePath("/dashboard/service/service-items");
  revalidatePath("/dashboard/service/default-issues");
  revalidatePath("/dashboard/service/items-received");
  revalidatePath("/dashboard/service/action-taken");
  revalidatePath("/dashboard/service/engineer-observation");
  revalidatePath("/dashboard/service/additional-requirements");
  revalidatePath("/dashboard/service/customer-note");
  return {
    success: true,
    message: `Product added with ${defaults?.length ?? 0} default options imported.`,
  };
}

export async function removeServiceItem(id: number) {
  await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase
    .from("store_service_items")
    .delete()
    .eq("id", id);

  if (error) {
    return { message: "Failed to remove service item." };
  }

  revalidatePath("/dashboard/service/service-items");
  return { success: true, message: "Product removed from service list." };
}

export async function addCustomProduct(name: string, categoryName?: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 200) {
    return { message: "Product name must be between 1 and 200 characters." };
  }

  const trimmedCategory = categoryName?.trim() || null;
  if (trimmedCategory && trimmedCategory.length > 100) {
    return { message: "Category name must be under 100 characters." };
  }

  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase.from("store_service_items").insert({
    store_id: membership.store_id,
    custom_product_name: trimmed,
    custom_category_name: trimmedCategory,
  });

  if (error) {
    if (error.code === "23505") {
      return { message: "A custom product with this name already exists." };
    }
    return { message: "Failed to add custom product." };
  }

  revalidatePath("/dashboard/service/service-items");
  return { success: true, message: `Custom product "${trimmed}" added.` };
}

export async function addCustomBrand(catalogProductId: number, name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 100) {
    return { message: "Brand name must be between 1 and 100 characters." };
  }

  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase.from("store_custom_brands").insert({
    store_id: membership.store_id,
    catalog_product_id: catalogProductId,
    name: trimmed,
  });

  if (error) {
    if (error.code === "23505") {
      return { message: "This brand already exists for this product." };
    }
    return { message: "Failed to add custom brand." };
  }

  revalidatePath("/dashboard/service/service-items");
  return { success: true, message: `Brand "${trimmed}" added.` };
}

export async function addCustomProductBrand(
  serviceItemId: number,
  name: string,
) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 100) {
    return { message: "Brand name must be between 1 and 100 characters." };
  }

  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase.from("store_custom_brands").insert({
    store_id: membership.store_id,
    service_item_id: serviceItemId,
    name: trimmed,
  });

  if (error) {
    if (error.code === "23505") {
      return { message: "This brand already exists for this product." };
    }
    return { message: "Failed to add brand." };
  }

  revalidatePath("/dashboard/service/service-items");
  return { success: true, message: `Brand "${trimmed}" added.` };
}

export async function removeCustomBrand(id: number) {
  await requireStore();
  const supabase = await createStoreClient();

  const { error } = await supabase
    .from("store_custom_brands")
    .delete()
    .eq("id", id);

  if (error) {
    return { message: "Failed to remove custom brand." };
  }

  revalidatePath("/dashboard/service/service-items");
  return { success: true, message: "Custom brand removed." };
}
