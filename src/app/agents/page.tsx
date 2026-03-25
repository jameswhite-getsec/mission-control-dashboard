import { Plus } from 'lucide-react'
import AgentList from './AgentList'

async function getAgents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/agents`, { cache: 'no-store' })
  return res.json()
}

export default async function AgentsPage() {
  const data = await getAgents()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Agents</h1>
      </div>
      <AgentList initialAgents={data.agents} />
    </div>
  )
}
