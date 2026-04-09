import { requireStore, createStoreClient } from "@/app/lib/auth";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  in_progress:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  completed:
    "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  closed:
    "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  high: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  urgent: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default async function JobCardsPage() {
  const membership = await requireStore();
  const supabase = await createStoreClient();

  const { data: jobcards } = await supabase
    .from("jobcards")
    .select(
      "id, customer_name, phone, product_name, brand, model_name, status, priority, assigned_to, employee_id, payment_type, incoming_source, estimation_amount, created_at, employees!jobcards_assigned_to_fkey(name)",
    )
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Job Cards
          </h1>
          <p className="text-surface-500 mt-1">Field service work orders</p>
        </div>
        <Link
          href="/dashboard/jobcards/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-600/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create Job Card
        </Link>
      </div>

      {/* Job Cards Table */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-sm overflow-hidden">
        {!jobcards || jobcards.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto w-12 h-12 text-surface-300 dark:text-surface-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.049 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
              />
            </svg>
            <p className="text-surface-500 text-sm">
              No job cards yet. Create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    #
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Product
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Priority
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400">
                    Date
                  </th>
                  <th className="px-4 py-3 font-medium text-surface-500 dark:text-surface-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {jobcards.map((jc) => {
                  const employee = jc.employees as unknown as {
                    name: string;
                  } | null;
                  return (
                    <tr
                      key={jc.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-primary-600 dark:text-primary-400">
                        {jc.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-surface-900 dark:text-white">
                          {jc.customer_name}
                        </div>
                        {jc.phone && (
                          <div className="text-xs text-surface-400 mt-0.5">
                            {jc.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-surface-900 dark:text-white">
                          {jc.product_name || "—"}
                        </div>
                        {jc.brand && (
                          <div className="text-xs text-surface-400 mt-0.5">
                            {jc.brand} {jc.model_name || ""}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                        {employee?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {jc.estimation_amount > 0 ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            ₹{jc.estimation_amount}
                          </span>
                        ) : (
                          <span className="text-surface-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {jc.priority && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_COLORS[jc.priority] || ""}`}
                          >
                            {jc.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[jc.status] || ""}`}
                        >
                          {jc.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">
                        {new Date(jc.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/jobcards/${jc.id}/edit`}
                          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
