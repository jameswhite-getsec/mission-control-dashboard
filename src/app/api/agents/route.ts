import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { execFileSync } from 'child_process'

const LOCAL_PATH = join(process.cwd(), '.local-agents.json')

type LocalAgentOverrides = {
  id: string
  name?: string
  model?: string
  status?: 'active' | 'idle' | 'error'
  lastActive?: string
  description?: string
  avatarUrl?: string
  parentId?: string
  task?: string
  kanbanStatus?: string
  markdownFiles?: {
    'SOUL.md': string
    'AGENTS.md': string
    'USER.md': string
  }
}

async function loadLocalOverrides(): Promise<LocalAgentOverrides[]> {
  try {
    const raw = await readFile(LOCAL_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveLocalOverrides(agents: LocalAgentOverrides[]) {
  await writeFile(LOCAL_PATH, JSON.stringify(agents, null, 2))
}

function stripProvider(model: string): string {
  // "anthropic/claude-opus-4-6" -> "claude-opus-4-6"
  const slash = model.indexOf('/')
  return slash >= 0 ? model.slice(slash + 1) : model
}

function getOpenClawAgents(): LocalAgentOverrides[] {
  try {
    const out = execFileSync('openclaw', ['agents', 'list', '--json'], {
      encoding: 'utf-8',
      timeout: 8000,
    })
    const raw = JSON.parse(out)
    return raw.map((a: { id: string; identityName?: string; model?: string }) => ({
      id: a.id,
      name: a.identityName || a.id,
      model: stripProvider(a.model || 'claude-opus-4-6'),
      status: 'idle' as const,
      lastActive: 'unknown',
      description: `OpenClaw agent: ${a.id}`,
    }))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const [clawAgents, localOverrides] = await Promise.all([
      Promise.resolve(getOpenClawAgents()),
      loadLocalOverrides(),
    ])

    // Build a map of local overrides by id
    const localMap = new Map(localOverrides.map((a) => [a.id, a]))

    // Start with openclaw agents as base, overlay local fields
    const merged = clawAgents.map((ca) => {
      const local = localMap.get(ca.id)
      return local ? { ...ca, ...local } : ca
    })

    // Add any local-only agents (not in openclaw) — custom/mock agents
    for (const local of localOverrides) {
      if (!clawAgents.find((ca) => ca.id === local.id)) {
        merged.push(local)
      }
    }

    // If openclaw returned nothing and no local overrides, fall back to defaults
    if (merged.length === 0) {
      return Response.json({ agents: getDefaultAgents() })
    }

    return Response.json({ agents: merged })
  } catch {
    return Response.json({ agents: getDefaultAgents() })
  }
}

export async function PUT(request: Request) {
  try {
    const agent = await request.json()
    const overrides = await loadLocalOverrides()
    const idx = overrides.findIndex((a) => a.id === agent.id)
    if (idx >= 0) {
      overrides[idx] = agent
    } else {
      overrides.unshift(agent)
    }
    await saveLocalOverrides(overrides)
    return Response.json({ agent })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...fields } = await request.json()
    if (!id) return Response.json({ error: 'id required' }, { status: 400 })

    const overrides = await loadLocalOverrides()
    const idx = overrides.findIndex((a) => a.id === id)
    if (idx >= 0) {
      overrides[idx] = { ...overrides[idx], ...fields }
    } else {
      overrides.unshift({ id, ...fields })
    }
    await saveLocalOverrides(overrides)
    return Response.json({ agent: overrides[idx >= 0 ? idx : 0] })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

function getDefaultAgents(): LocalAgentOverrides[] {
  return [
    { id: 'agent-001', name: 'Code Review Bot', model: 'claude-opus-4-6', status: 'active', lastActive: '2 min ago', description: 'Reviews pull requests and suggests improvements' },
    { id: 'agent-002', name: 'Test Generator', model: 'claude-sonnet-4-6', status: 'active', lastActive: '5 min ago', description: 'Generates unit and integration tests' },
    { id: 'agent-003', name: 'Doc Writer', model: 'claude-haiku-4-5', status: 'idle', lastActive: '1 hour ago', description: 'Generates documentation from code' },
    { id: 'agent-004', name: 'Bug Triager', model: 'claude-sonnet-4-6', status: 'active', lastActive: '12 min ago', description: 'Analyzes and categorizes bug reports' },
    { id: 'agent-005', name: 'Dependency Checker', model: 'claude-haiku-4-5', status: 'idle', lastActive: '3 hours ago', description: 'Monitors and updates package dependencies' },
    { id: 'agent-006', name: 'Security Scanner', model: 'claude-opus-4-6', status: 'error', lastActive: '30 min ago', description: 'Scans code for security vulnerabilities' },
    { id: 'agent-007', name: 'Performance Profiler', model: 'claude-sonnet-4-6', status: 'idle', lastActive: '2 hours ago', description: 'Identifies performance bottlenecks' },
    { id: 'agent-008', name: 'Migration Assistant', model: 'claude-opus-4-6', status: 'idle', lastActive: '1 day ago', description: 'Helps migrate between framework versions' },
  ]
}
