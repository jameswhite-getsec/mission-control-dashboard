import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'

const MEMORY_DIR = join(homedir(), '.openclaw', 'workspace', 'memory')
const MEMORY_INDEX = join(homedir(), '.openclaw', 'workspace', 'MEMORY.md')

function extractFrontmatter(content: string): { name?: string; type?: string; description?: string; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { body: content }
  const front = match[1]
  const body = match[2].trim()
  const get = (key: string) => {
    const m = front.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return m ? m[1].trim() : undefined
  }
  return {
    name: get('name'),
    type: get('type'),
    description: get('description'),
    body,
  }
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export async function GET() {
  try {
    const files: {
      name: string
      type: string
      description: string
      content: string
      updatedAt: string
    }[] = []

    // Read MEMORY.md index if it exists
    try {
      const indexContent = await readFile(MEMORY_INDEX, 'utf-8')
      const stats = await stat(MEMORY_INDEX)
      files.push({
        name: 'MEMORY.md',
        type: 'index',
        description: 'Memory index — pointers to all memory files',
        content: indexContent,
        updatedAt: timeAgo(stats.mtimeMs),
      })
    } catch { /* no index file */ }

    // Read all .md files from memory directory
    try {
      const entries = await readdir(MEMORY_DIR)
      const mdFiles = entries.filter((f) => f.endsWith('.md')).sort().reverse()

      for (const filename of mdFiles) {
        const filepath = join(MEMORY_DIR, filename)
        try {
          const [content, stats] = await Promise.all([
            readFile(filepath, 'utf-8'),
            stat(filepath),
          ])
          const { name, type, description } = extractFrontmatter(content)
          files.push({
            name: filename,
            type: type || 'note',
            description: description || name || filename,
            content,
            updatedAt: timeAgo(stats.mtimeMs),
          })
        } catch { /* skip unreadable files */ }
      }
    } catch { /* memory dir doesn't exist yet */ }

    if (files.length === 0) {
      return Response.json({ files: getMockFiles() })
    }

    return Response.json({ files })
  } catch {
    return Response.json({ files: getMockFiles() })
  }
}

function getMockFiles() {
  return [
    {
      name: 'user_role.md',
      type: 'user',
      description: 'Information about the user role and preferences',
      content: '---\nname: User Role\ndescription: Primary user role and context\ntype: user\n---\n\nSenior software engineer working on agent orchestration platform.\nPrefers concise communication and minimal abstractions.',
      updatedAt: '2 hours ago',
    },
    {
      name: 'feedback_testing.md',
      type: 'feedback',
      description: 'Testing preferences and guidelines',
      content: '---\nname: Testing Preferences\ndescription: How the user wants tests structured\ntype: feedback\n---\n\nUse integration tests against real services, not mocks.\n\n**Why:** Mock/prod divergence caused a broken migration last quarter.\n**How to apply:** Always write integration tests for API routes and database operations.',
      updatedAt: '1 day ago',
    },
  ]
}
