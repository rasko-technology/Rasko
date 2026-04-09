import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";

// GET /api/auth/employee-login/stores — public list of store names for employee login
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load stores." },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
