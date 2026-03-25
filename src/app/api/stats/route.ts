export async function GET() {
  return Response.json({
    totalAgents: 8,
    activeSessions: 3,
    eventsToday: 47,
    totalTokensUsed: '2.4M',
    totalCost: '$12.87',
  })
}
