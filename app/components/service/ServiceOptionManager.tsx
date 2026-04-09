"use client";

import { useState, useTransition, useMemo } from "react";
import {
  createServiceOption,
  updateServiceOption,
  toggleServiceOption,
  deleteServiceOption,
  bulkImportServiceOptions,
} from "@/app/actions/service-options";
import { getProductDefaultOptions } from "@/app/actions/catalog";
import type { ServiceOptionType } from "@/constants/service_option_defaults";

interface ServiceOption {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  service_item_id: number | null;
}

interface StoreProduct {
  id: number;
  name: string;
  category: string | null;
  catalogProductId: number | null;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function ServiceOptionManager({
  options,
  optionType,
  title,
  createLabel,
  storeProducts,
}: {
  options: ServiceOption[];
  optionType: ServiceOptionType;
  title: string;
  createLabel: string;
  storeProducts: StoreProduct[];
}) {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Product filter: "all" = show all, "global" = store-wide only, number = specific product
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  // Import state - product-based
  const [importProduct, setImportProduct] = useState<string>("");
  const [importDefaults, setImportDefaults] = useState<string[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [selectedImports, setSelectedImports] = useState<Set<string>>(
    new Set(),
  );

  const existingNames = useMemo(
    () => new Set(options.map((o) => o.name)),
    [options],
  );

  // Filter options by product scope then search
  const filtered = useMemo(() => {
    let result = options;
    if (selectedProduct === "global") {
      result = result.filter((o) => o.service_item_id === null);
    } else if (selectedProduct !== "all") {
      const pid = Number(selectedProduct);
      result = result.filter(
        (o) => o.service_item_id === pid || o.service_item_id === null,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.name.toLowerCase().includes(q));
    }
    return result;
  }, [options, search, selectedProduct]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  // Importable defaults (not already added) - computed from fetched product defaults
  const importableDefaults = useMemo(() => {
    return importDefaults.filter((n) => !existingNames.has(n));
  }, [importDefaults, existingNames]);

  function flash(text: string, success: boolean) {
    setMessage({ text, success });
    setTimeout(() => setMessage(null), 3000);
  }

  // Resolve the serviceItemId for create/import operations
  const activeServiceItemId = useMemo(() => {
    if (selectedProduct === "all" || selectedProduct === "global") return null;
    return Number(selectedProduct);
  }, [selectedProduct]);

  // Fetch defaults when import product changes
  async function handleImportProductChange(productIdStr: string) {
    setImportProduct(productIdStr);
    setSelectedImports(new Set());
    setImportDefaults([]);

    if (!productIdStr) return;

    const product = storeProducts.find((p) => String(p.id) === productIdStr);
    if (!product?.catalogProductId) return;

    setLoadingDefaults(true);
    try {
      const defaults = await getProductDefaultOptions(
        product.catalogProductId,
        optionType,
      );
      setImportDefaults(defaults);
    } finally {
      setLoadingDefaults(false);
    }
  }

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await createServiceOption(
        optionType,
        newName,
        activeServiceItemId,
      );
      flash(res.message || "", !!res.success);
      if (res.success) {
        setNewName("");
        setShowCreate(false);
      }
    });
  }

  function handleEdit(id: number) {
    if (!editName.trim()) return;
    startTransition(async () => {
      const res = await updateServiceOption(id, editName);
      flash(res.message || "", !!res.success);
      if (res.success) {
        setEditId(null);
        setEditName("");
      }
    });
  }

  function handleToggle(id: number, current: boolean) {
    startTransition(async () => {
      const res = await toggleServiceOption(id, !current);
      if (res.message) flash(res.message, false);
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const res = await deleteServiceOption(id);
      flash(res.message || "", !!res.success);
    });
  }

  function handleBulkImport() {
    if (selectedImports.size === 0) return;
    startTransition(async () => {
      const res = await bulkImportServiceOptions(
        optionType,
        Array.from(selectedImports),
        activeServiceItemId,
      );
      flash(res.message || "", !!res.success);
      if (res.success) {
        setSelectedImports(new Set());
        setShowImport(false);
        setImportProduct("");
        setImportDefaults([]);
      }
    });
  }

