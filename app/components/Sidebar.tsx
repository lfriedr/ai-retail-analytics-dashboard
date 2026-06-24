// 'use client' is required here because we use usePathname(), which is a
// React hook. Hooks only work in Client Components. Server Components (the
// default in Next.js) can't use hooks or browser APIs.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Each nav item has a label (what the user sees) and an href (the URL path)
const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload Data', href: '/upload' },
  { label: 'AI Insights', href: '/insights' },
]

export default function Sidebar() {
  // usePathname() returns the current URL path, e.g. "/dashboard"
  // We use it to highlight the active nav link
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-zinc-900 text-white flex flex-col px-4 py-8">
      {/* App name / logo area */}
      <div className="mb-10">
        <h1 className="text-lg font-bold tracking-tight">Retail AI</h1>
        <p className="text-xs text-zinc-400 mt-1">Analytics Dashboard</p>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          // Check if this link matches the current page
          const isActive = pathname === item.href

          return (
            // Next.js <Link> does client-side navigation (no full page reload)
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
