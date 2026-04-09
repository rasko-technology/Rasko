import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { signEmployeeToken } from "@/app/lib/employee-auth";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, store_id } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Credentials are required." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Find employees matching the identifier (username, email, or phone)
    const trimmed = identifier.trim();
    const { data: matches, error } = await supabase
      .from("employees")
      .select(
        "id, name, username, phone, email, password_hash, store_id, is_active, stores(id, name)",
      )
      .or(
        `username.eq."${trimmed}",email.eq."${trimmed}",phone.eq."${trimmed}"`,
      )
      .eq("is_active", true);

    if (error || !matches || matches.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // Verify password against each match and collect valid ones
    const validEmployees: Array<{
      id: number;
      name: string;
      store_id: number;
      store_name: string;
    }> = [];

    for (const emp of matches) {
      const isValid = await bcrypt.compare(password, emp.password_hash);
      if (isValid) {
        const store = emp.stores as unknown as {
          id: number;
          name: string;
        } | null;
        validEmployees.push({
          id: emp.id,
          name: emp.name,
          store_id: emp.store_id,
          store_name: store?.name || `Store #${emp.store_id}`,
        });
      }
    }

    if (validEmployees.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // If store_id specified, pick that store
    let selected = validEmployees[0];
    if (store_id) {
      const match = validEmployees.find((e) => e.store_id === store_id);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid store selection." },
          { status: 400 },
        );
      }
      selected = match;
    } else if (validEmployees.length > 1) {
      // Multiple stores — ask user to pick
      return NextResponse.json({
        needs_store_selection: true,
        stores: validEmployees.map((e) => ({
          store_id: e.store_id,
          store_name: e.store_name,
        })),
      });
    }

    // Sign JWT token
    const token = await signEmployeeToken({
      employee_id: selected.id,
      store_id: selected.store_id,
      name: selected.name,
    });

    const response = NextResponse.json({
      success: true,
      employee: { id: selected.id, name: selected.name },
    });

    response.cookies.set("employee_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
