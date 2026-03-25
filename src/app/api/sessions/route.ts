export async function GET() {
  return Response.json({
    sessions: [
      { id: 'sess-a1b2c3', agent: 'Code Review Bot', status: 'running', duration: '4m 22s', cost: '$0.34', startedAt: '10:32 AM' },
      { id: 'sess-d4e5f6', agent: 'Test Generator', status: 'running', duration: '12m 05s', cost: '$0.87', startedAt: '10:20 AM' },
      { id: 'sess-g7h8i9', agent: 'Bug Triager', status: 'running', duration: '2m 11s', cost: '$0.12', startedAt: '10:35 AM' },
      { id: 'sess-j0k1l2', agent: 'Code Review Bot', status: 'completed', duration: '8m 44s', cost: '$0.65', startedAt: '9:45 AM' },
      { id: 'sess-m3n4o5', agent: 'Doc Writer', status: 'completed', duration: '3m 18s', cost: '$0.09', startedAt: '9:30 AM' },
      { id: 'sess-p6q7r8', agent: 'Security Scanner', status: 'failed', duration: '1m 02s', cost: '$0.08', startedAt: '9:15 AM' },
      { id: 'sess-s9t0u1', agent: 'Test Generator', status: 'completed', duration: '15m 33s', cost: '$1.12', startedAt: '8:50 AM' },
      { id: 'sess-v2w3x4', agent: 'Dependency Checker', status: 'completed', duration: '1m 45s', cost: '$0.04', startedAt: '8:30 AM' },
      { id: 'sess-y5z6a7', agent: 'Performance Profiler', status: 'completed', duration: '22m 10s', cost: '$1.54', startedAt: '8:00 AM' },
      { id: 'sess-b8c9d0', agent: 'Migration Assistant', status: 'failed', duration: '5m 22s', cost: '$0.41', startedAt: 'Yesterday' },
    ],
  })
}
