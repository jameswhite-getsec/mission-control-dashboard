import {
  Bot,
  MessageSquare,
  Activity,
  ArrowRight,
  Plus,
  Play,
  FileText,
  Coins,
  Hash,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  try {
    const res = await fetch(`${base}/api/stats`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { totalAgents: 0, activeSessions: 0, eventsToday: 0, totalTokensUsed: '—', totalCost: '—' }
  }
}

async function getEvents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  try {
    const res = await fetch(`${base}/api/events`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { events: [] }
  }
}

async function getSystemHealth() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  try {
    const res = await fetch(`${base}/api/settings`, { cache: 'no-store' })
    return res.json()
  } catch {
    return { status: 'unavailable', model: null, version: null, channels: [] }
  }
}

function HealthDot({ status }: { status: string }) {
  if (status === 'ok') return <CheckCircle className="w-3.5 h-3.5 text-success" />
  if (status === 'unavailable') return <XCircle className="w-3.5 h-3.5 text-danger" />
  return <AlertCircle className="w-3.5 h-3.5 text-warning" />
}

export default async function DashboardPage() {
  const [stats, eventsData, health] = await Promise.all([getStats(), getEvents(), getSystemHealth()])
  const recentEvents = (eventsData.events ?? []).slice(0, 5)

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents ?? '—', icon: Bot, color: 'text-primary' },
    { label: 'Active Sessions', value: stats.activeSessions ?? '—', icon: MessageSquare, color: 'text-success' },
    { label: 'Events Today', value: stats.eventsToday ?? '—', icon: Activity, color: 'text-warning' },
    { label: 'Tokens Used', value: stats.totalTokensUsed ?? '—', icon: Hash, color: 'text-primary' },
    { label: 'Total Cost', value: stats.totalCost ?? '—', icon: Coins, color: 'text-success' },
  ]

  const quickActions = [
    { label: 'Create Agent', icon: Plus, href: '/agents' },
    { label: 'Start Session', icon: Play, href: '/sessions' },
    { label: 'View Logs', icon: FileText, href: '/events' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2 text-[12px] text-muted bg-card-bg border border-border rounded-md px-3 py-1.5">
          <HealthDot status={health.status} />
          <span>
            {health.status === 'ok'
              ? `OpenClaw ${health.version ?? ''} · ${health.model ?? 'unknown model'}`
              : 'OpenClaw unavailable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card-bg border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted font-medium">{label}</span>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <div className="text-xl font-semibold tracking-tight">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-card-bg border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-[13px] font-medium">Recent Activity</h2>
            <Link href="/events" className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentEvents.length === 0 ? (
              <div className="px-4 py-6 text-[13px] text-muted text-center">No events yet</div>
            ) : recentEvents.map((event: { id: string; type: string; message: string; timestamp: string }) => {
              const badgeStyle =
                event.type === 'error' ? 'bg-danger-muted text-danger' :
                event.type === 'warning' ? 'bg-warning-muted text-warning' :
                event.type === 'success' ? 'bg-success-muted text-success' :
                'bg-primary-muted text-primary'
              return (
                <div key={event.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-card-hover transition-colors">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${badgeStyle}`}>
                    {event.type}
                  </span>
                  <span className="text-[13px] flex-1 text-foreground/90">{event.message}</span>
                  <span className="text-[11px] text-muted">{event.timestamp}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-card-bg border border-border rounded-lg">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-[13px] font-medium">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickActions.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] hover:bg-surface transition-colors text-foreground/80 hover:text-foreground"
                >
                  <Icon className="w-4 h-4 text-muted" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {health.channels && health.channels.length > 0 && (
            <div className="bg-card-bg border border-border rounded-lg">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-[13px] font-medium">Channels</h2>
              </div>
              <div className="p-3">
                {health.channels.slice(0, 4).map((ch: string, i: number) => (
                  <div key={i} className="text-[12px] text-muted py-1">{ch}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
