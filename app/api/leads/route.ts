import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/app/lib/supabase/server"
import { requireStore } from "@/app/lib/auth"

// GET /api/leads
export async function GET(request: NextRequest) {
  const membership = await requireStore()
  const supabase = await createClient()

  const status = request.nextUrl.searchParams.get("status")

  let query = supabase
    .from("leads")
    .select("*")
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/leads
export async function POST(request: NextRequest) {
  const membership = await requireStore()
  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("leads")
    .insert({
      store_id: membership.store_id,
      name: body.name.trim(),
      phone: body.phone || null,
      email: body.email || null,
      source: body.source || "manual",
      status: "new",
      notes: body.notes || null,
    })
    .select("id, name, phone, status")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
