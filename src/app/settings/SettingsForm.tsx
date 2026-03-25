'use client'

import { useState } from 'react'
import { Save, Check } from 'lucide-react'

export default function SettingsForm() {
  const [model, setModel] = useState('claude-opus-4-6')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.anthropic.com')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const models = [
    { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', desc: 'Most capable, best for complex tasks' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', desc: 'Balanced performance and speed' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', desc: 'Fastest, best for simple tasks' },
  ]

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card-bg border border-border rounded-lg p-5">
        <h2 className="text-[13px] font-medium mb-4">Default Model</h2>
        <div className="space-y-2">
          {models.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                model === opt.id ? 'border-primary bg-primary-muted' : 'border-border hover:bg-card-hover'
              }`}
            >
              <input
                type="radio"
                name="model"
                value={opt.id}
                checked={model === opt.id}
                onChange={(e) => setModel(e.target.value)}
                className="accent-primary"
              />
              <div>
                <div className="text-[13px] font-medium">{opt.label}</div>
                <div className="text-[11px] text-muted">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-card-bg border border-border rounded-lg p-5">
        <h2 className="text-[13px] font-medium mb-4">API Configuration</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5 font-medium">Base URL</label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-md bg-input-bg text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
            />
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-border rounded-lg p-5">
        <h2 className="text-[13px] font-medium mb-4">Theme</h2>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 text-[13px] rounded-md font-medium transition-colors ${
                theme === t
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover transition-colors"
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
