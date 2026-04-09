import { requireStore, createStoreClient } from "@/app/lib/auth";
import { LeadSummary } from "./LeadSummary";

export default async function LeadSummaryPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [{ data: leads }, { data: employees }] = await Promise.all([
    supabase
      .from("leads")
      .select("*, customers(id, name, phone, city)")
      .eq("store_id", membership.store_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("employees")
      .select("id, name")
      .eq("store_id", membership.store_id)
      .eq("is_active", true)
      .order("name"),
  ]);

  return <LeadSummary leads={leads || []} employees={employees || []} />;
}
