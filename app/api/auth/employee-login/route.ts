import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { signEmployeeToken } from "@/app/lib/employee-auth";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, store_id } = await request.json();

    if (!identifier || !password || !store_id) {
      return NextResponse.json(
        { error: "Store, username, and password are required." },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Find employee matching the identifier within the selected store
    const trimmed = identifier.trim();
    const { data: matches, error } = await supabase
      .from("employees")
      .select("id, name, username, phone, email, password_hash, store_id")
      .or(
        `username.eq."${trimmed}",email.eq."${trimmed}",phone.eq."${trimmed}"`,
      )
      .eq("store_id", store_id)
      .eq("is_active", true);

    if (error || !matches || matches.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // Verify password against each match (could be username + email matching same person)
    let selected: { id: number; name: string; store_id: number } | null = null;

    for (const emp of matches) {
      const isValid = await bcrypt.compare(password, emp.password_hash);
      if (isValid) {
        selected = { id: emp.id, name: emp.name, store_id: emp.store_id };
        break;
      }
    }

    if (!selected) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
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
