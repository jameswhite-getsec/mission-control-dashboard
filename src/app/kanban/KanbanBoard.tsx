'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Bot } from 'lucide-react'
import type { Agent, KanbanStatus } from '@/types/agent'
import AgentEditor from '@/components/AgentEditor'

const COLUMNS: { id: KanbanStatus; label: string; color: string; dot: string }[] = [
  { id: 'IDLE', label: 'Idle', color: 'text-warning', dot: 'bg-warning' },
  { id: 'RUNNING', label: 'Running', color: 'text-success', dot: 'bg-success' },
  { id: 'WAITING', label: 'Waiting', color: 'text-primary', dot: 'bg-primary' },
  { id: 'DONE', label: 'Done', color: 'text-muted', dot: 'bg-muted' },
  { id: 'FAILED', label: 'Failed', color: 'text-danger', dot: 'bg-danger' },
]

function agentStatusToKanban(status: Agent['status']): KanbanStatus {
  if (status === 'active') return 'RUNNING'
  if (status === 'error') return 'FAILED'
  return 'IDLE'
}

function kanbanToAgentStatus(k: KanbanStatus): Agent['status'] {
  if (k === 'RUNNING') return 'active'
  if (k === 'FAILED') return 'error'
  return 'idle'
}

const MODEL_COLORS: Record<string, string> = {
  'claude-opus-4-6': 'bg-primary-muted text-primary',
  'claude-sonnet-4-6': 'bg-success-muted text-success',
  'claude-haiku-4-5': 'bg-warning-muted text-warning',
}

function modelLabel(m: string) {
  if (m.includes('opus')) return 'Opus'
  if (m.includes('sonnet')) return 'Sonnet'
  if (m.includes('haiku')) return 'Haiku'
  return m
}

interface BoardState {
  [col: string]: (Agent & { kanbanStatus: KanbanStatus })[]
}

export default function KanbanBoard({ initialAgents }: { initialAgents: Agent[] }) {
  const [board, setBoard] = useState<BoardState>(() => {
    const b: BoardState = {}
    for (const col of COLUMNS) b[col.id] = []
    for (const agent of initialAgents) {
      const k = agentStatusToKanban(agent.status)
      b[k].push({ ...agent, kanbanStatus: k })
    }
    return b
  })

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    setBoard((prev) => {
      const next = { ...prev }
      const srcCol = [...prev[source.droppableId]]
      const [moved] = srcCol.splice(source.index, 1)

      if (source.droppableId === destination.droppableId) {
        srcCol.splice(destination.index, 0, moved)
        next[source.droppableId] = srcCol
      } else {
        const destCol = [...prev[destination.droppableId]]
        const newStatus = destination.droppableId as KanbanStatus
        const updated = { ...moved, kanbanStatus: newStatus, status: kanbanToAgentStatus(newStatus) }
        destCol.splice(destination.index, 0, updated)
        next[source.droppableId] = srcCol
        next[destination.droppableId] = destCol
      }
      return next
    })
  }, [])

  function handleCardClick(agent: Agent) {
    setEditingAgent(agent)
    setEditorOpen(true)
  }

  function handleSave(saved: Agent) {
    setBoard((prev) => {
      const next = { ...prev }
      for (const col of COLUMNS) {
        const idx = next[col.id].findIndex((a) => a.id === saved.id)
        if (idx >= 0) {
          next[col.id] = [...next[col.id]]
          next[col.id][idx] = { ...saved, kanbanStatus: col.id }
          break
        }
      }
      return next
    })
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col w-64 min-w-[240px] shrink-0">
              {/* Column header */}
              <div className="flex items-center gap-2 px-2 pb-3">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-[13px] font-medium">{col.label}</span>
                <span className="text-[11px] text-muted ml-auto">{board[col.id].length}</span>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg p-1.5 space-y-2 min-h-[120px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-surface' : 'bg-transparent'
                    }`}
                  >
                    {board[col.id].map((agent, index) => (
                      <Draggable key={agent.id} draggableId={agent.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            onClick={() => handleCardClick(agent)}
                            className={`bg-card-bg border border-border rounded-lg p-3 cursor-pointer hover:bg-card-hover transition-all ${
                              snap.isDragging ? 'shadow-lg shadow-black/30 ring-1 ring-primary/40' : ''
                            }`}
                          >
                            {/* Avatar + Name row */}
                            <div className="flex items-center gap-2.5 mb-2">
                              <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center overflow-hidden shrink-0">
                                {agent.avatarUrl ? (
                                  <img src={agent.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Bot className="w-3.5 h-3.5 text-muted" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-medium truncate">{agent.name}</div>
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.dot}`} />
                            </div>

                            {/* Model badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  MODEL_COLORS[agent.model] ?? 'bg-surface text-muted'
                                }`}
                              >
                                {modelLabel(agent.model)}
                              </span>
                            </div>

                            {/* Task text */}
                            {(agent.task || agent.description) && (
                              <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                                {agent.task || agent.description}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AgentEditor
        agent={editingAgent}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        allAgents={Object.values(board).flat()}
      />
    </>
  )
}
