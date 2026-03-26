export interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'archived'
  githubRepo?: string  // e.g. "jameswhite-getsec/project-name"
  githubUrl?: string   // full URL
  agentIds: string[]   // agents assigned to this project
  createdAt: string
  updatedAt: string
}
