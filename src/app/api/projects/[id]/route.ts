import { readFile } from 'fs/promises'
import { join } from 'path'
import { execFileSync } from 'child_process'
import type { Project } from '@/types/project'

const LOCAL_PROJECTS_PATH = join(process.cwd(), '.local-projects.json')
const LOCAL_AGENTS_PATH = join(process.cwd(), '.local-agents.json')

async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await readFile(LOCAL_PROJECTS_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function stripProvider(model: string): string {
  const slash = model.indexOf('/')
  return slash >= 0 ? model.slice(slash + 1) : model
}

async function loadAllAgents() {
  // Load local overrides
  let localAgents: Record<string, unknown>[] = []
  try {
    const raw = await readFile(LOCAL_AGENTS_PATH, 'utf-8')
    localAgents = JSON.parse(raw)
  } catch {
    // ignore
  }

  // Load openclaw agents
  let clawAgents: Record<string, unknown>[] = []
  try {
    const out = execFileSync('openclaw', ['agents', 'list', '--json'], {
      encoding: 'utf-8',
      timeout: 8000,
    })
    const raw = JSON.parse(out)
    clawAgents = raw.map((a: { id: string; identityName?: string; model?: string }) => ({
      id: a.id,
      name: a.identityName || a.id,
      model: stripProvider(a.model || 'claude-opus-4-6'),
      status: 'idle',
      lastActive: 'unknown',
      description: `OpenClaw agent: ${a.id}`,
    }))
  } catch {
    // ignore
  }

  const localMap = new Map(localAgents.map((a) => [a.id as string, a]))
  const merged = clawAgents.map((ca) => {
    const local = localMap.get(ca.id as string)
    return local ? { ...ca, ...local } : ca
  })
  for (const local of localAgents) {
    if (!clawAgents.find((ca) => ca.id === local.id)) {
      merged.push(local)
    }
  }
  return merged
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const projects = await loadProjects()
    const project = projects.find((p) => p.id === id)

    if (!project) return Response.json({ error: 'not found' }, { status: 404 })

    const allAgents = await loadAllAgents()
    const agents = allAgents.filter((a) => project.agentIds.includes(a.id as string))

    return Response.json({ project, agents })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
