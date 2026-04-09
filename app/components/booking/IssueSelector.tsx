"use client"

import { useState, useEffect, useRef } from "react"

interface Props {
  issues: string[]
  value?: string
  onChange?: (issue: string) => void
}

export function IssueSelector({ issues, value, onChange }: Props) {
  const [selected, setSelected] = useState(value || "")
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Reset when issues list changes (product changed)
  useEffect(() => {
    setSelected("")
    setQuery("")
  }, [issues])

  useEffect(() => {
    if (value) setSelected(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = issues.filter((issue) =>
    issue.toLowerCase().includes(query.toLowerCase())
  )

  const showCustomOption =
    query.trim().length > 0 &&
    !issues.some((i) => i.toLowerCase() === query.trim().toLowerCase())

  function handleSelect(issue: string) {
    setSelected(issue)
    setQuery("")
    setIsOpen(false)
    onChange?.(issue)
  }

  function handleClear() {
    setSelected("")
    setQuery("")
    setIsOpen(true)
    onChange?.("")
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name="problem" value={selected} />

      {selected ? (
        <button
          type="button"
          onClick={handleClear}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white cursor-pointer hover:border-primary-400 transition-colors text-left"
        >
          <span className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="truncate">{selected}</span>
          </span>
          <svg className="w-4 h-4 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            placeholder={issues.length > 0 ? "Search or type custom issue..." : "Select a product first..."}
            disabled={issues.length === 0}
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      )}

      {isOpen && !selected && issues.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-slide-up">
          {/* Custom issue option */}
          {showCustomOption && (
            <button
              type="button"
              onClick={() => handleSelect(query.trim())}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer flex items-center gap-2 border-b border-surface-100 dark:border-surface-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add custom issue: &ldquo;{query.trim()}&rdquo;
            </button>
          )}

          {/* Predefined issues */}
          {filtered.length === 0 && !showCustomOption ? (
            <div className="px-4 py-3 text-sm text-surface-400 text-center">
              No matching issues
            </div>
          ) : (
            filtered.map((issue) => (
              <button
                key={issue}
                type="button"
                onClick={() => handleSelect(issue)}
                className="w-full text-left px-4 py-2.5 text-sm text-surface-800 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer"
              >
                {issue}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
