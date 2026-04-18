import { requireStore, createStoreClient } from "@/app/lib/auth";
import Link from "next/link";
import {
  PhoneCall,
  Calendar,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";

const STATUS_DOT: Record<string, string> = {
  open: "bg-blue-400",
  in_progress: "bg-yellow-400",
  completed: "bg-emerald-400",
  closed: "bg-surface-500",
  forwarded: "bg-purple-400",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
  forwarded: "Forwarded",
};

const STATUS_TEXT: Record<string, string> = {
  open: "text-blue-400",
  in_progress: "text-yellow-400",
  completed: "text-emerald-400",
  closed: "text-surface-500",
  forwarded: "text-purple-400",
};

export default async function DashboardPage() {
  const membership = await requireStore();
  const storeId = membership.store_id;
  const supabase = await createStoreClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    openLeadsRes,
    todayBookingsRes,
    activeJobsRes,
    assignedBookingsRes,
    pendingJobsRes,
    recentJobsRes,
  ] = await Promise.all([
    // Open leads (not converted/closed/lost)
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .not("status", "in", '("converted","closed","lost","cancelled")'),

    // Today's bookings
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString()),

    // Active jobs (open or in_progress)
    supabase
      .from("jobcards")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .in("status", ["open", "in_progress"]),

    // Assigned bookings today (for sub-label)
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .not("assigned_to", "is", null)
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString()),

    // Pending jobs count
    supabase
      .from("jobcards")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "open"),

    // Recent 6 job cards
    supabase
      .from("jobcards")
      .select(
        "id, customer_name, product_name, brand, status, created_at, employees!jobcards_assigned_to_fkey(name)",
      )
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const stats = [
    {
      label: "Open Leads",
      value: openLeadsRes.count ?? 0,
      sub: `${openLeadsRes.count ?? 0} active`,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      href: "/dashboard/leads",
    },
    {
      label: "Today's Bookings",
      value: todayBookingsRes.count ?? 0,
      sub: `${assignedBookingsRes.count ?? 0} assigned`,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      href: "/dashboard/bookings",
    },
    {
      label: "Active Jobs",
      value: activeJobsRes.count ?? 0,
      sub: `${pendingJobsRes.count ?? 0} pending`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      href: "/dashboard/jobcards",
    },
  ];

  const recentJobs = recentJobsRes.data ?? [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative ${stat.bg} border ${stat.border} rounded-2xl p-5 hover:brightness-110 transition-all`}
          >
            <p className="text-sm text-surface-400 mb-2">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color} mb-1`}>
              {stat.value}
            </p>
            <p className="text-xs text-surface-500">{stat.sub}</p>
            <ArrowRight
              className={`absolute top-5 right-5 w-4 h-4 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </Link>
        ))}
      </div>

      {/* Recent Jobs + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Jobs — takes 3 cols */}
        <div className="lg:col-span-3 bg-surface-900/60 border border-surface-800/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/60">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
              Recent Jobs
            </h2>
            <Link
              href="/dashboard/jobcards"
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="px-5 py-10 text-center text-surface-500 text-sm">
              No job cards yet.{" "}
              <Link
                href="/dashboard/jobcards/new"
                className="text-primary-400 hover:text-primary-300"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-800/60">
              {recentJobs.map((job) => {
                const status = job.status as string;
                const employeeName = Array.isArray(job.employees)
                  ? (job.employees[0] as { name: string } | undefined)?.name
                  : (job.employees as { name: string } | null)?.name;

                return (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobcards/${job.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-800/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-surface-600 shrink-0">
                        JC-{job.id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {job.customer_name}
                        </p>
                        <p className="text-xs text-surface-500 truncate">
                          {[job.brand, job.product_name]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {employeeName && (
                        <span className="hidden sm:block text-xs text-surface-600 truncate max-w-24">
                          {employeeName}
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1.5 text-xs ${STATUS_TEXT[status] ?? "text-surface-400"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status] ?? "bg-surface-500"}`}
                        />
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions — takes 2 cols */}
        <div className="lg:col-span-2 bg-surface-900/60 border border-surface-800/60 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-800/60">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-surface-400">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "New Lead",
                icon: PhoneCall,
                href: "/dashboard/leads/new",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Book Service",
                icon: Calendar,
                href: "/dashboard/bookings/new",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                label: "Create Job Card",
                icon: FileText,
                href: "/dashboard/jobcards/new",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                label: "View Reports",
                icon: TrendingUp,
                href: "/dashboard",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
              },
            ].map(({ label, icon: Icon, href, color, bg }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors group"
              >
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm font-medium text-surface-300 group-hover:text-white transition-colors">
                  {label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-surface-600 group-hover:text-surface-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>

          {/* Today's summary */}
          <div className="mx-4 mb-4 p-4 rounded-xl bg-primary-600/10 border border-primary-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                Today
              </span>
            </div>
            <p className="text-sm text-surface-300">
              <span className="font-bold text-white">
                {todayBookingsRes.count ?? 0}
              </span>{" "}
              bookings &amp;{" "}
              <span className="font-bold text-white">
                {activeJobsRes.count ?? 0}
              </span>{" "}
              active jobs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
