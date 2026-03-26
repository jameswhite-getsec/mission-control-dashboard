import type { Project } from '@/types/project'
import KanbanBoard from './KanbanBoard'

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const [agentsRes, projectsRes] = await Promise.all([
    fetch(`${base}/api/agents`, { cache: 'no-store' }),
    fetch(`${base}/api/projects`, { cache: 'no-store' }),
  ])
  const [agentsData, projectsData] = await Promise.all([
    agentsRes.json(),
    projectsRes.json(),
  ])
  return {
    agents: agentsData.agents || [],
    projects: (projectsData.projects || []) as Project[],
  }
}

export default async function KanbanPage() {
  const { agents, projects } = await getData()
  const activeProjects = projects.filter((p: Project) => p.status === 'active')

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Kanban Board</h1>
      </div>
      <KanbanBoard initialAgents={agents} projects={activeProjects} />
    </div>
  )
}
