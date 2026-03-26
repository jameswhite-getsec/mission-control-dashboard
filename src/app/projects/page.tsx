import type { Project } from '@/types/project'
import type { Agent } from '@/types/agent'
import ProjectList from './ProjectList'

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const [projectsRes, agentsRes] = await Promise.all([
    fetch(`${base}/api/projects`, { cache: 'no-store' }),
    fetch(`${base}/api/agents`, { cache: 'no-store' }),
  ])
  const [projectsData, agentsData] = await Promise.all([
    projectsRes.json(),
    agentsRes.json(),
  ])
  return {
    projects: (projectsData.projects || []) as Project[],
    agents: (agentsData.agents || []) as Agent[],
  }
}

export default async function ProjectsPage() {
  const { projects, agents } = await getData()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Projects</h1>
      </div>
      <ProjectList initialProjects={projects} allAgents={agents} />
    </div>
  )
}
