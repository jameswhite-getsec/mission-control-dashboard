import { execFileSync } from 'child_process'

type Session = {
  id: string
  agent: string
  status: 'running' | 'completed' | 'failed'
  duration: string
  cost: string
  startedAt: string
  totalTokens?: number
  model?: string
}

function msToHuman(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m < 60) return `${m}m ${sec}s`
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${h}h ${min}m`
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export async function GET() {
  try {
    const out = execFileSync('openclaw', ['sessions', '--json', '--all-agents'], {
      encoding: 'utf-8',
      timeout: 8000,
    })
    const data = JSON.parse(out)
    const raw = data.sessions ?? []

    const FIVE_MIN = 5 * 60 * 1000

    const sessions: Session[] = raw.map((s: {
      key: string
      sessionId: string
      agentId: string
      ageMs: number
      updatedAt: number
      totalTokens: number
      model: string
      abortedLastRun: boolean
    }) => {
      const isRecent = s.ageMs < FIVE_MIN
      const status: Session['status'] = s.abortedLastRun
        ? 'failed'
        : isRecent
        ? 'running'
        : 'completed'

      return {
        id: s.sessionId || s.key,
        agent: s.agentId,
        status,
        duration: msToHuman(s.ageMs),
        cost: '—',
        startedAt: formatTimestamp(s.updatedAt),
        totalTokens: s.totalTokens,
        model: s.model,
      }
    })

    return Response.json({ sessions })
  } catch {
    // Fall back to mock data if CLI unavailable
    return Response.json({
      sessions: [
        { id: 'sess-a1b2c3', agent: 'Code Review Bot', status: 'running', duration: '4m 22s', cost: '$0.34', startedAt: '10:32 AM' },
        { id: 'sess-d4e5f6', agent: 'Test Generator', status: 'running', duration: '12m 05s', cost: '$0.87', startedAt: '10:20 AM' },
        { id: 'sess-g7h8i9', agent: 'Bug Triager', status: 'running', duration: '2m 11s', cost: '$0.12', startedAt: '10:35 AM' },
        { id: 'sess-j0k1l2', agent: 'Code Review Bot', status: 'completed', duration: '8m 44s', cost: '$0.65', startedAt: '9:45 AM' },
        { id: 'sess-m3n4o5', agent: 'Doc Writer', status: 'completed', duration: '3m 18s', cost: '$0.09', startedAt: '9:30 AM' },
        { id: 'sess-p6q7r8', agent: 'Security Scanner', status: 'failed', duration: '1m 02s', cost: '$0.08', startedAt: '9:15 AM' },
      ],
    })
  }
}
