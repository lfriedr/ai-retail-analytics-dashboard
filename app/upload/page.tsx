// Upload page — lives at /upload
// Needs 'use client' because we use useState and handle form events.
'use client'

import { useState, useRef } from 'react'

// A few rows shown in the demo preview table — just enough to give context
const DEMO_PREVIEW = [
  // January
  { date: '2026-01-05', product: '4/3 Wetsuit', brand: "O'Neill", category: 'Wetsuits', units: 3, revenue: 510 },
  { date: '2026-01-08', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 6, revenue: 330 },
  { date: '2026-01-10', product: "Surfboard 6'2", brand: 'Channel Islands', category: 'Surfboards', units: 1, revenue: 650 },
  { date: '2026-01-12', product: 'Rash Guard LS', brand: 'Rip Curl', category: 'Apparel', units: 4, revenue: 180 },
  { date: '2026-01-15', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 5, revenue: 125 },
  { date: '2026-01-18', product: 'Fins Thruster', brand: 'FCS', category: 'Accessories', units: 3, revenue: 135 },
  { date: '2026-01-20', product: 'Beanie', brand: 'Billabong', category: 'Apparel', units: 7, revenue: 140 },
  { date: '2026-01-22', product: '4/3 Wetsuit', brand: 'Rip Curl', category: 'Wetsuits', units: 2, revenue: 350 },
  { date: '2026-01-25', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 12, revenue: 60 },
  { date: '2026-01-28', product: 'Boardshorts 18in', brand: 'Quiksilver', category: 'Boardshorts', units: 4, revenue: 180 },
  // February
  { date: '2026-02-02', product: "Surfboard 7'0", brand: 'Firewire', category: 'Surfboards', units: 1, revenue: 720 },
  { date: '2026-02-05', product: '4/3 Wetsuit', brand: "O'Neill", category: 'Wetsuits', units: 4, revenue: 680 },
  { date: '2026-02-08', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 8, revenue: 440 },
  { date: '2026-02-10', product: 'Wetsuit Boots', brand: 'Rip Curl', category: 'Wetsuits', units: 3, revenue: 195 },
  { date: '2026-02-12', product: 'Rash Guard SS', brand: "O'Neill", category: 'Apparel', units: 5, revenue: 175 },
  { date: '2026-02-14', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 6, revenue: 150 },
  { date: '2026-02-18', product: "Surfboard 6'8", brand: 'Channel Islands', category: 'Surfboards', units: 1, revenue: 750 },
  { date: '2026-02-20', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 15, revenue: 75 },
  { date: '2026-02-22', product: 'Boardshorts 18in', brand: 'Quiksilver', category: 'Boardshorts', units: 5, revenue: 225 },
  { date: '2026-02-25', product: 'Fins Thruster', brand: 'FCS', category: 'Accessories', units: 4, revenue: 180 },
  // March
  { date: '2026-03-01', product: "Surfboard 6'4", brand: 'Channel Islands', category: 'Surfboards', units: 2, revenue: 1400 },
  { date: '2026-03-04', product: '4/3 Wetsuit', brand: 'Rip Curl', category: 'Wetsuits', units: 5, revenue: 875 },
  { date: '2026-03-07', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 10, revenue: 550 },
  { date: '2026-03-10', product: 'Rash Guard LS', brand: 'Rip Curl', category: 'Apparel', units: 6, revenue: 270 },
  { date: '2026-03-12', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 18, revenue: 90 },
  { date: '2026-03-15', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 7, revenue: 175 },
  { date: '2026-03-18', product: "Surfboard 7'2", brand: 'Firewire', category: 'Surfboards', units: 1, revenue: 850 },
  { date: '2026-03-20', product: 'Beanie', brand: 'Quiksilver', category: 'Apparel', units: 5, revenue: 100 },
  { date: '2026-03-22', product: 'Wetsuit Boots', brand: "O'Neill", category: 'Wetsuits', units: 4, revenue: 260 },
  { date: '2026-03-28', product: 'Boardshorts 18in', brand: 'Billabong', category: 'Boardshorts', units: 9, revenue: 405 },
]
import { useRouter } from 'next/navigation'
import { getSessionId } from '../lib/session'
import type { SaleRow } from '../api/upload/route'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [rows, setRows] = useState<SaleRow[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)

  // useRef lets us programmatically click the hidden file input
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    setFile(picked)
    setStatus('idle')
    setRows([])
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0] ?? null
    setFile(dropped)
    setStatus('idle')
    setRows([])
  }

  async function handleUpload() {
    if (!file) return

    setStatus('uploading')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', getSessionId())

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error ?? 'Upload failed')
        return
      }

      setRows(data.rows)
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Network error — is the server running?')
    }
  }

  // Loads hardcoded demo data into Supabase, then navigates to the dashboard
  async function handleLoadDemo() {
    setDemoLoading(true)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: getSessionId() }),
      })
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        alert(`Demo failed: ${data.error}`)
      }
    } catch {
      alert('Network error loading demo data')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Upload Sales Data</h2>
        <p className="text-zinc-500">
          Upload a CSV with columns: Date, Product, Brand, Category, Units, Revenue
        </p>
      </div>

      {/* Drop zone — clicking it triggers the hidden file input */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="bg-white rounded-xl border-2 border-dashed border-zinc-300 p-16 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-zinc-400 transition-colors mb-6"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <>
            <p className="font-medium text-zinc-700">{file.name}</p>
            <p className="text-zinc-400 text-sm">{(file.size / 1024).toFixed(1)} KB — click to change</p>
          </>
        ) : (
          <>
            <p className="text-zinc-500 font-medium">Drop a CSV here, or click to browse</p>
            <p className="text-zinc-300 text-xs">Only .csv files accepted</p>
          </>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="bg-transparent border border-zinc-500 text-zinc-300 px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-zinc-300 transition-colors"
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload & Parse'}
      </button>

      {status === 'error' && (
        <p className="mt-4 text-red-500 text-sm">{errorMessage}</p>
      )}

      {/* Demo section — button + preview table at the bottom */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-zinc-400 text-base">Just exploring?</p>
            <p className="text-zinc-500 text-sm">Load sample surf shop data instantly — no CSV needed</p>
          </div>
          <button
            onClick={handleLoadDemo}
            disabled={demoLoading}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors text-zinc-800"
          style={{ backgroundColor: '#c5dbe0' }}
          >
            {demoLoading ? 'Loading...' : 'Load Demo Data'}
          </button>
        </div>
      </div>

      {/* Demo data preview — expandable */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-3">
          Demo data preview — 30 rows of surf shop sales across 3 months
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 uppercase tracking-wide">
                {['Date', 'Product', 'Brand', 'Category', 'Units', 'Revenue'].map((col) => (
                  <th key={col} className="pb-2 pr-4 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(previewExpanded ? DEMO_PREVIEW : DEMO_PREVIEW.slice(0, 5)).map((row, i) => (
                <tr key={i} className="border-b border-zinc-50">
                  <td className="py-2 pr-4 text-zinc-500">{row.date}</td>
                  <td className="py-2 pr-4 font-medium text-zinc-700">{row.product}</td>
                  <td className="py-2 pr-4 text-zinc-500">{row.brand}</td>
                  <td className="py-2 pr-4 text-zinc-500">{row.category}</td>
                  <td className="py-2 pr-4 text-zinc-500">{row.units}</td>
                  <td className="py-2 text-zinc-500">${row.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => setPreviewExpanded((v) => !v)}
          className="mt-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {previewExpanded ? '▲ Show less' : '▼ + 25 more rows'}
        </button>
      </div>

      {status === 'success' && rows.length > 0 && (
        <div className="mt-8">
          <p className="text-sm text-zinc-500 mb-3">
            Parsed <span className="font-semibold text-zinc-800">{rows.length} rows</span> successfully
          </p>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-400 uppercase tracking-wide">
                  {['Date', 'Product', 'Brand', 'Category', 'Units', 'Revenue'].map((col) => (
                    <th key={col} className="px-4 py-3 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50">
                    <td className="px-4 py-2.5 text-zinc-600">{row.date}</td>
                    <td className="px-4 py-2.5 font-medium">{row.product}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{row.brand}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{row.category}</td>
                    <td className="px-4 py-2.5 text-zinc-600">{row.units}</td>
                    <td className="px-4 py-2.5 text-zinc-600">${row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length > 10 && (
              <p className="px-4 py-3 text-xs text-zinc-400">
                Showing 10 of {rows.length} rows
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
