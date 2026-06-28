'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload Data', href: '/upload' },
  { label: 'AI Insights', href: '/insights' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen text-white flex flex-col px-4 py-8" style={{ backgroundColor: '#0E0E0E' }}>
      <div className="mb-10">
        <h1 className="text-xl font-bold tracking-tight">Retail AI</h1>
        <p className="text-sm text-zinc-400 mt-1">Analytics Dashboard</p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
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
