'use client'

import { useState } from 'react'
import { Plus, X, Bot } from 'lucide-react'

interface Agent {
  id: string
  name: string
  model: string
  status: 'active' | 'idle' | 'error'
  lastActive: string
  description: string
}

export default function AgentList({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [showModal, setShowModal] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: '', model: 'claude-opus-4-6', description: '' })

  const handleCreate = () => {
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name || 'Untitled Agent',
      model: newAgent.model,
      status: 'idle',
      lastActive: 'Just now',
      description: newAgent.description || 'No description',
    }
    setAgents([agent, ...agents])
    setNewAgent({ name: '', model: 'claude-opus-4-6', description: '' })
    setShowModal(false)
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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Agent
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-card-bg border border-border rounded-lg p-4 hover:bg-card-hover transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                  <Bot className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <h3 className="text-[13px] font-medium">{agent.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{agent.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot(agent.status)}`} />
                <span className="text-[11px] text-muted">{statusLabel(agent.status)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted mt-3 pt-3 border-t border-border">
              <span className="font-mono">{agent.model}</span>
              <span>{agent.lastActive}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card-bg border border-border rounded-xl w-full max-w-md p-0 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold">Create Agent</h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1.5 font-medium">Name</label>
                <input
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Code Review Bot"
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5 font-medium">Model</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="claude-opus-4-6">Claude Opus 4.6</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                  <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5 font-medium">Description</label>
                <input
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="What does this agent do?"
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-[13px] text-muted hover:text-foreground rounded-md hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1.5 text-[13px] bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
