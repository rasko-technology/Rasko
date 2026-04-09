import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";

// GET /api/products?search=<term> — returns products the store has added via store_service_items
export async function GET(request: NextRequest) {
  const membership = await requireStore();
  const supabase = await createClient();
  const search = request.nextUrl.searchParams
    .get("search")
    ?.toLowerCase()
    ?.trim();

  // Fetch store's service items with catalog product + category info
  let query = supabase
    .from("store_service_items")
    .select(
      `
      id,
      catalog_product_id,
      custom_product_name,
      custom_category_name,
      catalog_products (
        id,
        name,
        category_id,
        catalog_categories ( name ),
        catalog_product_brands ( catalog_brands ( name ) )
      )
    `,
    )
    .eq("store_id", membership.store_id)
    .order("added_at", { ascending: false });

  const { data: serviceItems, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch store's custom brands
  const { data: customBrands } = await supabase
    .from("store_custom_brands")
    .select("catalog_product_id, name")
    .eq("store_id", membership.store_id);

  const customBrandMap = new Map<number, string[]>();
  for (const cb of customBrands || []) {
    const existing = customBrandMap.get(cb.catalog_product_id) || [];
    existing.push(cb.name);
    customBrandMap.set(cb.catalog_product_id, existing);
  }

  // Fetch store's default_issue options keyed by service_item_id
  const { data: issueOptions } = await supabase
    .from("store_service_options")
    .select("service_item_id, name")
    .eq("store_id", membership.store_id)
    .eq("option_type", "default_issue")
    .eq("is_active", true);

  const issueMap = new Map<number, string[]>();
  for (const opt of issueOptions || []) {
    if (!opt.service_item_id) continue;
    const existing = issueMap.get(opt.service_item_id) || [];
    existing.push(opt.name);
    issueMap.set(opt.service_item_id, existing);
  }

  // Build results
  type CatalogProduct = {
    id: number;
    name: string;
    category_id: number;
    catalog_categories: { name: string } | null;
    catalog_product_brands: { catalog_brands: { name: string } | null }[];
  };

  const results: {
    serviceItemId: number;
    productName: string;
    brandNames: string[];
    issues: string[];
    category: string;
  }[] = [];

  for (const item of serviceItems || []) {
    if (item.catalog_product_id && item.catalog_products) {
      const product = item.catalog_products as unknown as CatalogProduct;
      const productName = product.name;
      const category = product.catalog_categories?.name || "Uncategorized";

      // Catalog brands
      const brandNames = (product.catalog_product_brands || [])
        .map((pb) => pb.catalog_brands?.name)
        .filter(Boolean) as string[];

      // Add custom brands
      const storeBrands = customBrandMap.get(product.id) || [];
      brandNames.push(...storeBrands);

      const issues = issueMap.get(item.id) || [];

      results.push({
        serviceItemId: item.id,
        productName,
        brandNames,
        issues,
        category,
      });
    } else if (item.custom_product_name) {
      // Custom product (not in catalog)
      results.push({
        serviceItemId: item.id,
        productName: item.custom_product_name,
        brandNames: [],
        issues: issueMap.get(item.id) || [],
        category: item.custom_category_name || "Custom",
      });
    }
  }

  // Filter by search term
  if (search && search.length >= 1) {
    const filtered = results.filter((p) =>
      p.productName.toLowerCase().includes(search),
    );
    return NextResponse.json(filtered.slice(0, 20));
  }

  return NextResponse.json(results.slice(0, 20));
}
