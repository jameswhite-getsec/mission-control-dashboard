'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderKanban, ExternalLink, Users, CheckCircle2, Archive, Circle } from 'lucide-react'
import type { Project } from '@/types/project'
import type { Agent } from '@/types/agent'

const STATUS_STYLES: Record<Project['status'], { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-success-muted text-success' },
  completed: { label: 'Completed', cls: 'bg-primary/20 text-primary' },
  archived: { label: 'Archived', cls: 'bg-surface text-muted' },
}

function StatusIcon({ status }: { status: Project['status'] }) {
  if (status === 'active') return <Circle className="w-3 h-3 fill-current" />
  if (status === 'completed') return <CheckCircle2 className="w-3 h-3" />
  return <Archive className="w-3 h-3" />
}

interface CreateProjectDialogProps {
  allAgents: Agent[]
  onClose: () => void
  onCreate: (project: Project) => void
}

function CreateProjectDialog({ allAgents, onClose, onCreate }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<Project | null>(null)

  function toggleAgent(id: string) {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), agentIds: selectedAgentIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create project')
      setCreated(data.project)
      onCreate(data.project)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card-bg border border-border rounded-xl w-full max-w-md mx-4 shadow-xl">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold">New Project</h2>
        </div>

        {created ? (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-success text-[13px]">
              <CheckCircle2 className="w-4 h-4" />
              Project created successfully
            </div>
            {created.githubUrl && (
              <div>
                <p className="text-[11px] text-muted mb-1">GitHub Repository</p>
                <a
                  href={created.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[13px] text-primary hover:underline"
                >
                  {created.githubUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {!created.githubUrl && (
              <p className="text-[11px] text-muted">
                GitHub repo creation skipped (gh CLI not available or failed).
              </p>
            )}
            <button
              onClick={onClose}
              className="w-full px-3 py-2 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wide">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Cool Project"
                required
                className="w-full px-3 py-2 bg-input-bg border border-border rounded-md text-[13px] focus:outline-none focus:border-primary/60"
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
                className="w-full px-3 py-2 bg-input-bg border border-border rounded-md text-[13px] focus:outline-none focus:border-primary/60 resize-none"
              />
            </div>

            {allAgents.length > 0 && (
              <div>
                <label className="block text-[11px] text-muted mb-1.5 uppercase tracking-wide">
                  Assign Agents
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-border rounded-md p-2 bg-input-bg">
                  {allAgents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-card-hover cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(agent.id)}
                        onChange={() => toggleAgent(agent.id)}
                        className="accent-primary"
                      />
                      <span className="text-[13px]">{agent.name}</span>
                      <span className="text-[11px] text-muted ml-auto font-mono">{agent.model.replace('claude-', '')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-[12px] text-danger">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-surface border border-border text-[13px] rounded-md hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 px-3 py-2 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ProjectList({
  initialProjects,
  allAgents,
}: {
  initialProjects: Project[]
  allAgents: Agent[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [dialogOpen, setDialogOpen] = useState(false)

  const visible = projects.filter((p) => p.status !== 'archived')

  function handleCreate(project: Project) {
    setProjects((prev) => [project, ...prev])
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-muted">{visible.length} project{visible.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-lg p-12 text-center">
          <FolderKanban className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-[13px] text-muted">No projects yet. Create your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((project) => {
            const statusStyle = STATUS_STYLES[project.status]
            const assignedAgents = allAgents.filter((a) => project.agentIds.includes(a.id))
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-card-bg border border-border rounded-lg p-4 hover:bg-card-hover transition-colors block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${statusStyle.cls}`}>
                    <StatusIcon status={project.status} />
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{assignedAgents.length} agent{assignedAgents.length !== 1 ? 's' : ''}</span>
                  </div>
                  {project.githubUrl && (
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        window.open(project.githubUrl, '_blank')
                      }}
                      className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      GitHub
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {dialogOpen && (
        <CreateProjectDialog
          allAgents={allAgents}
          onClose={() => setDialogOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  )
}
