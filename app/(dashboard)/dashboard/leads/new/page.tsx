import { requireStore, createStoreClient } from "@/app/lib/auth";
import { CreateLeadForm } from "./CreateLeadForm";

export default async function CreateLeadPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("store_id", membership.store_id)
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Create Lead
          </h1>
          <p className="text-surface-500 mt-1">Add a new sales lead</p>
        </div>
        <a
          href="/dashboard/leads"
          className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          ← Back to Summary
        </a>
      </div>
      <CreateLeadForm employees={employees || []} />
    </div>
  );
}
