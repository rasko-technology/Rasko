import { getUser, getUserStore } from "@/app/lib/auth";
import { getEmployeeSession } from "@/app/lib/employee-auth";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Topbar } from "@/app/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Try owner auth first
  const user = await getUser();

  if (user) {
    const membership = await getUserStore();
    if (!membership) {
      redirect("/onboarding");
    }

    const store = membership.stores as unknown as {
      id: number;
      name: string;
      logo_url: string | null;
    };

    return (
      <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
        <Sidebar storeName={store.name} isEmployee={false} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            userEmail={user.email || ""}
            storeName={store.name}
            isEmployee={false}
          />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // Try employee session
  const employee = await getEmployeeSession();
  if (!employee) {
    redirect("/login");
  }

  // Get store info for the employee using admin client (bypasses RLS)
  const supabase = createAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("id", employee.store_id)
    .single();

  const storeName = store?.name || "Store";

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <Sidebar storeName={storeName} isEmployee={true} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userEmail={employee.name}
          storeName={storeName}
          isEmployee={true}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
