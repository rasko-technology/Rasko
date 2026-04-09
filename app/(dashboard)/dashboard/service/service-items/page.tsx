import { requireStore, createStoreClient } from "@/app/lib/auth";
import { ServiceItemsManager } from "./ServiceItemsManager";

export default async function ServiceItemsPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [
    { data: items },
    { data: catalogBrands },
    { data: customItems },
    { data: customProductBrandsRaw },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("store_service_items")
      .select(
        "id, catalog_product_id, added_at, catalog_products(id, name, catalog_categories(name), catalog_product_brands(catalog_brands(id, name)))",
      )
      .eq("store_id", membership.store_id)
      .not("catalog_product_id", "is", null)
      .order("added_at", { ascending: false }),
    supabase
      .from("store_custom_brands")
      .select("id, name, catalog_product_id")
      .eq("store_id", membership.store_id)
      .not("catalog_product_id", "is", null)
      .order("name"),
    supabase
      .from("store_service_items")
      .select("id, custom_product_name, custom_category_name, added_at")
      .eq("store_id", membership.store_id)
      .not("custom_product_name", "is", null)
      .order("added_at", { ascending: false }),
    supabase
      .from("store_custom_brands")
      .select("id, name, service_item_id")
      .eq("store_id", membership.store_id)
      .not("service_item_id", "is", null)
      .order("name"),
    supabase.from("catalog_categories").select("name").order("name"),
  ]);

  // Group catalog product brands by catalog_product_id
  const customBrandsByProduct: Record<
    number,
    Array<{ id: number; name: string }>
  > = {};
  if (catalogBrands) {
    for (const b of catalogBrands as Array<{
      id: number;
      name: string;
      catalog_product_id: number;
    }>) {
      if (!customBrandsByProduct[b.catalog_product_id])
        customBrandsByProduct[b.catalog_product_id] = [];
      customBrandsByProduct[b.catalog_product_id].push({
        id: b.id,
        name: b.name,
      });
    }
  }

  // Group custom product brands by service_item_id
  const brandsByServiceItem: Record<
    number,
    Array<{ id: number; name: string }>
  > = {};
  if (customProductBrandsRaw) {
    for (const b of customProductBrandsRaw as Array<{
      id: number;
      name: string;
      service_item_id: number;
    }>) {
      if (!brandsByServiceItem[b.service_item_id])
        brandsByServiceItem[b.service_item_id] = [];
      brandsByServiceItem[b.service_item_id].push({
        id: b.id,
        name: b.name,
      });
    }
  }

  const categoryNames =
    (categories as Array<{ name: string }> | null)?.map((c) => c.name) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          Service Products
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage the products your store provides service and repairs for
        </p>
      </div>

      <ServiceItemsManager
        items={(items as never[]) || []}
        customItems={(customItems as never[]) || []}
        customBrandsByProduct={customBrandsByProduct}
        brandsByServiceItem={brandsByServiceItem}
        categoryNames={categoryNames}
      />
    </div>
  );
}
