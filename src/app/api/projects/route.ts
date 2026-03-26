import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { execFileSync } from 'child_process'
import type { Project } from '@/types/project'

const LOCAL_PATH = join(process.cwd(), '.local-projects.json')

async function loadProjects(): Promise<Project[]> {
  try {
    const raw = await readFile(LOCAL_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveProjects(projects: Project[]) {
  await writeFile(LOCAL_PATH, JSON.stringify(projects, null, 2))
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET() {
  try {
    const projects = await loadProjects()
    return Response.json({ projects })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, agentIds = [] } = body

    if (!name) return Response.json({ error: 'name required' }, { status: 400 })

    const slug = toSlug(name)
    const id = `project-${Date.now()}`
    const now = new Date().toISOString()

    let githubRepo: string | undefined
    let githubUrl: string | undefined

    // Auto-create GitHub repo
    try {
      execFileSync('gh', ['repo', 'create', `jameswhite-getsec/${slug}`, '--private', '-y'], {
        encoding: 'utf-8',
        timeout: 30000,
      })
      githubRepo = `jameswhite-getsec/${slug}`
      githubUrl = `https://github.com/jameswhite-getsec/${slug}`
    } catch {
      // GitHub repo creation is best-effort; continue without it
    }

    const project: Project = {
      id,
      name,
      description: description || '',
      status: 'active',
      githubRepo,
      githubUrl,
      agentIds,
      createdAt: now,
      updatedAt: now,
    }

    const projects = await loadProjects()
    projects.unshift(project)
    await saveProjects(projects)

    return Response.json({ project })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (!id) return Response.json({ error: 'id required' }, { status: 400 })

    const projects = await loadProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx < 0) return Response.json({ error: 'not found' }, { status: 404 })

    projects[idx] = { ...projects[idx], ...fields, id, updatedAt: new Date().toISOString() }
    await saveProjects(projects)

    return Response.json({ project: projects[idx] })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return Response.json({ error: 'id required' }, { status: 400 })

    const projects = await loadProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx < 0) return Response.json({ error: 'not found' }, { status: 404 })

    // Soft delete — set status to archived
    projects[idx] = { ...projects[idx], status: 'archived', updatedAt: new Date().toISOString() }
    await saveProjects(projects)

    return Response.json({ project: projects[idx] })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
