'use client'

import { useState, useEffect } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import type { Agent } from '@/types/agent'

const MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
]

const MD_TABS = ['SOUL.md', 'AGENTS.md', 'USER.md'] as const

interface AgentEditorProps {
  agent: Agent | null
  open: boolean
  onClose: () => void
  onSave: (agent: Agent) => void
}

export default function AgentEditor({ agent, open, onClose, onSave }: AgentEditorProps) {
  const isNew = !agent?.id
  const [form, setForm] = useState<Agent>(blank())
  const [activeTab, setActiveTab] = useState<(typeof MD_TABS)[number]>('SOUL.md')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(agent ? { ...agent, markdownFiles: agent.markdownFiles ?? blankMd() } : blank())
      setActiveTab('SOUL.md')
    }
  }, [open, agent])

  function blank(): Agent {
    return {
      id: '',
      name: '',
      model: 'claude-opus-4-6',
      status: 'idle',
      lastActive: 'Just now',
      description: '',
      avatarUrl: '',
      markdownFiles: blankMd(),
    }
  }

  function blankMd() {
    return { 'SOUL.md': '', 'AGENTS.md': '', 'USER.md': '' }
  }

  async function handleSave() {
    setSaving(true)
    const saved: Agent = {
      ...form,
      id: form.id || `agent-${Date.now()}`,
    }
    try {
      await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      })
      onSave(saved)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-card-bg border-l border-border z-50 flex flex-col transition-transform duration-200 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">{isNew ? 'Create Agent' : 'Edit Agent'}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Code Review Bot"
              className={inputClass}
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Model</label>
            <select
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className={inputClass}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What does this agent do?"
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Avatar URL</label>
            <div className="flex items-center gap-3">
              <input
                value={form.avatarUrl ?? ''}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.png"
                className={inputClass + ' flex-1'}
              />
              <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-muted" />
                )}
              </div>
            </div>
          </div>

          {/* Markdown files editor */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Markdown Files</label>
            <div className="flex gap-0 border-b border-border">
              {MD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <textarea
              value={form.markdownFiles?.[activeTab] ?? ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  markdownFiles: {
                    ...form.markdownFiles!,
                    [activeTab]: e.target.value,
                  },
                })
              }
              placeholder={`# ${activeTab}\n\nWrite markdown content here...`}
              rows={8}
              className={inputClass + ' resize-none mt-2 font-mono text-[12px]'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[13px] text-muted hover:text-foreground rounded-md hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-[13px] bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
