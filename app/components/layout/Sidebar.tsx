"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
        />
      </svg>
    ),
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
  {
    name: "Job Cards",
    href: "/dashboard/jobcards",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m5.25 2.25a8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 16.5 0Z"
        />
      </svg>
    ),
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
];

// Collapsible sections config
const collapsibleSections = [
  {
    name: "Service Management",
    prefix: ["/dashboard/jobcards", "/dashboard/service"],
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743"
        />
      </svg>
    ),
    items: [
      { name: "Service Products", href: "/dashboard/service/service-items" },
      { name: "Create Job Card", href: "/dashboard/jobcards/new" },
      { name: "Jobcard Summary", href: "/dashboard/jobcards" },
      {
        name: "Items Received List",
        href: "/dashboard/service/items-received",
      },
      {
        name: "Default Issues List",
        href: "/dashboard/service/default-issues",
      },
      {
        name: "Additional Requirements",
        href: "/dashboard/service/additional-requirements",
      },
      { name: "Action Taken List", href: "/dashboard/service/action-taken" },
      {
        name: "Engineer Observation",
        href: "/dashboard/service/engineer-observation",
      },
      { name: "Customer Note List", href: "/dashboard/service/customer-note" },
    ],
  },
  {
    name: "Booking Management",
    prefix: ["/dashboard/bookings"],
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
        />
      </svg>
    ),
    items: [
      { name: "Booking Service", href: "/dashboard/bookings/new" },
      { name: "Booking Summary", href: "/dashboard/bookings" },
    ],
  },
  {
    name: "Lead Management",
    prefix: ["/dashboard/leads"],
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    items: [
      { name: "Create Lead", href: "/dashboard/leads/new" },
      { name: "Lead Summary", href: "/dashboard/leads" },
    ],
  },
];

function CollapsibleSection({
  section,
  pathname,
}: {
  section: (typeof collapsibleSections)[0];
  pathname: string;
}) {
  const isActive = section.prefix.some((p) => pathname.startsWith(p));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm"
            : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
        }`}
      >
        <span className="flex items-center gap-3">
          <span
            className={`transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-400"}`}
          >
            {section.icon}
          </span>
          {section.name}
        </span>
        <svg
          className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-4 border-l-2 border-surface-200 dark:border-surface-700 space-y-0.5">
          {section.items.map((sub) => {
            const isSubActive = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isSubActive
                    ? "text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-500/5"
                    : "text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800"
                }`}
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${isSubActive ? "bg-primary-500" : "bg-surface-300 dark:bg-surface-600"}`}
                />
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  storeName,
  storeLogo,
  isEmployee = false,
}: {
  storeName: string;
  storeLogo?: string | null;
  isEmployee?: boolean;
}) {
  const pathname = usePathname();

  // Filter out employee management for employee users
  const filteredNav = isEmployee
    ? navigation.filter((item) => item.href !== "/dashboard/employees")
    : navigation;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200 dark:border-surface-800">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600">
          {storeLogo ? (
            <Image
              src={storeLogo}
              alt={`${storeName} Logo`}
              className="object-cover w-full h-full rounded-xl"
              width={36}
              height={36}
            />
          ) : (
            <span className="text-white font-bold text-sm">{storeName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
            {storeName}
          </p>
          <p className="text-xs text-surface-500">
            {isEmployee ? "Employee" : "Store Owner"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Top-level links */}
        {filteredNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm"
                  : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
              }`}
            >
              <span
                className={`transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300"}`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}

        {/* Collapsible sections */}
        {collapsibleSections.map((section) => (
          <CollapsibleSection
            key={section.name}
            section={section}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-200 dark:border-surface-800">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <svg
            className="w-5 h-5 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          Store Settings
        </Link>
      </div>
    </aside>
  );
}
