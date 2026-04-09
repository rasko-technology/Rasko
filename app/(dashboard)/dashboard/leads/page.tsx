import { requireStore, createStoreClient } from "@/app/lib/auth";
import { LeadSummary } from "./LeadSummary";

export default async function LeadSummaryPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  return <LeadSummary leads={data || []} />;
}
