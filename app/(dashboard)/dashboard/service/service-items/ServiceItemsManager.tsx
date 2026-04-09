"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import {
  addServiceItem,
  removeServiceItem,
  addCustomBrand,
  removeCustomBrand,
  addCustomProduct,
  addCustomProductBrand,
} from "@/app/actions/service-items";

interface CatalogProduct {
  id: number;
  name: string;
  category: { name: string } | null;
  catalog_product_brands?: Array<{
    catalog_brands: { id: number; name: string } | null;
  }>;
}

interface ServiceItem {
  id: number;
  catalog_product_id: number;
  added_at: string;
  catalog_products: {
    id: number;
    name: string;
    catalog_categories: { name: string } | null;
    catalog_product_brands?: Array<{
      catalog_brands: { id: number; name: string } | null;
    }>;
  };
}

interface CustomServiceItem {
  id: number;
  custom_product_name: string;
  custom_category_name: string | null;
  added_at: string;
}

interface CustomBrand {
  id: number;
  name: string;
}

function getBrandNames(
  item: ServiceItem["catalog_products"] | CatalogProduct,
): string[] {
  const brands =
    "catalog_product_brands" in item ? item.catalog_product_brands : undefined;
  if (!brands) return [];
  return brands
    .map((b) => b.catalog_brands?.name)
    .filter((n): n is string => !!n)
    .sort();
}

