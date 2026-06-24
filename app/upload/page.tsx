// Upload page — lives at /upload
// Needs 'use client' because we use useState and handle form events.
'use client'

import { useState, useRef } from 'react'
import type { SaleRow } from '../api/upload/route'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [rows, setRows] = useState<SaleRow[]>([])
  const [errorMessage, setErrorMessage] = useState('')

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Upload Sales Data</h2>
      <p className="text-zinc-500 mb-8">
        Upload a CSV with columns: Date, Product, Brand, Category, Units, Revenue
      </p>

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
        className="bg-zinc-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors"
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload & Parse'}
      </button>

      {status === 'error' && (
        <p className="mt-4 text-red-500 text-sm">{errorMessage}</p>
      )}

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
