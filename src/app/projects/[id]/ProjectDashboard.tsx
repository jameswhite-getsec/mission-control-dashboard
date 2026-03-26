'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Bot,
  ChevronLeft,
  CheckCircle2,
  Archive,
  Circle,
  Activity,
  Users,
  Zap,
} from 'lucide-react'
import type { Project } from '@/types/project'
import type { Agent } from '@/types/agent'
import AgentEditor from '@/components/AgentEditor'

const STATUS_STYLES: Record<Project['status'], { label: string; cls: string; icon: React.ReactNode }> = {
  active: { label: 'Active', cls: 'bg-success-muted text-success', icon: <Circle className="w-3 h-3 fill-current" /> },
  completed: { label: 'Completed', cls: 'bg-primary/20 text-primary', icon: <CheckCircle2 className="w-3 h-3" /> },
  archived: { label: 'Archived', cls: 'bg-surface text-muted', icon: <Archive className="w-3 h-3" /> },
}

const MODEL_COLORS: Record<string, string> = {
  'claude-opus-4-6': 'bg-primary/20 text-primary',
  'claude-sonnet-4-6': 'bg-success-muted text-success',
  'claude-haiku-4-5': 'bg-warning-muted text-warning',
}

function modelLabel(m: string) {
  if (m.includes('opus')) return 'Opus'
  if (m.includes('sonnet')) return 'Sonnet'
  if (m.includes('haiku')) return 'Haiku'
  return m
}

function statusDot(s: string) {
  return s === 'active' ? 'bg-success' : s === 'idle' ? 'bg-warning' : 'bg-danger'
}

// Mock events for the activity feed
const MOCK_EVENTS = [
  { id: '1', type: 'success' as const, message: 'Agent completed task successfully', source: 'Code Review Bot', timestamp: '2 min ago' },
  { id: '2', type: 'info' as const, message: 'New session started', source: 'Test Generator', timestamp: '15 min ago' },
  { id: '3', type: 'warning' as const, message: 'Rate limit approaching', source: 'Doc Writer', timestamp: '1 hour ago' },
  { id: '4', type: 'info' as const, message: 'Agent assigned to project', source: 'System', timestamp: '3 hours ago' },
]

const EVENT_STYLES = {
  info: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
}

export default function ProjectDashboard({
  project,
  initialAgents,
}: {
  project: Project
  initialAgents: Agent[]
}) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const statusStyle = STATUS_STYLES[project.status]
  const activeAgents = agents.filter((a) => a.status === 'active').length

  function handleAgentClick(agent: Agent) {
    setEditingAgent(agent)
    setEditorOpen(true)
  }

  function handleSave(saved: Agent) {
    setAgents((prev) => {
      const idx = prev.findIndex((a) => a.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${statusStyle.cls}`}>
              {statusStyle.icon}
              {statusStyle.label}
            </span>
          </div>
          {project.description && (
            <p className="text-[13px] text-muted">{project.description}</p>
          )}
        </div>
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-md text-[13px] text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Users, label: 'Agents', value: agents.length },
          { icon: Zap, label: 'Active', value: activeAgents },
          { icon: Activity, label: 'Events', value: MOCK_EVENTS.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card-bg border border-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-muted" />
              <span className="text-[11px] text-muted uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Agent grid (2/3 width) */}
        <div className="col-span-2">
          <h2 className="text-[13px] font-medium mb-3 text-muted uppercase tracking-wide">Agents</h2>
          {agents.length === 0 ? (
            <div className="bg-card-bg border border-border rounded-lg p-8 text-center">
              <Bot className="w-6 h-6 text-muted mx-auto mb-2" />
              <p className="text-[13px] text-muted">No agents assigned to this project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => handleAgentClick(agent)}
                  className="bg-card-bg border border-border rounded-lg p-3 cursor-pointer hover:bg-card-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                      {agent.avatarUrl ? (
                        <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Bot className="w-4 h-4 text-muted" />
                      )}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusDot(agent.status)} border-2 border-card-bg`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium truncate">{agent.name}</div>
                      <div className="text-[11px] text-muted truncate">{agent.task || agent.description}</div>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${MODEL_COLORS[agent.model] ?? 'bg-surface text-muted'}`}>
                    {modelLabel(agent.model)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed (1/3 width) */}
        <div>
          <h2 className="text-[13px] font-medium mb-3 text-muted uppercase tracking-wide">Activity</h2>
          <div className="bg-card-bg border border-border rounded-lg divide-y divide-border">
            {/* TODO: wire to real events filtered by project agents */}
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${EVENT_STYLES[event.type].replace('text-', 'bg-')}`} />
                  <div className="min-w-0">
                    <p className="text-[12px] leading-snug">{event.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted">{event.source}</span>
                      <span className="text-[10px] text-muted/60">·</span>
                      <span className="text-[10px] text-muted/60">{event.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AgentEditor
        agent={editingAgent}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        allAgents={agents}
      />
    </div>
  )
}