export function ServiceItemsManager({
  items,
  customItems,
  customBrandsByProduct,
  brandsByServiceItem,
  categoryNames,
}: {
  items: ServiceItem[];
  customItems: CustomServiceItem[];
  customBrandsByProduct: Record<number, CustomBrand[]>;
  brandsByServiceItem: Record<number, CustomBrand[]>;
  categoryNames: string[];
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [filterText, setFilterText] = useState("");
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Expanded product card state — use string keys to distinguish catalog vs custom
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState("");

  // Custom product form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const categoryInputRef = useRef<HTMLDivElement>(null);

  // IDs the store already has + optimistically added ones
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const existingIds = new Set([
    ...items.map((i) => i.catalog_product_id),
    ...addedIds,
  ]);

  // Search catalog products via API
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/catalog/search?q=${encodeURIComponent(search.trim())}`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
          setShowDropdown(true);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        categoryInputRef.current &&
        !categoryInputRef.current.contains(e.target as Node)
      ) {
        setShowCategorySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleAdd(product: CatalogProduct) {
    setAddedIds((prev) => new Set([...prev, product.id]));
    startTransition(async () => {
      const result = await addServiceItem(product.id);
      setMessage({ text: result.message || "", success: !!result.success });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleRemove(id: number) {
    if (expandedItemId === `catalog-${id}` || expandedItemId === `custom-${id}`)
      setExpandedItemId(null);
    startTransition(async () => {
      const result = await removeServiceItem(id);
      setMessage({ text: result.message || "", success: !!result.success });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleAddCustomProduct() {
    if (!customName.trim()) return;
    startTransition(async () => {
      const result = await addCustomProduct(
        customName,
        customCategory || undefined,
      );
      setMessage({ text: result.message || "", success: !!result.success });
      if (result.success) {
        setCustomName("");
        setCustomCategory("");
        setShowCustomForm(false);
      }
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleAddBrand(catalogProductId: number) {
    if (!newBrandName.trim()) return;
    startTransition(async () => {
      const result = await addCustomBrand(catalogProductId, newBrandName);
      setMessage({ text: result.message || "", success: !!result.success });
      if (result.success) setNewBrandName("");
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleAddBrandToCustomProduct(serviceItemId: number) {
    if (!newBrandName.trim()) return;
    startTransition(async () => {
      const result = await addCustomProductBrand(serviceItemId, newBrandName);
      setMessage({ text: result.message || "", success: !!result.success });
      if (result.success) setNewBrandName("");
      setTimeout(() => setMessage(null), 3000);
    });
  }

  async function handleRemoveBrand(id: number) {
    startTransition(async () => {
      const result = await removeCustomBrand(id);
      setMessage({ text: result.message || "", success: !!result.success });
      setTimeout(() => setMessage(null), 3000);
    });
  }

  function toggleExpand(itemKey: string) {
    setExpandedItemId((prev) => {
      if (prev === itemKey) return null;
      setNewBrandName("");
      return itemKey;
    });
  }

  // Group items by category
  const grouped = items.reduce<Record<string, ServiceItem[]>>((acc, item) => {
    const cat =
      item.catalog_products?.catalog_categories?.name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Add custom items into grouped structure
  const filteredCustomItems = customItems.filter((i) =>
    i.custom_product_name.toLowerCase().includes(filterText.toLowerCase()),
  );
  const customGroupedEntries: [string, CustomServiceItem[]][] =
    filteredCustomItems.length > 0
      ? Object.entries(
          filteredCustomItems.reduce<Record<string, CustomServiceItem[]>>(
            (acc, item) => {
              const cat = item.custom_category_name || "Custom Products";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(item);
              return acc;
            },
            {},
          ),
        ).sort((a, b) => a[0].localeCompare(b[0]))
      : [];

  const allItemsCount = items.length + customItems.length;

  const filteredGrouped = Object.entries(grouped)
    .map(([cat, catItems]) => ({
      category: cat,
      items: catItems.filter((i) =>
        i.catalog_products.name
          .toLowerCase()
          .includes(filterText.toLowerCase()),
      ),
    }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => a.category.localeCompare(b.category));

  return (
    <div className="space-y-6">
      {/* Toast message */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up ${
            message.success
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-danger/10 border border-danger/20 text-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search & Add */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 uppercase tracking-wider">
          Add Products from Catalog
        </h3>
        <p className="text-xs text-surface-400 mb-4">
          Search from the global product catalog and add products that your
          store services or repairs.
        </p>

        <div className="relative" ref={dropdownRef}>
          <div className="relative">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog products... e.g. Split Air Conditioner, Laptop, Server"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="animate-spin h-4 w-4 text-primary-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Dropdown results */}
          {showDropdown && results.length > 0 && (
            <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-xl">
              {results.map((product) => {
                const alreadyAdded = existingIds.has(product.id);
                return (
                  <button
                    key={product.id}
                    disabled={alreadyAdded || isPending}
                    onClick={() => handleAdd(product)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                      alreadyAdded
                        ? "opacity-50 cursor-not-allowed bg-surface-50 dark:bg-surface-800"
                        : "hover:bg-primary-50 dark:hover:bg-primary-500/10 cursor-pointer"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-surface-900 dark:text-white">
                        {product.name}
                      </span>
                      {product.category && (
                        <span className="ml-2 text-xs text-surface-400">
                          {product.category.name}
                        </span>
                      )}
                      {(() => {
                        const brands = getBrandNames(product);
                        return brands.length > 0 ? (
                          <div className="mt-0.5 text-xs text-surface-400 truncate">
                            {brands.slice(0, 5).join(", ")}
                            {brands.length > 5 && ` +${brands.length - 5} more`}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    {alreadyAdded ? (
                      <span className="text-xs text-surface-400">
                        Already added
                      </span>
                    ) : (
                      <svg
                        className="w-4 h-4 text-primary-500"
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
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showDropdown &&
            results.length === 0 &&
            !searching &&
            search.trim().length >= 2 && (
              <div className="absolute z-30 mt-2 w-full rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-xl px-4 py-6 text-center">
                <p className="text-sm text-surface-400">
                  No products found matching &quot;{search}&quot;
                </p>
              </div>
            )}
        </div>
        <div className="mt-4 border-t border-surface-100 dark:border-surface-700 pt-4">
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1.5 cursor-pointer"
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
              Add a custom product not in catalog
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                Add Custom Product
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Product name *"
                  maxLength={200}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
                <div className="relative sm:w-48" ref={categoryInputRef}>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setShowCategorySuggestions(true);
                    }}
                    onFocus={() => setShowCategorySuggestions(true)}
                    placeholder="Category (optional)"
                    maxLength={100}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                  {showCategorySuggestions &&
                    (() => {
                      const filtered = categoryNames.filter((c) =>
                        c
                          .toLowerCase()
                          .includes(customCategory.toLowerCase().trim()),
                      );
                      return filtered.length > 0 ? (
                        <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-xl">
                          {filtered.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setCustomCategory(name);
                                setShowCategorySuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-surface-700 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-500/10 cursor-pointer"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      ) : null;
                    })()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustomProduct}
                    disabled={isPending || !customName.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomName("");
                      setCustomCategory("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current service items list */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider">
              Your Service Products
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
              {allItemsCount} product{allItemsCount !== 1 ? "s" : ""} your store
              services
            </p>
          </div>

          {allItemsCount > 0 && (
            <div className="relative w-full sm:w-64">
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
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter service products..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          )}
        </div>

        {allItemsCount === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto w-12 h-12 text-surface-300 dark:text-surface-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              No service products added yet
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Use the search above to find and add products from the catalog
            </p>
          </div>
        ) : filteredGrouped.length === 0 &&
          customGroupedEntries.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-8">
            No products match your filter.
          </p>
        ) : (
          <div className="space-y-6">
            {filteredGrouped.map(({ category, items: catItems }) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  {category}
                  <span className="text-surface-300 dark:text-surface-600 font-normal">
                    ({catItems.length})
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {catItems
                    .sort((a, b) =>
                      a.catalog_products.name.localeCompare(
                        b.catalog_products.name,
                      ),
                    )
                    .map((item) => {
                      const itemKey = `catalog-${item.id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const catalogBrands = getBrandNames(
                        item.catalog_products,
                      );
                      const custom =
                        customBrandsByProduct[item.catalog_product_id] || [];

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border transition-all ${
                            isExpanded
                              ? "bg-white dark:bg-surface-800 border-primary-300 dark:border-primary-700 shadow-md col-span-1 sm:col-span-2 lg:col-span-3"
                              : "bg-surface-50 dark:bg-surface-800/50 border-surface-100 dark:border-surface-800 group"
                          }`}
                        >
                          {/* Card header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer"
                            onClick={() => toggleExpand(itemKey)}
                          >
                            <div className="min-w-0 mr-2">
                              <span className="text-sm text-surface-800 dark:text-surface-200 font-medium truncate block">
                                {item.catalog_products.name}
                              </span>
                              {!isExpanded && (
                                <span className="text-xs text-surface-400 truncate block mt-0.5">
                                  {catalogBrands.slice(0, 3).join(", ")}
                                  {catalogBrands.length > 3 &&
                                    ` +${catalogBrands.length - 3} more`}
                                  {custom.length > 0 &&
                                    catalogBrands.length > 0 &&
                                    ", "}
                                  {custom.length > 0 && (
                                    <span className="text-primary-400">
                                      +{custom.length} custom
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <svg
                                className={`w-4 h-4 text-surface-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(item.id);
                                }}
                                disabled={isPending}
                                className={`p-1.5 rounded-lg text-surface-400 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-50 ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                title="Remove from service list"
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
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-surface-100 dark:border-surface-700 pt-3">
                              {/* Catalog brands */}
                              {catalogBrands.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
                                    Catalog Brands
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {catalogBrands.map((name) => (
                                      <span
                                        key={name}
                                        className="inline-flex px-2.5 py-1 rounded-md bg-surface-100 dark:bg-surface-700 text-xs text-surface-600 dark:text-surface-300"
                                      >
                                        {name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Custom brands */}
                              <div>
                                <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
                                  Custom Brands
                                  {custom.length > 0 && (
                                    <span className="font-normal ml-1 text-surface-400">
                                      ({custom.length})
                                    </span>
                                  )}
                                </p>
                                {custom.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {custom.map((brand) => (
                                      <span
                                        key={brand.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-xs text-primary-700 dark:text-primary-300 group/brand"
                                      >
                                        {brand.name}
                                        <button
                                          onClick={() =>
                                            handleRemoveBrand(brand.id)
                                          }
                                          disabled={isPending}
                                          className="p-0.5 rounded hover:bg-danger/10 hover:text-danger transition-colors opacity-0 group-hover/brand:opacity-100 cursor-pointer disabled:opacity-50"
                                          title="Remove custom brand"
                                        >
                                          <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M6 18 18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) =>
                                      setNewBrandName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddBrand(item.catalog_product_id);
                                      }
                                    }}
                                    placeholder="Add a custom brand..."
                                    maxLength={100}
                                    className="flex-1 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-xs text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddBrand(item.catalog_product_id);
                                    }}
                                    disabled={isPending || !newBrandName.trim()}
                                    className="px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Custom products */}
            {customGroupedEntries.map(([category, cItems]) => (
              <div key={`custom-${category}`}>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {category}
                  <span className="text-surface-300 dark:text-surface-600 font-normal">
                    ({cItems.length})
                  </span>
                  <span className="text-[10px] font-normal text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                    Custom
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cItems
                    .sort((a, b) =>
                      a.custom_product_name.localeCompare(
                        b.custom_product_name,
                      ),
                    )
                    .map((item) => {
                      const itemKey = `custom-${item.id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const brands = brandsByServiceItem[item.id] || [];

                      return (
                        <div
                          key={itemKey}
                          className={`rounded-xl border transition-all ${
                            isExpanded
                              ? "bg-white dark:bg-surface-800 border-amber-300 dark:border-amber-700 shadow-md col-span-1 sm:col-span-2 lg:col-span-3"
                              : "bg-surface-50 dark:bg-surface-800/50 border-surface-100 dark:border-surface-800 group"
                          }`}
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer"
                            onClick={() => toggleExpand(itemKey)}
                          >
                            <div className="min-w-0 mr-2">
                              <span className="text-sm text-surface-800 dark:text-surface-200 font-medium truncate block">
                                {item.custom_product_name}
                              </span>
                              {!isExpanded && (
                                <span className="text-xs text-surface-400 truncate block mt-0.5">
                                  {brands.length > 0 ? (
                                    <>
                                      {brands
                                        .slice(0, 3)
                                        .map((b) => b.name)
                                        .join(", ")}
                                      {brands.length > 3 &&
                                        ` +${brands.length - 3} more`}
                                    </>
                                  ) : (
                                    <span className="text-amber-500">
                                      Custom product
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <svg
                                className={`w-4 h-4 text-surface-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(item.id);
                                }}
                                disabled={isPending}
                                className={`p-1.5 rounded-lg text-surface-400 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer disabled:opacity-50 ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                title="Remove from service list"
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
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-surface-100 dark:border-surface-700 pt-3">
                              <div>
                                <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-1.5">
                                  Brands
                                  {brands.length > 0 && (
                                    <span className="font-normal ml-1 text-surface-400">
                                      ({brands.length})
                                    </span>
                                  )}
                                </p>
                                {brands.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {brands.map((brand) => (
                                      <span
                                        key={brand.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 group/brand"
                                      >
                                        {brand.name}
                                        <button
                                          onClick={() =>
                                            handleRemoveBrand(brand.id)
                                          }
                                          disabled={isPending}
                                          className="p-0.5 rounded hover:bg-danger/10 hover:text-danger transition-colors opacity-0 group-hover/brand:opacity-100 cursor-pointer disabled:opacity-50"
                                          title="Remove brand"
                                        >
                                          <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M6 18 18 6M6 6l12 12"
                                            />
                                          </svg>
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) =>
                                      setNewBrandName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddBrandToCustomProduct(item.id);
                                      }
                                    }}
                                    placeholder="Add a brand..."
                                    maxLength={100}
                                    className="flex-1 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-xs text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddBrandToCustomProduct(item.id);
                                    }}
                                    disabled={isPending || !newBrandName.trim()}
                                    className="px-3 py-2 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
