'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Session {
  id: string
  agent: string
  status: 'running' | 'completed' | 'failed'
  duration: string
  cost: string
  startedAt: string
}

export default function SessionsTable({ initialSessions }: { initialSessions: Session[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = initialSessions.filter((s) => {
    const matchesSearch = s.agent.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusBadge = (status: string) => {
    const styles =
      status === 'running' ? 'bg-success-muted text-success' :
      status === 'completed' ? 'bg-primary-muted text-primary' :
      'bg-danger-muted text-danger'
    return <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${styles}`}>{status}</span>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-[13px] border border-border rounded-md bg-input-bg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Session ID</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Agent</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Duration</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Cost</th>
              <th className="px-4 py-2.5 text-[11px] font-medium text-muted text-left uppercase tracking-wider">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((session) => (
              <tr key={session.id} className="hover:bg-card-hover transition-colors">
                <td className="px-4 py-2.5 text-[13px] font-mono text-muted">{session.id}</td>
                <td className="px-4 py-2.5 text-[13px]">{session.agent}</td>
                <td className="px-4 py-2.5">{statusBadge(session.status)}</td>
                <td className="px-4 py-2.5 text-[13px] text-muted">{session.duration}</td>
                <td className="px-4 py-2.5 text-[13px] text-muted">{session.cost}</td>
                <td className="px-4 py-2.5 text-[13px] text-muted">{session.startedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-muted">No sessions found.</div>
        )}
      </div>
    </div>
  )
}
