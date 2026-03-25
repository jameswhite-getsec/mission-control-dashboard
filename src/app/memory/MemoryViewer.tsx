'use client'

import { useState } from 'react'
import { FileText, Save } from 'lucide-react'

interface MemoryFile {
  name: string
  type: string
  description: string
  content: string
  updatedAt: string
}

const typeBadge: Record<string, string> = {
  user: 'bg-primary-muted text-primary',
  feedback: 'bg-success-muted text-success',
  project: 'bg-warning-muted text-warning',
  reference: 'bg-danger-muted text-danger',
}

export default function MemoryViewer({ initialFiles }: { initialFiles: MemoryFile[] }) {
  const [files, setFiles] = useState<MemoryFile[]>(initialFiles)
  const [selected, setSelected] = useState<number>(0)
  const [editContent, setEditContent] = useState(initialFiles[0]?.content || '')

  const handleSelect = (idx: number) => {
    setSelected(idx)
    setEditContent(files[idx].content)
  }

  const handleSave = () => {
    const updated = [...files]
    updated[selected] = { ...updated[selected], content: editContent }
    setFiles(updated)
  }

  return (
    <div className="grid grid-cols-3 gap-3 h-[calc(100vh-140px)]">
      <div className="bg-card-bg border border-border rounded-lg overflow-y-auto">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-[13px] font-medium">{files.length} memory files</h2>
        </div>
        <div className="divide-y divide-border">
          {files.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                selected === idx ? 'bg-surface' : 'hover:bg-card-hover'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className="text-[13px] font-medium truncate">{file.name}</span>
              </div>
              <div className="text-[11px] text-muted ml-[22px] line-clamp-1">{file.description}</div>
              <div className="flex items-center gap-2 mt-1.5 ml-[22px]">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeBadge[file.type] || 'bg-surface text-muted'}`}>
                  {file.type}
                </span>
                <span className="text-[11px] text-muted">{file.updatedAt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-2 bg-card-bg border border-border rounded-lg flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-medium">{files[selected]?.name}</h2>
            <p className="text-[11px] text-muted mt-0.5">{files[selected]?.description}</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="flex-1 p-4 text-[13px] font-mono bg-transparent text-foreground/90 resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
