"use client";

import { useState } from "react";

interface Employee {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

export function EmployeeList({
  employees,
  storeId,
}: {
  employees: Employee[];
  storeId: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<{
    message?: string;
    success?: boolean;
  }>({});
  const [pending, setPending] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    username: string;
    phone: string;
    email: string;
    password: string;
  }>({ name: "", username: "", phone: "", email: "", password: "" });
  const [editState, setEditState] = useState<{
    message?: string;
    success?: boolean;
  }>({});
  const [editPending, setEditPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFormState({});

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        username: formData.get("username"),
        password: formData.get("password"),
        phone: formData.get("phone"),
        email: formData.get("email"),
      }),
    });

    const data = await res.json();
    setPending(false);

    if (res.ok) {
      setFormState({
        success: true,
        message: "Employee created! They can login with the store code.",
      });
      (e.target as HTMLFormElement).reset();
      window.location.reload();
    } else {
      setFormState({ message: data.error || "Failed to create employee." });
    }
  }

  function startEdit(emp: Employee) {
    setEditingId(emp.id);
    setEditForm({
      name: emp.name,
      username: emp.username,
      phone: emp.phone || "",
      email: emp.email || "",
      password: "",
    });
    setEditState({});
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;
    setEditPending(true);
    setEditState({});

    const body: Record<string, string | boolean> = {
      name: editForm.name,
      username: editForm.username,
      phone: editForm.phone,
      email: editForm.email,
    };
    if (editForm.password.trim()) {
      body.password = editForm.password.trim();
    }

    const res = await fetch(`/api/employees/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setEditPending(false);

    if (res.ok) {
      setEditState({ success: true, message: "Employee updated." });
      setTimeout(() => window.location.reload(), 500);
    } else {
      setEditState({ message: data.error || "Failed to update employee." });
    }
  }

  async function toggleActive(emp: Employee) {
    const res = await fetch(`/api/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !emp.is_active }),
    });
    if (res.ok) window.location.reload();
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-600/20 cursor-pointer"
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
        Add Employee
      </button>

      {showForm && (
        <div className="mb-6 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 animate-slide-up shadow-sm">
          {formState.message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${formState.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
            >
              {formState.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="name"
                placeholder="Full name"
                required
                className="px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              <input
                name="username"
                placeholder="Username (for login)"
                required
                className="px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                className="px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
              <input
                name="email"
                type="email"
                placeholder="Email (optional)"
                className="px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>
      )}

      {/* Employee Cards */}
      <div className="grid gap-4">
        {employees.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <p className="text-surface-500 text-sm">
              No employees yet. Add your team members to assign jobs.
            </p>
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {emp.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900 dark:text-white">
                        {emp.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${emp.is_active ? "bg-success/10 text-success" : "bg-surface-200 dark:bg-surface-700 text-surface-500"}`}
                      >
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">
                      @{emp.username}
                    </p>
                    {emp.phone && (
                      <p className="text-xs text-surface-400 mt-0.5">
                        {emp.phone}
                      </p>
                    )}
                    {emp.email && (
                      <p className="text-xs text-surface-400">{emp.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(emp)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${emp.is_active ? "hover:bg-amber-50 dark:hover:bg-amber-500/10 text-surface-400 hover:text-amber-600" : "hover:bg-success/10 text-surface-400 hover:text-success"}`}
                    title={emp.is_active ? "Deactivate" : "Activate"}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      {emp.is_active ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      editingId === emp.id ? setEditingId(null) : startEdit(emp)
                    }
                    className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-surface-400 hover:text-primary-600 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingId === emp.id && (
                <div className="px-5 pb-5 border-t border-surface-100 dark:border-surface-800 pt-4 animate-slide-up">
                  {editState.message && (
                    <div
                      className={`mb-3 p-3 rounded-lg text-sm ${editState.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                    >
                      {editState.message}
                    </div>
                  )}
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          Name
                        </label>
                        <input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          required
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          Username
                        </label>
                        <input
                          value={editForm.username}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              username: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={editForm.password}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              password: e.target.value,
                            })
                          }
                          placeholder="Leave blank to keep"
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          Phone
                        </label>
                        <input
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-surface-500 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={editPending}
                        className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {editPending ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/20">
        <p className="text-sm text-primary-700 dark:text-primary-300">
          <strong>Store Code:</strong>{" "}
          <span className="font-mono">{storeId}</span> — Share this with your
          employees so they can log in at{" "}
          <span className="font-mono">/employee/login</span>
        </p>
      </div>
    </div>
  );
}
