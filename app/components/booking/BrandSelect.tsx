"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  brands: string[];
  value?: string;
  onChange?: (brand: string) => void;
}

export function BrandSelect({ brands, value, onChange }: Props) {
  const [selected, setSelected] = useState(value || "");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset when brands list changes, preserving value prop when valid
  useEffect(() => {
    if (brands.length > 0) {
      setSelected(value && brands.includes(value) ? value : "");
    } else if (value) {
      setSelected(value);
    } else {
      setSelected("");
    }
    setQuery("");
  }, [brands, value]);

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

  const filtered = brands.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase()),
  );

  function handleSelect(brand: string) {
    setSelected(brand);
    setQuery("");
    setIsOpen(false);
    onChange?.(brand);
  }

  if (brands.length === 0) {
    return (
      <div>
        <input type="hidden" name="brand_name" value="" />
        <input
          type="text"
          name="brand_name_manual"
          placeholder="Select a product first..."
          disabled
          className="w-full px-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-sm text-surface-400 cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name="brand_name" value={selected} />

      {selected ? (
        <button
          type="button"
          onClick={() => {
            setSelected("");
            setIsOpen(true);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white cursor-pointer hover:border-primary-400 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            {selected}
          </span>
          <svg
            className="w-4 h-4 text-surface-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      ) : (
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search brand..."
            autoComplete="off"
            className="w-full px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
      )}

      {isOpen && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-slide-up">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-surface-400 text-center">
              No brands match
            </div>
          ) : (
            filtered.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => handleSelect(brand)}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-800 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
              >
                {brand}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
