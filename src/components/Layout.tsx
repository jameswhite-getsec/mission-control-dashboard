import Link from 'next/link'
export default function Layout({children}:{children:React.ReactNode}){
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 p-4">
          <div className="text-xl font-semibold mb-6">Mission Control</div>
          <nav className="space-y-2 text-sm">
            <Link href="#" className="block px-2 py-1 rounded hover:bg-slate-100">Inbox</Link>
            <Link href="#" className="block px-2 py-1 rounded hover:bg-slate-100">Boards</Link>
            <Link href="#" className="block px-2 py-1 rounded hover:bg-slate-100">Projects</Link>
            <Link href="#" className="block px-2 py-1 rounded hover:bg-slate-100">Settings</Link>
          </nav>
        </aside>
        <main className="flex-1">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-slate-500">☰</button>
              <h1 className="text-lg font-semibold">Board — Personal</h1>
            </div>
            <div className="flex items-center gap-3">
              <input placeholder="Search" className="border rounded px-2 py-1 text-sm" />
              <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">New</button>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
