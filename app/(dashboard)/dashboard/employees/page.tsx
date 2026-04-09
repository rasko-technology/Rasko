import { requireAuth, getUserStore } from "@/app/lib/auth";
import { getEmployeeSession } from "@/app/lib/employee-auth";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmployeeList } from "./EmployeeList";

export default async function EmployeesPage() {
  // Block employee access — only owners can manage employees
  const employee = await getEmployeeSession();
  if (employee) {
    redirect("/dashboard");
  }

  const user = await requireAuth();
  const membership = await getUserStore();
  if (!membership) redirect("/onboarding");
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, username, phone, email, is_active, created_at")
    .eq("store_id", membership.store_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Employees
          </h1>
          <p className="text-surface-500 mt-1">
            Manage your field team members. Share your store code:{" "}
            <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">
              {membership.store_id}
            </span>
          </p>
        </div>
      </div>
      <EmployeeList employees={employees || []} storeId={membership.store_id} />
    </div>
  );
}
