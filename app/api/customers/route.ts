import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { requireStore } from "@/app/lib/auth";

// GET /api/customers — list all customers (supports ?search= query)
export async function GET(request: NextRequest) {
  const membership = await requireStore();
  const supabase = await createClient();

  const search = request.nextUrl.searchParams.get("search");

  let query = supabase
    .from("customers")
    .select(
      "id, name, phone, email, address, landmark, city, pincode, gst_number, notes, address_lat, address_lng, full_address, created_at",
    )
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/customers — create a new customer
export async function POST(request: NextRequest) {
  const membership = await requireStore();
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      store_id: membership.store_id,
      name: body.name.trim(),
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      landmark: body.landmark || null,
      city: body.city || null,
      pincode: body.pincode || null,
      gst_number: body.gst_number || null,
      notes: body.notes || null,
      address_lat: body.address_lat ? parseFloat(body.address_lat) : null,
      address_lng: body.address_lng ? parseFloat(body.address_lng) : null,
      full_address: body.full_address || null,
    })
    .select("id, name, phone, email")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
