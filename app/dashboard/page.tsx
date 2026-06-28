'use client'

// Prevent Vercel from caching this page — data changes on every upload
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getSessionId } from '../lib/session'
import Charts from '../components/Charts'
import {
  getTotalRevenue,
  getTotalUnits,
  getTopBrand,
  getMonthlyGrowth,
  getRevenueByMonth,
  getTopProducts,
  getRevenueByBrand,
  type SaleRow,
} from '../lib/calculations'

export default function DashboardPage() {
  const [rows, setRows] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = getSessionId()

    fetch(`/api/sales?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-zinc-400 mb-8">Your store's sales overview</p>
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-zinc-400 mb-8">Your store's sales overview</p>
        <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
          <p className="text-zinc-400">No data yet — upload a CSV to get started</p>
        </div>
      </div>
    )
  }

  const totalRevenue = getTotalRevenue(rows)
  const totalUnits = getTotalUnits(rows)
  const topBrand = getTopBrand(rows)
  const growthText = getMonthlyGrowth(rows)
  const byMonth = getRevenueByMonth(rows)
  const byProduct = getTopProducts(rows)
  const byBrand = getRevenueByBrand(rows)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-zinc-400 mb-8">Your store's sales overview</p>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} outlined />
        <StatCard label="Units Sold" value={totalUnits.toLocaleString()} outlined />
        <StatCard label="Top Brand" value={topBrand} outlined />
        <StatCard label="Monthly Growth" value={growthText} outlined />
      </div>

      <Charts byMonth={byMonth} byProduct={byProduct} byBrand={byBrand} />
    </div>
  )
}

function StatCard({ label, value, outlined }: { label: string; value: string; outlined?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${outlined ? 'bg-transparent border-zinc-500' : 'bg-white border-zinc-200'}`}>
      <p className={`text-xs uppercase tracking-wide mb-1 font-medium ${outlined ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
      <p className={`text-2xl font-semibold ${outlined ? 'text-zinc-200' : 'text-zinc-700'}`}>{value}</p>
    </div>
  )
}
