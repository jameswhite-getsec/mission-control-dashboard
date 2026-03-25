import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

const AVATARS_DIR = join(process.cwd(), 'public', 'avatars')

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const agentId = formData.get('agentId') as string | null

  if (!file || !agentId) {
    return Response.json({ error: 'Missing file or agentId' }, { status: 400 })
  }

  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const ext = extname(file.name).toLowerCase()
  if (!allowed.includes(ext)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  await mkdir(AVATARS_DIR, { recursive: true })

  const filename = `${agentId}${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())
  await writeFile(join(AVATARS_DIR, filename), bytes)

  const url = `/avatars/${filename}`
  return Response.json({ url })
}
