"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useProducts, type ProductResult } from "@/app/hooks/use-products";
import { useDebouncedValue } from "@/app/hooks/use-debounced-value";

interface Props {
  onProductSelect: (product: ProductResult) => void;
  value?: string;
}

export function ProductSearchInput({ onProductSelect, value }: Props) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasAutoSelected = useRef(false);
  const justSelected = useRef(false);

  const { products, isLoading } = useProducts();
  const debouncedQuery = useDebouncedValue(query, 150);

  // Client-side filter
  const results = useMemo(() => {
    if (debouncedQuery.length < 1) return [];
    const q = debouncedQuery.toLowerCase();
    return products.filter((p) => p.productName.toLowerCase().includes(q));
  }, [products, debouncedQuery]);

  // Open dropdown when results change and query is active
  useEffect(() => {
    if (
      debouncedQuery.length >= 1 &&
      results.length > 0 &&
      !justSelected.current
    ) {
      setIsOpen(true);
      setHighlightIndex(-1);
    } else if (debouncedQuery.length < 1) {
      setIsOpen(false);
    }
  }, [results, debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-trigger onProductSelect on mount when value is pre-filled (edit mode)
  useEffect(() => {
    if (!value || hasAutoSelected.current || products.length === 0) return;
    const match = products.find(
      (p) => p.productName.toLowerCase() === value.toLowerCase(),
    );
    if (match) {
      hasAutoSelected.current = true;
      justSelected.current = true;
      onProductSelect(match);
    }
  }, [value, products, onProductSelect]);

  function handleSelect(product: ProductResult) {
    setQuery(product.productName);
    setIsOpen(false);
    justSelected.current = true;
    onProductSelect(product);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Group results by category
  const grouped = results.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<string, ProductResult[]>,
  );

  let globalIdx = -1;

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name="product_name" value={query} />
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (justSelected.current) {
              justSelected.current = false;
              return;
            }
            if (query.length >= 1 && results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a product..."
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-72 overflow-y-auto animate-slide-up">
          {Object.entries(grouped).map(([category, products]) => (
            <div key={category}>
              <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider bg-surface-50 dark:bg-surface-800/50">
                {category}
              </div>
              {products.map((product) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <button
                    key={product.productName}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      idx === highlightIndex
                        ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300"
                        : "text-surface-800 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800"
                    }`}
                  >
                    <span className="font-medium">{product.productName}</span>
                    <span className="text-xs text-surface-400 truncate max-w-[140px]">
                      {product.brandNames.slice(0, 3).join(", ")}
                      {product.brandNames.length > 3
                        ? ` +${product.brandNames.length - 3}`
                        : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 1 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl p-4 text-center text-sm text-surface-400">
          No products found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
