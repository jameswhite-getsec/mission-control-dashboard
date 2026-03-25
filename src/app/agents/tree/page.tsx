import type { Agent } from '@/types/agent'
import AgentTree from './AgentTree'

export default async function AgentTreePage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3333'
  const res = await fetch(`${base}/api/agents`, { cache: 'no-store' })
  const { agents }: { agents: Agent[] } = await res.json()

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-1">Agent Tree</h1>
      <p className="text-[13px] text-muted mb-6">Visual hierarchy of agents and their relationships</p>
      <AgentTree initialAgents={agents} />
    </div>
  )
}
