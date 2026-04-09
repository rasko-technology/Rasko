import { requireAuth, getUserStore } from "@/app/lib/auth";
import { getEmployeeSession } from "@/app/lib/employee-auth";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { SettingsManager } from "./SettingsManager";

export default async function SettingsPage() {
  // Only owners can access settings
  const employee = await getEmployeeSession();
  if (employee) redirect("/dashboard");

  const user = await requireAuth();
  const membership = await getUserStore();
  if (!membership) redirect("/onboarding");

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", membership.store_id)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Settings
        </h1>
        <p className="text-surface-500 mt-1">
          Manage your store and account settings
        </p>
      </div>
      <SettingsManager store={store} ownerEmail={user.email || ""} />
    </div>
  );
}
