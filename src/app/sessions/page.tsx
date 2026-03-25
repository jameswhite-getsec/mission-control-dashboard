import SessionsTable from './SessionsTable'

async function getSessions() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/sessions`, { cache: 'no-store' })
  return res.json()
}

export default async function SessionsPage() {
  const data = await getSessions()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Sessions</h1>
      <SessionsTable initialSessions={data.sessions} />
    </div>
  )
}
