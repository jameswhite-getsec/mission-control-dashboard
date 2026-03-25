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
} from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/stats`, { cache: 'no-store' })
  return res.json()
}

async function getEvents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/events`, { cache: 'no-store' })
  return res.json()
}

export default async function DashboardPage() {
  const [stats, eventsData] = await Promise.all([getStats(), getEvents()])
  const recentEvents = eventsData.events.slice(0, 5)

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents, icon: Bot, color: 'text-primary' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: MessageSquare, color: 'text-success' },
    { label: 'Events Today', value: stats.eventsToday, icon: Activity, color: 'text-warning' },
    { label: 'Tokens Used', value: stats.totalTokensUsed, icon: Hash, color: 'text-primary' },
    { label: 'Total Cost', value: stats.totalCost, icon: Coins, color: 'text-success' },
  ]

  const quickActions = [
    { label: 'Create Agent', icon: Plus, href: '/agents' },
    { label: 'Start Session', icon: Play, href: '/sessions' },
    { label: 'View Logs', icon: FileText, href: '/events' },
  ]

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Dashboard</h1>

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
            {recentEvents.map((event: { id: string; type: string; message: string; timestamp: string }) => {
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
      </div>
    </div>
  )
}
