import { NextResponse } from 'next/server'
export async function GET(){
  return NextResponse.json({tools:['notifier','git','deploy']})
}

export async function POST(req:Request){
  const body = await req.json()
  return NextResponse.json({ok:true, received:body})
}
JS

# update layout import paths in src/app/layout.tsx to use our Layout? keep default app layout to wrap
sed -n '1,200p' src/app/layout.tsx > /dev/null || true

git add . && git commit -m "feat(ui): add Linear-like layout, board columns, and tools API" || true
