'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import type { Agent } from '@/types/agent'

const MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
]

const MD_TABS = ['SOUL.md', 'AGENTS.md', 'USER.md'] as const
type AvatarMode = 'upload' | 'url'

interface AgentEditorProps {
  agent: Agent | null
  open: boolean
  onClose: () => void
  onSave: (agent: Agent) => void
  allAgents?: Agent[]
}

export default function AgentEditor({ agent, open, onClose, onSave, allAgents }: AgentEditorProps) {
  const isNew = !agent?.id
  const [form, setForm] = useState<Agent>(blank())
  const [activeTab, setActiveTab] = useState<(typeof MD_TABS)[number]>('SOUL.md')
  const [saving, setSaving] = useState(false)
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('upload')
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(agent ? { ...agent, markdownFiles: agent.markdownFiles ?? blankMd() } : blank())
      setActiveTab('SOUL.md')
      setAvatarPreview(null)
      setAvatarMode(agent?.avatarUrl ? 'url' : 'upload')
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
      parentId: '',
      markdownFiles: blankMd(),
    }
  }

  function blankMd() {
    return { 'SOUL.md': '', 'AGENTS.md': '', 'USER.md': '' }
  }

  async function handleAvatarUpload(file: File) {
    const agentId = form.id || `agent-${Date.now()}`
    if (!form.id) setForm((f) => ({ ...f, id: agentId }))

    setUploading(true)
    try {
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      const fd = new FormData()
      fd.append('file', file)
      fd.append('agentId', agentId)

      const res = await fetch('/api/avatars', { method: 'POST', body: fd })
      const { url } = await res.json()
      setForm((f) => ({ ...f, id: agentId, avatarUrl: url }))
    } finally {
      setUploading(false)
    }
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

  const parentOptions = (allAgents ?? []).filter((a) => a.id !== form.id && a.id !== '')

  const inputClass =
    'w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'

  const displayAvatar = avatarPreview || form.avatarUrl

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

          {/* Parent Agent */}
          {parentOptions.length > 0 && (
            <div>
              <label className="text-xs text-muted block mb-1.5 font-medium">Parent (Boss) Agent</label>
              <select
                value={form.parentId ?? ''}
                onChange={(e) => setForm({ ...form, parentId: e.target.value || undefined })}
                className={inputClass}
              >
                <option value="">None (root agent)</option>
                {parentOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Avatar */}
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Avatar</label>
            {/* Mode tabs */}
            <div className="flex gap-0 border-b border-border mb-3">
              {(['upload', 'url'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAvatarMode(mode)}
                  className={`px-3 py-1.5 text-[12px] font-medium transition-colors border-b-2 -mb-px capitalize ${
                    avatarMode === mode
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                >
                  {mode === 'upload' ? 'Upload' : 'URL'}
                </button>
              ))}
            </div>

            {avatarMode === 'upload' ? (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAvatarUpload(file)
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-muted hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Choose file'}
                </button>
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
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
            ) : (
              <div className="flex items-center gap-3">
                <input
                  value={form.avatarUrl ?? ''}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.png"
                  className={inputClass + ' flex-1'}
                />
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden">
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
            )}
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
            {saving ? 'Saving...' : isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}
