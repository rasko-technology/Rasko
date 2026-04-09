"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface CustomerResult {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  landmark: string | null
  city: string | null
  pincode: string | null
  gst_number: string | null
  notes: string | null
}

interface Props {
  onCustomerSelect: (customer: CustomerResult) => void
  onNewCustomer: () => void
}

export function CustomerSearch({ onCustomerSelect, onNewCustomer }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CustomerResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchCustomers = useCallback(async (searchTerm: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
      setIsOpen(true)
      setHighlightIndex(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => fetchCustomers(query), 300)
    } else {
      setResults([])
      setIsOpen(false)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchCustomers])

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return
    const totalItems = results.length + 1 // +1 for "New Customer" option
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, totalItems - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault()
      if (highlightIndex < results.length) {
        onCustomerSelect(results[highlightIndex])
      } else {
        onNewCustomer()
      }
      setIsOpen(false)
      setQuery("")
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2) fetchCustomers(query) }}
          onKeyDown={handleKeyDown}
          placeholder="Search customer by name, phone, or email..."
          autoComplete="off"
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-slide-up">
          {/* Existing customers */}
          {results.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider bg-surface-50 dark:bg-surface-800/50 sticky top-0">
              Existing Customers
            </div>
          )}
          {results.map((customer, idx) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => {
                onCustomerSelect(customer)
                setIsOpen(false)
                setQuery("")
              }}
              className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                idx === highlightIndex
                  ? "bg-primary-50 dark:bg-primary-500/10"
                  : "hover:bg-surface-50 dark:hover:bg-surface-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">{customer.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{customer.name}</p>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    {customer.phone && <span>{customer.phone}</span>}
                    {customer.phone && customer.email && <span>·</span>}
                    {customer.email && <span className="truncate">{customer.email}</span>}
                  </div>
                </div>
                {customer.city && (
                  <span className="text-xs text-surface-400 flex-shrink-0">{customer.city}</span>
                )}
              </div>
            </button>
          ))}

          {/* No results message */}
          {results.length === 0 && !loading && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-surface-400 text-center">
              No customers found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* New customer option */}
          <div className="border-t border-surface-100 dark:border-surface-800">
            <button
              type="button"
              onClick={() => {
                onNewCustomer()
                setIsOpen(false)
                setQuery("")
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer flex items-center gap-2 ${
                highlightIndex === results.length
                  ? "bg-primary-50 dark:bg-primary-500/10"
                  : ""
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              + Create New Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
