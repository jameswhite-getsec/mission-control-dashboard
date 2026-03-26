// TODO: openclaw doesn't expose an events/audit-log endpoint yet.
// When it does, replace this with: execFileSync('openclaw', ['events', 'list', '--json'])
export async function GET() {
  return Response.json({
    events: [
      { id: 'evt-001', type: 'info', message: 'Code Review Bot started new session', source: 'agent-001', timestamp: '10:35 AM' },
      { id: 'evt-002', type: 'success', message: 'Test Generator completed: 14 tests generated', source: 'agent-002', timestamp: '10:33 AM' },
      { id: 'evt-003', type: 'warning', message: 'Bug Triager approaching token limit (85%)', source: 'agent-004', timestamp: '10:30 AM' },
      { id: 'evt-004', type: 'error', message: 'Security Scanner failed: API rate limit exceeded', source: 'agent-006', timestamp: '10:28 AM' },
      { id: 'evt-005', type: 'info', message: 'New agent "Migration Assistant" created', source: 'system', timestamp: '10:25 AM' },
      { id: 'evt-006', type: 'success', message: 'Code Review Bot approved PR #142', source: 'agent-001', timestamp: '10:20 AM' },
      { id: 'evt-007', type: 'info', message: 'Session sess-d4e5f6 started for Test Generator', source: 'agent-002', timestamp: '10:20 AM' },
      { id: 'evt-008', type: 'warning', message: 'Dependency Checker found 3 outdated packages', source: 'agent-005', timestamp: '10:15 AM' },
      { id: 'evt-009', type: 'success', message: 'Doc Writer generated README for /src/utils', source: 'agent-003', timestamp: '10:10 AM' },
      { id: 'evt-010', type: 'info', message: 'System health check passed', source: 'system', timestamp: '10:00 AM' },
      { id: 'evt-011', type: 'error', message: 'Security Scanner: invalid API key configuration', source: 'agent-006', timestamp: '9:55 AM' },
      { id: 'evt-012', type: 'success', message: 'Performance Profiler completed analysis of /api routes', source: 'agent-007', timestamp: '9:50 AM' },
      { id: 'evt-013', type: 'info', message: 'Agent model updated: Bug Triager -> claude-sonnet-4-6', source: 'system', timestamp: '9:45 AM' },
      { id: 'evt-014', type: 'warning', message: 'Monthly cost threshold at 75% ($9.65 / $12.00)', source: 'system', timestamp: '9:30 AM' },
      { id: 'evt-015', type: 'success', message: 'Dependency Checker updated 2 packages successfully', source: 'agent-005', timestamp: '9:15 AM' },
    ],
  })
}
