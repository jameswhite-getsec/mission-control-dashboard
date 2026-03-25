'use client'

import { useState } from 'react'

interface Event {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  source: string
  timestamp: string
}

const typeStyles: Record<string, string> = {
  info: 'bg-primary-muted text-primary',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  error: 'bg-danger-muted text-danger',
}

export default function EventLog({ initialEvents }: { initialEvents: Event[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? initialEvents : initialEvents.filter((e) => e.type === filter)

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        {['all', 'info', 'success', 'warning', 'error'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2.5 py-1 text-[12px] rounded-md font-medium transition-colors ${
              filter === type
                ? 'bg-primary text-white'
                : 'text-muted hover:text-foreground hover:bg-surface'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card-bg border border-border rounded-lg divide-y divide-border">
        {filtered.map((event) => (
          <div key={event.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-card-hover transition-colors">
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium min-w-[52px] text-center ${typeStyles[event.type]}`}>
              {event.type}
            </span>
            <span className="text-[13px] flex-1 text-foreground/90">{event.message}</span>
            <span className="text-[11px] text-muted font-mono">{event.source}</span>
            <span className="text-[11px] text-muted">{event.timestamp}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-muted">No events found.</div>
        )}
      </div>
    </div>
  )
}
