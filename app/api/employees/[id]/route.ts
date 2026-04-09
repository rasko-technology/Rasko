import { NextResponse, type NextRequest } from "next/server";
import { requireStore, createStoreClient } from "@/app/lib/auth";
import bcrypt from "bcryptjs";

// PATCH /api/employees/[id] — update employee (name, username, phone, email, password, is_active)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const membership = await requireStore();

  // Only owners can edit employees
  if (membership.role === "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.username !== undefined) updates.username = body.username.trim();
  if (body.phone !== undefined) updates.phone = body.phone || null;
  if (body.email !== undefined) updates.email = body.email || null;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  // Password update — hash the new password
  if (body.password && body.password.trim().length >= 6) {
    updates.password_hash = await bcrypt.hash(body.password.trim(), 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update." },
      { status: 400 },
    );
  }

  updates.updated_at = new Date().toISOString();

  const supabase = await createStoreClient();
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", parseInt(id))
    .eq("store_id", membership.store_id)
    .select("id, name, username, phone, email, is_active")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Username already exists in this store." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/employees/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const membership = await requireStore();

  if (membership.role === "employee") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createStoreClient();

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", parseInt(id))
    .eq("store_id", membership.store_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
