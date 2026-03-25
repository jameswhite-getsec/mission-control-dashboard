'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  Columns3,
  MessageSquare,
  Activity,
  Brain,
  Settings,
  Zap,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban', label: 'Kanban', icon: Columns3 },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/sessions', label: 'Sessions', icon: MessageSquare },
  { href: '/events', label: 'Events', icon: Activity },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-sidebar-bg text-sidebar-text flex flex-col h-screen fixed left-0 top-0 border-r border-border">
      <div className="px-4 py-4 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sidebar-active font-semibold text-sm tracking-tight">
          Mission Control
        </span>
      </div>

      <nav className="flex-1 px-2 mt-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-hover text-sidebar-active'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-active'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
            MC
          </div>
          <div>
            <div className="text-sidebar-active text-xs font-medium leading-none">Workspace</div>
            <div className="text-sidebar-text text-[11px] mt-0.5">v0.1.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
