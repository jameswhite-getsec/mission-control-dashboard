export interface Agent {
  id: string
  name: string
  model: string
  status: 'active' | 'idle' | 'error'
  lastActive: string
  description: string
  avatarUrl?: string
  task?: string
  markdownFiles?: {
    'SOUL.md': string
    'AGENTS.md': string
    'USER.md': string
  }
}

export type KanbanStatus = 'IDLE' | 'RUNNING' | 'WAITING' | 'DONE' | 'FAILED'

export interface KanbanAgent extends Agent {
  kanbanStatus: KanbanStatus
}
