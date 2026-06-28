// This is the ROOT layout — it wraps every single page in the app.
// Think of it as the outer HTML shell. Whatever you put here appears everywhere.
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

// Load Google Fonts and expose them as CSS variables so Tailwind can use them
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Metadata sets the <title> and <meta description> tags in the browser tab.
// Next.js handles injecting these into <head> — don't add <head> tags manually.
export const metadata: Metadata = {
  title: 'Retail AI Dashboard',
  description: 'AI-powered sales analytics for retail stores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen text-zinc-900" style={{ backgroundColor: '#1A1A19' }}>
        {/* Sidebar stays fixed on the left on every page */}
        <Sidebar />

        {/* Main content area — this is where each page.tsx renders */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
