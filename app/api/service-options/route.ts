import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";

// GET /api/service-options?type=default_issue,items_received,additional_requirement
export async function GET(request: NextRequest) {
  const membership = await requireStore();
  const supabase = await createClient();

  const types = request.nextUrl.searchParams.get("type")?.split(",") || [];

  const { data, error } = await supabase
    .from("store_service_options")
    .select("id, option_type, name")
    .eq("store_id", membership.store_id)
    .eq("is_active", true)
    .in("option_type", types)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
