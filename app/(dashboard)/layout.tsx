import { getUser, getUserStore } from "@/app/lib/auth";
import { getEmployeeSession } from "@/app/lib/employee-auth";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Topbar } from "@/app/components/layout/Topbar";
import { TrialExpiredBanner } from "@/app/components/layout/TrialExpiredBanner";
import { SWRProvider } from "@/app/lib/swr-provider";

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

    // Fetch subscription for trial banner
    const supabaseServer = await createClient();
    const { data: subscription } = await supabaseServer
      .from("subscriptions")
      .select("plan, status, trial_end_date")
      .eq("store_id", membership.store_id)
      .single();

    return (
      <SWRProvider>
        <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
          <Sidebar
            storeName={store.name}
            storeLogo={store.logo_url}
            isEmployee={false}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar
              userEmail={user.email || ""}
              storeName={store.name}
              storeLogo={store.logo_url}
              isEmployee={false}
            />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="mx-auto max-w-7xl animate-fade-in">
                <TrialExpiredBanner
                  trialEndDate={subscription?.trial_end_date || null}
                  plan={subscription?.plan || "free_trial"}
                  status={subscription?.status || "active"}
                />
                {children}
              </div>
            </main>
          </div>
        </div>
      </SWRProvider>
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
    .select("id, name, logo_url")
    .eq("id", employee.store_id)
    .single();

  const storeName = store?.name || "Store";

  return (
    <SWRProvider>
      <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
        <Sidebar
          storeName={storeName}
          storeLogo={store?.logo_url || null}
          isEmployee={true}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            userEmail={employee.name}
            storeName={storeName}
            storeLogo={store?.logo_url || null}
            isEmployee={true}
          />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </SWRProvider>
  );
}
