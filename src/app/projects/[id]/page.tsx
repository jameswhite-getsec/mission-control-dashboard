import { notFound } from 'next/navigation'
import type { Project } from '@/types/project'
import type { Agent } from '@/types/agent'
import ProjectDashboard from './ProjectDashboard'

async function getData(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/projects/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json() as Promise<{ project: Project; agents: Agent[] }>
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getData(id)
  if (!data) notFound()

  return <ProjectDashboard project={data.project} initialAgents={data.agents} />
}
