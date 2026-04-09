import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/app/lib/supabase/server"
import { requireStore } from "@/app/lib/auth"

// GET /api/jobcards — list job cards
export async function GET(request: NextRequest) {
  const membership = await requireStore()
  const supabase = await createClient()

  const status = request.nextUrl.searchParams.get("status")
  const search = request.nextUrl.searchParams.get("search")

  let query = supabase
    .from("jobcards")
    .select("id, customer_name, phone, product_name, brand, model_name, status, priority, payment_type, incoming_source, estimation_amount, advance_amount, created_at, employees(name), customers(id, name, phone)")
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone.ilike.%${search}%,product_name.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// PATCH /api/jobcards — update job card status
export async function PATCH(request: NextRequest) {
  await requireStore()
  const body = await request.json()

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("jobcards")
    .update({ status: body.status })
    .eq("id", body.id)
    .select("id, status")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
