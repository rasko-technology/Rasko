import { requireStore, createStoreClient } from "@/app/lib/auth";
import { BookingSummary } from "./BookingSummary";

export default async function BookingSummaryPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      "*, customer:customers(id, name, phone, email, address, landmark, city, pincode)",
    )
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  return <BookingSummary bookings={data || []} />;
}
