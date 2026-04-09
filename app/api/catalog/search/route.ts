import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await requireStore();

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalog_products")
    .select(
      "id, name, category:catalog_categories(name), catalog_product_brands(catalog_brands(id, name))",
    )
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
