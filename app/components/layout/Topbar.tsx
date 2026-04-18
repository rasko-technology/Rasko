"use client";

import { signOut } from "@/app/actions/auth";
import Image from "next/image";
import { useState } from "react";

export function Topbar({
  userEmail,
  storeName,
  storeLogo,
  isEmployee = false,
}: {
  userEmail: string;
  storeName: string;
  storeLogo?: string | null;
  isEmployee?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  async function handleSignOut() {
    if (isEmployee) {
      // Clear httpOnly cookie via server API route
      await fetch("/api/auth/employee-logout", { method: "POST" });
      window.location.href = "/employee/login";
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          {storeLogo ? (
            <Image
              src={storeLogo}
              alt={`${storeName} logo`}
              width={18}
              height={18}
              className="w-6 h-6 object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">R</span>
          )}
        </div>
        <span className="text-sm font-semibold text-surface-900 dark:text-white">
          {storeName}
        </span>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-0 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 cursor-pointer">
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
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-600">
              {storeLogo ? (
                <Image
                  src={storeLogo}
                  alt={`${storeName} Logo`}
                  className="object-cover w-full h-full rounded-full"
                  width={36}
                  height={36}
                />
              ) : (
                <span className="text-white text-xs font-semibold">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <svg
              className="w-4 h-4 text-surface-400 hidden sm:block"
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

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-xl z-20 animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {userEmail}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {isEmployee ? "Employee" : "Store Owner"}
                  </p>
                </div>
                <div className="py-1">
                  {isEmployee ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  ) : (
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                      >
                        Sign out
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
