import { requireStore, createStoreClient } from "@/app/lib/auth";

export default async function DashboardPage() {
  const membership = await requireStore();
  const storeId = membership.store_id;
  const supabase = await createStoreClient();

  // Fetch counts
  const [leadsRes, bookingsRes, jobcardsRes, employeesRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
    supabase
      .from("jobcards")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
    supabase
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId),
  ]);

  const stats = [
    {
      name: "Total Leads",
      value: leadsRes.count || 0,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Active Bookings",
      value: bookingsRes.count || 0,
      icon: "📅",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      name: "Job Cards",
      value: jobcardsRes.count || 0,
      icon: "📋",
      color: "from-amber-500 to-amber-600",
    },
    {
      name: "Employees",
      value: employeesRes.count || 0,
      icon: "👷",
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-surface-500 mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 shadow-sm hover:shadow-md transition-shadow animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">
                  {stat.name}
                </p>
                <p className="text-3xl font-bold text-surface-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${stat.color}`}
            />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Create Lead", href: "/dashboard/leads/new", icon: "➕" },
              {
                name: "Create Booking",
                href: "/dashboard/bookings/new",
                icon: "📅",
              },
              {
                name: "Create Job Card",
                href: "/dashboard/jobcards/new",
                icon: "📋",
              },
              {
                name: "Add Employee",
                href: "/dashboard/employees",
                icon: "👤",
              },
            ].map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors group"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300 group-hover:text-surface-900 dark:group-hover:text-white transition-colors">
                  {action.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Getting Started
          </h2>
          <div className="space-y-3">
            {[
              { step: "1", text: "Add your employees", done: false },
              { step: "2", text: "Capture incoming leads", done: false },
              { step: "3", text: "Book service requests", done: false },
              { step: "4", text: "Track repairs with job cards", done: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                    {item.step}
                  </span>
                </div>
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
