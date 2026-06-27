// Dashboard page — lives at /dashboard
// This is a Server Component — it fetches data directly from Supabase on the server
// before sending any HTML to the browser. No loading spinners needed.

import { supabase } from '../lib/supabase'
import Charts from '../components/Charts'

// The shape of a row coming back from Supabase
interface SaleRow {
  date: string
  product: string
  brand: string
  category: string
  units: number
  revenue: number
}

export default async function DashboardPage() {
  // Fetch all sales rows from Supabase
  // .from('sales') — which table
  // .select('*') — all columns
  const { data, error } = await supabase.from('sales').select('*')
  console.log('Supabase result:', { data, error })

  // If fetch fails or no data yet, show empty state
  if (error || !data || data.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-zinc-500 mb-8">Your store's sales overview</p>
        <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center">
          <p className="text-zinc-400">No data yet — upload a CSV to get started</p>
        </div>
      </div>
    )
  }

  const rows = data as SaleRow[]

  // ── Stat card calculations ──────────────────────────────────────────────

  // Total revenue: add up every row's revenue
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0)

  // Total units: add up every row's units
  const totalUnits = rows.reduce((sum, r) => sum + r.units, 0)

  // Top brand: group by brand, sum revenue, find the highest
  const brandRevenue: Record<string, number> = {}
  for (const row of rows) {
    brandRevenue[row.brand] = (brandRevenue[row.brand] ?? 0) + row.revenue
  }
  const topBrand = Object.entries(brandRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  // Monthly growth: compare the two most recent months
  // First, group revenue by "YYYY-MM"
  const monthlyRevenue: Record<string, number> = {}
  for (const row of rows) {
    // row.date is "2026-01-15" — slice(0, 7) gives "2026-01"
    const month = row.date.slice(0, 7)
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + row.revenue
  }
  const sortedMonths = Object.keys(monthlyRevenue).sort()
  let growthText = '—'
  if (sortedMonths.length >= 2) {
    const last = monthlyRevenue[sortedMonths[sortedMonths.length - 1]]
    const prev = monthlyRevenue[sortedMonths[sortedMonths.length - 2]]
    const pct = ((last - prev) / prev) * 100
    growthText = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
  }

  // ── Chart data ──────────────────────────────────────────────────────────

  // Revenue by month — sorted chronologically
  const byMonth = sortedMonths.map((month) => ({
    // Format "2026-01" → "Jan 26" for the chart label
    name: new Date(month + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    value: monthlyRevenue[month],
  }))

  // Top 5 products by revenue
  const productRevenue: Record<string, number> = {}
  for (const row of rows) {
    productRevenue[row.product] = (productRevenue[row.product] ?? 0) + row.revenue
  }
  const byProduct = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))

  // All brands by revenue
  const byBrand = Object.entries(brandRevenue)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-zinc-500 mb-8">Your store's sales overview</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard label="Units Sold" value={totalUnits.toLocaleString()} />
        <StatCard label="Top Brand" value={topBrand} />
        <StatCard label="Monthly Growth" value={growthText} />
      </div>

      {/* Charts — client component receives pre-computed data from the server */}
      <Charts byMonth={byMonth} byProduct={byProduct} byBrand={byBrand} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
