import { requireStore, createStoreClient } from "@/app/lib/auth";
import { JobCardForm } from "./JobCardForm";

export default async function NewJobCardPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [{ data: employees }, { data: serviceOptions }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name")
      .eq("store_id", membership.store_id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("store_service_options")
      .select("id, option_type, name, service_item_id")
      .eq("store_id", membership.store_id)
      .eq("is_active", true)
      .in("option_type", [
        "items_received",
        "default_issue",
        "additional_requirement",
      ])
      .order("name"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Create Job Card
          </h1>
          <p className="text-surface-500 mt-1">
            Fill in device and service details
          </p>
        </div>
        <a
          href="/dashboard/jobcards"
          className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          ← Back to List
        </a>
      </div>

      <JobCardForm
        employees={employees || []}
        serviceOptions={serviceOptions || []}
      />
    </div>
  );
}
