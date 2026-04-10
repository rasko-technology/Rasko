import { requireStore, createStoreClient } from "@/app/lib/auth";
import { EditLeadForm } from "./EditLeadForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const [{ data: lead }, { data: employees }] = await Promise.all([
    supabase
      .from("leads")
      .select("*, customers(id, name, phone, address, city)")
      .eq("id", parseInt(id))
      .eq("store_id", membership.store_id)
      .single(),
    supabase
      .from("employees")
      .select("id, name")
      .eq("store_id", membership.store_id)
      .eq("is_active", true)
      .order("name"),
  ]);

  if (!lead) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Edit Lead
          </h1>
          <p className="text-surface-500 mt-1">
            Update lead #{lead.id} — {lead.customers?.name}
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="px-4 py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          ← Back to Summary
        </Link>
      </div>
      <EditLeadForm lead={lead} employees={employees || []} />
    </div>
  );
}
