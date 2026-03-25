import EventLog from './EventLog'

async function getEvents() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/events`, { cache: 'no-store' })
  return res.json()
}

export default async function EventsPage() {
  const data = await getEvents()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Events</h1>
      <EventLog initialEvents={data.events} />
    </div>
  )
}
