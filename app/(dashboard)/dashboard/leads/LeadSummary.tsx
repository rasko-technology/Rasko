'use client'

import { useState, useTransition } from 'react'
import { updateLeadStatus, deleteLead } from '@/app/actions/leads'
import Link from 'next/link'

interface Lead {
  id: number
  customer_name: string
  phone: string
  email: string | null
  item: string | null
  configuration: string | null
  quantity: number
  payment_mode: string | null
  amount: number | null
  status: string
  action_taken: string | null
  notes: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  qualified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  converted: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  lost: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

export function LeadSummary({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pending, startTransition] = useTransition()
  const perPage = 10

  const filtered = leads.filter((l) => {
    const matchSearch = l.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.item || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || l.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Status counts
  const counts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => { await updateLeadStatus(id, status) })
  }

  function handleDelete(id: number, name: string) {
    if (!confirm(`Delete lead "${name}"?`)) return
    startTransition(async () => { await deleteLead(id) })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Lead Summary</h1>
          <p className="text-surface-500 mt-1 text-sm">{leads.length} leads total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search..." className="pl-9 pr-4 py-2 w-48 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-sm text-surface-900 dark:text-white">
            <option value="">All statuses</option>
            {Object.keys(counts).map((s) => <option key={s} value={s}>{s} ({counts[s]})</option>)}
          </select>
          <Link href="/dashboard/leads/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-all shadow-lg shadow-primary-600/20 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create Lead
          </Link>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {['new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1) }} className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${statusFilter === s ? 'border-primary-400 ring-2 ring-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5' : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:border-surface-300'}`}>
            <p className="text-xs text-surface-500 capitalize">{s}</p>
            <p className="text-xl font-bold text-surface-900 dark:text-white mt-0.5">{counts[s] || 0}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 dark:border-surface-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-surface-400 text-sm">{search || statusFilter ? 'No leads match.' : 'No leads yet.'}</td></tr>
              ) : (
                paginated.map((lead, idx) => (
                  <tr key={lead.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-surface-500">{(page - 1) * perPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{lead.customer_name}</p>
                      {lead.email && <p className="text-xs text-surface-400">{lead.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{lead.phone}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{lead.item || '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 dark:text-white">{lead.amount ? `₹${lead.amount}` : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value)} disabled={pending} className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[lead.status] || 'bg-surface-100 text-surface-600'}`}>
                        {['new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(lead.id, lead.customer_name)} className="px-2.5 py-1 rounded-lg border border-danger/30 text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 px-5 py-3 border-t border-surface-100 dark:border-surface-800">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2.5 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 disabled:opacity-30 cursor-pointer">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${p === page ? 'bg-primary-600 text-white' : 'text-surface-500 hover:bg-surface-100'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-2.5 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 disabled:opacity-30 cursor-pointer">›</button>
          </div>
        )}
      </div>
    </div>
  )
}
