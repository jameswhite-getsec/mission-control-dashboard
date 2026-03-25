'use client'

import { useState } from 'react'
import { Plus, Bot, Pencil } from 'lucide-react'
import type { Agent } from '@/types/agent'
import AgentEditor from '@/components/AgentEditor'

export default function AgentList({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  function openCreate() {
    setEditingAgent(null)
    setEditorOpen(true)
  }

  function openEdit(agent: Agent) {
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
      return [saved, ...prev]
    })
  }

  const statusDot = (s: string) =>
    s === 'active' ? 'bg-success' : s === 'idle' ? 'bg-warning' : 'bg-danger'

  const statusLabel = (s: string) =>
    s === 'active' ? 'Active' : s === 'idle' ? 'Idle' : 'Error'

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted">{agents.length} agents configured</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Agent
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-card-bg border border-border rounded-lg p-4 hover:bg-card-hover transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center overflow-hidden">
                  {agent.avatarUrl ? (
                    <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-4 h-4 text-muted" />
                  )}
                </div>
                <div>
                  <h3 className="text-[13px] font-medium">{agent.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(agent)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface text-muted hover:text-foreground transition-all"
                  title="Edit agent"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusDot(agent.status)}`} />
                  <span className="text-[11px] text-muted">{statusLabel(agent.status)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted mt-3 pt-3 border-t border-border">
              <span className="font-mono">{agent.model}</span>
              <span>{agent.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      <AgentEditor
        agent={editingAgent}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
