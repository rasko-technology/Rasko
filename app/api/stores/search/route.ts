import { NextResponse, type NextRequest } from "next/server";
import { requireStore } from "@/app/lib/auth";
import { createAdminClient } from "@/app/lib/supabase/admin";

// GET /api/stores/search?q=... — search stores by name, city, or phone
export async function GET(request: NextRequest) {
  const membership = await requireStore();
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  // Use admin client to search across all stores (not just the user's)
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, address, city, phone")
    .neq("id", membership.store_id) // exclude current store
    .or(`name.ilike.%${q}%,city.ilike.%${q}%,phone.ilike.%${q}%`)
    .order("name")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
