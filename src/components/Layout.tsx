// This file is no longer used — layout is handled by app/layout.tsx + Sidebar.tsx
// Kept to avoid import errors during migration; can be safely deleted.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
