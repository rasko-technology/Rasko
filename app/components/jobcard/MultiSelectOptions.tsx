"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Option {
  id: number;
  name: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  onCreateCustom?: (name: string) => void;
}

export function MultiSelectOptions({
  label,
  options,
  selected,
  onChange,
  placeholder,
  allowCustom = true,
  onCreateCustom,
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const filtered = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase()) &&
      !selected.includes(opt.name),
  );

  const showCustom =
    allowCustom &&
    query.trim().length > 0 &&
    !options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase()) &&
    !selected.includes(query.trim());

  const addItem = useCallback(
    (name: string) => {
      onChange([...selected, name]);
      setQuery("");
    },
    [selected, onChange],
  );

  const removeItem = useCallback(
    (name: string) => {
      onChange(selected.filter((s) => s !== name));
    },
    [selected, onChange],
  );

  return (
    <div ref={wrapperRef} className="space-y-2">
      <label className="text-lg font-semibold text-surface-900 dark:text-white">
        {label}
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-xs font-medium text-primary-700 dark:text-primary-300"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="w-3.5 h-3.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-500/20 flex items-center justify-center cursor-pointer"
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
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

      {/* Search input */}
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
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || "Search..."}
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (filtered.length > 0 || showCustom) && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-slide-up">
          {showCustom && (
            <button
              type="button"
              onClick={() => {
                if (onCreateCustom) {
                  onCreateCustom(query.trim());
                  setQuery("");
                  setIsOpen(false);
                } else {
                  addItem(query.trim());
                }
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer flex items-center gap-2 border-b border-surface-100 dark:border-surface-800"
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
              Add &ldquo;{query.trim()}&rdquo;
            </button>
          )}
          {filtered.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => addItem(opt.name)}
              className="w-full text-left px-4 py-2.5 text-sm text-surface-800 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer"
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}

      {/* Add Custom button — always visible when onCreateCustom is provided */}
      {onCreateCustom && (
        <button
          type="button"
          onClick={() => onCreateCustom("")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer mt-1"
        >
          <svg
            className="w-3.5 h-3.5"
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
          Add Custom
        </button>
      )}
    </div>
  );
}
