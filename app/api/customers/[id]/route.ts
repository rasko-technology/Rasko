import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/app/lib/supabase/server"
import { requireStore } from "@/app/lib/auth"

// GET /api/customers/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStore()
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", parseInt(id))
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/customers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStore()
  const { id } = await params
  const body = await request.json()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: body.name?.trim() || undefined,
      phone: body.phone ?? undefined,
      email: body.email ?? undefined,
      address: body.address ?? undefined,
      city: body.city ?? undefined,
      pincode: body.pincode ?? undefined,
      gst_number: body.gst_number ?? undefined,
      notes: body.notes ?? undefined,
    })
    .eq("id", parseInt(id))
    .select("id, name, phone, email")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/customers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStore()
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", parseInt(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