  function toggleImportSelection(name: string) {
    setSelectedImports((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAllImportable() {
    setSelectedImports(new Set(importableDefaults));
  }

  function deselectAllImportable() {
    setSelectedImports(new Set());
  }

  // Pagination helpers
  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("...");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      )
        pages.push(i);
      if (safePage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.success
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Product scope selector */}
      {storeProducts.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Product:
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none min-w-50"
          >
            <option value="all">All Options (Global + Product)</option>
            <option value="global">Global Only (All Products)</option>
            {storeProducts.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
                {p.category ? ` (${p.category})` : ""}
              </option>
            ))}
          </select>
          {selectedProduct !== "all" && selectedProduct !== "global" && (
            <span className="text-xs text-surface-500">
              Showing options specific to this product + global options
            </span>
          )}
        </div>
      )}

      {/* Header with search + actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white whitespace-nowrap">
            {title}
          </h2>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-48"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowImport(!showImport);
              setShowCreate(false);
            }}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Import Defaults
          </button>
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowImport(false);
            }}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {createLabel}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
          {activeServiceItemId ? (
            <p className="text-xs text-surface-500 mb-2">
              Creating for:{" "}
              <span className="font-medium text-surface-700 dark:text-surface-300">
                {storeProducts.find((p) => p.id === activeServiceItemId)?.name}
              </span>
            </p>
          ) : (
            <p className="text-xs text-surface-500 mb-2">
              Creating as <span className="font-medium">Global</span> option
              (applies to all products). Select a product above to create
              product-specific options.
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter option name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1 px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isPending ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName("");
              }}
              className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import panel */}
      {showImport && (
        <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Product:
              </label>
              <select
                value={importProduct}
                onChange={(e) => handleImportProductChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none min-w-50"
              >
                <option value="">Select a product...</option>
                {storeProducts
                  .filter((p) => p.catalogProductId)
                  .map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                      {p.category ? ` (${p.category})` : ""}
                    </option>
                  ))}
              </select>
            </div>
            {importableDefaults.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selectAllImportable}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllImportable}
                  className="text-xs text-surface-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {!importProduct ? (
            <p className="text-sm text-surface-500 py-2">
              Select a product to see importable defaults.
            </p>
          ) : loadingDefaults ? (
            <p className="text-sm text-surface-500 py-2">Loading defaults...</p>
          ) : importableDefaults.length === 0 ? (
            <p className="text-sm text-surface-500 py-2">
              {importDefaults.length === 0
                ? "No defaults available for this product."
                : "All defaults for this product have already been added."}
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-surface-200 dark:border-surface-700 rounded-lg">
              {importableDefaults.map((name) => (
                <label
                  key={name}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface-100 dark:hover:bg-surface-700 cursor-pointer text-sm border-b border-surface-100 dark:border-surface-700 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedImports.has(name)}
                    onChange={() => toggleImportSelection(name)}
                    className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-surface-800 dark:text-surface-200">
                    {name}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleBulkImport}
              disabled={isPending || selectedImports.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isPending
                ? "Importing..."
                : `Import ${selectedImports.size} Option${selectedImports.size !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={() => {
                setShowImport(false);
                setSelectedImports(new Set());
                setImportProduct("");
                setImportDefaults([]);
              }}
              className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
                <th className="text-left px-4 py-3 font-semibold text-surface-700 dark:text-surface-300 w-16">
                  #
                </th>
                <th className="text-left px-4 py-3 font-semibold text-surface-700 dark:text-surface-300">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-surface-700 dark:text-surface-300 w-40">
                  Scope
                </th>
                <th className="text-center px-4 py-3 font-semibold text-surface-700 dark:text-surface-300 w-24">
                  Active
                </th>
                <th className="text-center px-4 py-3 font-semibold text-surface-700 dark:text-surface-300 w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-surface-500"
                  >
                    {search
                      ? "No matching options found."
                      : "No options yet. Create one or import defaults."}
                  </td>
                </tr>
              ) : (
                paginated.map((option, idx) => (
                  <tr
                    key={option.id}
                    className="border-b border-surface-100 dark:border-surface-800 last:border-b-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-surface-500">
                      {(safePage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-surface-900 dark:text-white">
                      {editId === option.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEdit(option.id);
                              if (e.key === "Escape") setEditId(null);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-surface-300 dark:border-surface-600 rounded bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEdit(option.id)}
                            disabled={isPending}
                            className="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="px-2 py-1 text-xs text-surface-500 hover:text-surface-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        option.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {option.service_item_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                          {storeProducts.find(
                            (p) => p.id === option.service_item_id,
                          )?.name ?? "Product"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400">
                          Global
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          handleToggle(option.id, option.is_active)
                        }
                        disabled={isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 ${
                          option.is_active
                            ? "bg-primary-600"
                            : "bg-surface-300 dark:bg-surface-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                            option.is_active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditId(option.id);
                            setEditName(option.name);
                          }}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-medium border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 disabled:opacity-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(option.id)}
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-2 py-1 text-sm border border-surface-300 dark:border-surface-600 rounded hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-30 text-surface-600 dark:text-surface-400"
              >
                &lt;
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-surface-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-sm border rounded transition-colors ${
                      p === safePage
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium"
                        : "border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-2 py-1 text-sm border border-surface-300 dark:border-surface-600 rounded hover:bg-surface-50 dark:hover:bg-surface-800 disabled:opacity-30 text-surface-600 dark:text-surface-400"
              >
                &gt;
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-sm border border-surface-300 dark:border-surface-600 rounded bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-400 outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats */}
      <p className="text-xs text-surface-500">
        {filtered.length} option{filtered.length !== 1 ? "s" : ""}
        {search ? " found" : " total"} &middot;{" "}
        {options.filter((o) => o.is_active).length} active
      </p>
    </div>
  );
}
