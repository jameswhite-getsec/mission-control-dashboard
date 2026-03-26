import { execFileSync } from 'child_process'

export async function GET() {
  try {
    const out = execFileSync('openclaw', ['status', '--json'], {
      encoding: 'utf-8',
      timeout: 8000,
    })
    const data = JSON.parse(out)

    const defaultModel = data.sessions?.defaults?.model ?? 'claude-opus-4-6'
    const recentSession = data.sessions?.recent?.[0]
    const activeModel = recentSession?.model ?? defaultModel
    const channels = data.channelSummary ?? []
    const version = data.runtimeVersion ?? 'unknown'

    return Response.json({
      model: activeModel,
      defaultModel,
      version,
      channels,
      status: 'ok',
    })
  } catch {
    return Response.json({
      model: 'claude-opus-4-6',
      defaultModel: 'claude-opus-4-6',
      version: 'unknown',
      channels: [],
      status: 'unavailable',
    })
  }
}

// TODO: Model changes require openclaw config set / gateway tool — this is read-only for now
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // TODO: Wire to `openclaw config set model <value>` when that CLI command is available
    return Response.json({
      message: 'Settings noted. To change the active model, use: openclaw config set model <model-id>',
      received: body,
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
