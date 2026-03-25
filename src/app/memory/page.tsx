import MemoryViewer from './MemoryViewer'

async function getMemoryFiles() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'
  const res = await fetch(`${base}/api/memory`, { cache: 'no-store' })
  return res.json()
}

export default async function MemoryPage() {
  const data = await getMemoryFiles()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Memory</h1>
      <MemoryViewer initialFiles={data.files} />
    </div>
  )
}
