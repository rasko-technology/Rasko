import { requireStore, createStoreClient } from "@/app/lib/auth";
import { CustomerManager } from "./CustomerManager";

export default async function CustomersPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Customers
        </h1>
        <p className="text-surface-500 mt-1">Manage your customer database</p>
      </div>
      <CustomerManager customers={customers || []} />
    </div>
  );
}
