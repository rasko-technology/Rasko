import "server-only";
import { createClient } from "@/app/lib/supabase/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { getEmployeeSession } from "@/app/lib/employee-auth";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getUserStore() {
  const supabase = await createClient();
  const user = await requireAuth();

  const { data: membership } = await supabase
    .from("store_members")
    .select("store_id, role, stores(*)")
    .eq("user_id", user.id)
    .single();

  return membership;
}

export async function requireStore() {
  // Try owner auth first
  const user = await getUser();

  if (user) {
    const supabase = await createClient();
    const { data: membership } = await supabase
      .from("store_members")
      .select("store_id, role, stores(*)")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      redirect("/onboarding");
    }
    return membership;
  }

  // Try employee session
  const employee = await getEmployeeSession();
  if (employee) {
    return {
      store_id: employee.store_id,
      role: "employee" as const,
      stores: { id: employee.store_id, name: employee.name },
    };
  }

  redirect("/login");
}

/**
 * Returns a Supabase client appropriate for the current auth type.
 * Owner: cookie-based client (RLS uses auth.uid()).
 * Employee: admin client (bypasses RLS, queries filtered by store_id manually).
 */
export async function createStoreClient(): Promise<SupabaseClient> {
  const user = await getUser();
  if (user) {
    return createClient();
  }
  return createAdminClient();
}
