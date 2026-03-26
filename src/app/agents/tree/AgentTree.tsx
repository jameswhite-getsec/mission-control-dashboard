'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, Bot } from 'lucide-react'
import type { Agent } from '@/types/agent'
import AgentEditor from '@/components/AgentEditor'

interface TreeNode {
  agent: Agent
  children: TreeNode[]
}

function buildTree(agents: Agent[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  agents.forEach((a) => map.set(a.id, { agent: a, children: [] }))

  const roots: TreeNode[] = []
  agents.forEach((a) => {
    const node = map.get(a.id)!
    if (a.parentId && map.has(a.parentId)) {
      map.get(a.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

const MODEL_COLORS: Record<string, string> = {
  'claude-opus-4-6': 'bg-primary/20 text-primary',
  'claude-sonnet-4-6': 'bg-success-muted text-success',
  'claude-haiku-4-5': 'bg-warning-muted text-warning',
}

function modelLabel(model: string) {
  if (model.includes('opus')) return 'Opus'
  if (model.includes('sonnet')) return 'Sonnet'
  if (model.includes('haiku')) return 'Haiku'
  return model
}

function statusColor(s: string) {
  return s === 'active' ? 'bg-success' : s === 'idle' ? 'bg-warning' : 'bg-danger'
}

/** Single leaf-level agent card (no children) */
function AgentCard({
  node,
  onEdit,
}: {
  node: TreeNode
  onEdit: (agent: Agent) => void
}) {
  const agent = node.agent
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-card-hover cursor-pointer transition-colors"
      onClick={() => onEdit(agent)}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Bot className="w-4 h-4 text-muted" />
        )}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusColor(agent.status)} border-2 border-card-bg`}
        />
      </div>

      {/* Name & description */}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium truncate">{agent.name}</div>
        <div className="text-[11px] text-muted truncate">{agent.description}</div>
      </div>

      {/* Model badge */}
      <span
        className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${MODEL_COLORS[agent.model] ?? 'bg-surface text-muted'}`}
      >
        {modelLabel(agent.model)}
      </span>
    </div>
  )
}

/** Manager node: renders a bordered container box with header + children inside */
function ManagerBox({
  node,
  depth,
  onEdit,
}: {
  node: TreeNode
  depth: number
  onEdit: (agent: Agent) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const agent = node.agent

  // Slightly different bg per depth level for visual nesting
  const bgClass = depth === 0 ? 'bg-surface/50' : 'bg-card-bg/60'

  return (
    <div className={`rounded-xl border border-border ${bgClass} overflow-hidden`}>
      {/* Header row */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-card-hover transition-colors border-b border-border"
        onClick={() => onEdit(agent)}
      >
        {/* Expand/collapse */}
        <button
          className="w-4 h-4 flex items-center justify-center shrink-0 text-muted hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Bot className="w-4 h-4 text-muted" />
          )}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusColor(agent.status)} border-2 border-card-bg`}
          />
        </div>

        {/* Name & description */}
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold truncate">{agent.name}</div>
          <div className="text-[11px] text-muted truncate">{agent.description}</div>
        </div>

        {/* Sub-agent count */}
        <span className="text-[11px] text-muted shrink-0">
          {node.children.length} sub-agent{node.children.length !== 1 ? 's' : ''}
        </span>

        {/* Model badge */}
        <span
          className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${MODEL_COLORS[agent.model] ?? 'bg-surface text-muted'}`}
        >
          {modelLabel(agent.model)}
        </span>
      </div>

      {/* Children area */}
      {expanded && (
        <div className="p-2 space-y-2">
          {node.children.map((child) =>
            child.children.length > 0 ? (
              <ManagerBox key={child.agent.id} node={child} depth={depth + 1} onEdit={onEdit} />
            ) : (
              <AgentCard key={child.agent.id} node={child} onEdit={onEdit} />
            )
          )}
        </div>
      )}
    </div>
  )
}

export default function AgentTree({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const tree = buildTree(agents)

  const handleEdit = useCallback((agent: Agent) => {
    setEditingAgent(agent)
    setEditorOpen(true)
  }, [])

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

  return (
    <>
      <div className="space-y-3">
        {tree.length === 0 ? (
          <div className="bg-card-bg border border-border rounded-lg p-8 text-center">
            <p className="text-[13px] text-muted">No agents configured</p>
          </div>
        ) : (
          tree.map((node) =>
            node.children.length > 0 ? (
              <ManagerBox key={node.agent.id} node={node} depth={0} onEdit={handleEdit} />
            ) : (
              <div key={node.agent.id} className="bg-card-bg border border-border rounded-lg">
                <AgentCard node={node} onEdit={handleEdit} />
              </div>
            )
          )
        )}
      </div>

      <AgentEditor
        agent={editingAgent}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        allAgents={agents}
      />
    </>
  )
}
