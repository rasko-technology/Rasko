import { requireStore, createStoreClient } from "@/app/lib/auth";
import { ServiceOptionManager } from "@/app/components/service/ServiceOptionManager";
import { SERVICE_OPTION_LABELS } from "@/constants/service_option_defaults";
import type { ServiceOptionType } from "@/constants/service_option_defaults";

export default async function AdditionalRequirementsPage() {
  const optionType: ServiceOptionType = "additional_requirement";
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [{ data: options }, { data: catalogItems }, { data: customItems }] =
    await Promise.all([
      supabase
        .from("store_service_options")
        .select("id, name, is_active, created_at, service_item_id")
        .eq("store_id", membership.store_id)
        .eq("option_type", optionType)
        .order("created_at", { ascending: true }),
      supabase
        .from("store_service_items")
        .select(
          "id, catalog_product_id, catalog_products(name, catalog_categories(name))",
        )
        .eq("store_id", membership.store_id)
        .not("catalog_product_id", "is", null)
        .order("added_at", { ascending: false }),
      supabase
        .from("store_service_items")
        .select("id, custom_product_name, custom_category_name")
        .eq("store_id", membership.store_id)
        .not("custom_product_name", "is", null)
        .order("added_at", { ascending: false }),
    ]);

  type CatalogItem = {
    id: number;
    catalog_product_id: number;
    catalog_products: {
      name: string;
      catalog_categories: { name: string } | null;
    };
  };
  type CustomItem = {
    id: number;
    custom_product_name: string;
    custom_category_name: string | null;
  };

  const storeProducts = [
    ...((catalogItems as unknown as CatalogItem[]) || []).map((i) => ({
      id: i.id,
      name: i.catalog_products?.name ?? "Unknown",
      category: i.catalog_products?.catalog_categories?.name ?? null,
      catalogProductId: i.catalog_product_id as number | null,
    })),
    ...((customItems as unknown as CustomItem[]) || []).map((i) => ({
      id: i.id,
      name: i.custom_product_name,
      category: i.custom_category_name ?? null,
      catalogProductId: null as number | null,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight">
          {SERVICE_OPTION_LABELS[optionType]}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Manage additional requirement options for job card service notes
        </p>
      </div>
      <ServiceOptionManager
        options={(options as never[]) || []}
        optionType={optionType}
        title={SERVICE_OPTION_LABELS[optionType]}
        createLabel="Create Requirement Option"
        storeProducts={storeProducts}
      />
    </div>
  );
}
