import { requireStore, createStoreClient } from "@/app/lib/auth";
import { notFound } from "next/navigation";
import { EditJobCardForm } from "./EditJobCardForm";

export default async function EditJobCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [{ data: jobcard }, { data: employees }, { data: serviceOptions }] =
    await Promise.all([
      supabase
        .from("jobcards")
        .select("*, customers(phone)")
        .eq("id", parseInt(id))
        .eq("store_id", membership.store_id)
        .single(),
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
          "engineer_observation",
          "customer_note",
          "action_taken",
        ])
        .order("name"),
    ]);

  if (!jobcard) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Edit Job Card #{jobcard.id}
          </h1>
          <p className="text-surface-500 mt-1">
            {jobcard.customer_name} &middot;{" "}
            {jobcard.product_name || "No product"}
          </p>
        </div>
        <a
          href="/dashboard/jobcards"
          className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          &larr; Back to List
        </a>
      </div>

      <EditJobCardForm
        jobcard={jobcard}
        employees={employees || []}
        serviceOptions={serviceOptions || []}
      />
    </div>
  );
}
