// Charts must be a Client Component because Recharts uses browser APIs to render SVG.
// We keep all chart code here and import it into the dashboard page.
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// The shape of data each chart expects — simple key/value pairs
interface ChartData {
  name: string
  value: number
}

// Calculate how many characters fit per label based on number of bars.
// Fewer bars = more space = longer labels allowed.
function maxCharsForCount(count: number) {
  if (count <= 3) return 20   // plenty of room, effectively no truncation
  if (count <= 5) return 14   // enough to distinguish similar names like "Boardshorts 20in" vs "Boardshorts 18in"
  return 8                    // tight — needed when 6+ brands are shown
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

// Reusable bar chart wrapper so we don't repeat the same Recharts boilerplate three times
function SimpleBarChart({ data }: { data: ChartData[] }) {
  const max = maxCharsForCount(data.length)
  // Build a version of data with truncated names just for display on the axis.
  // The full name is still in the tooltip via the original data.
  const displayData = data.map((d) => ({ ...d, label: truncate(d.name, max) }))

  return (
    // ResponsiveContainer makes the chart fill its parent div's width
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={displayData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        {/* Light grey grid lines in the background */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X axis — uses the truncated label field */}
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y axis — the numbers on the left. tickFormatter adds a $ sign */}
        <YAxis
          tick={{ fontSize: 12, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
        />

        {/* Tooltip — uses the original full name, not the truncated label */}
        <Tooltip
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: 12 }}
          labelStyle={{ color: '#3f3f46', fontWeight: 600 }}
          itemStyle={{ color: '#94a3a7' }}
        />

        {/* The actual bars */}
        <Bar dataKey="value" fill="#c5dbe0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// The three chart sections rendered on the dashboard
export default function Charts({
  byMonth,
  byProduct,
  byBrand,
}: {
  byMonth: ChartData[]
  byProduct: ChartData[]
  byBrand: ChartData[]
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Revenue by month — full width on large screens */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 lg:col-span-2">
        <h3 className="font-semibold mb-4 text-zinc-600">Revenue by Month</h3>
        <SimpleBarChart data={byMonth} />
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-4 text-zinc-600">Top Products</h3>
        <SimpleBarChart data={byProduct} />
      </div>

      {/* Brand comparison */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-4 text-zinc-600">Revenue by Brand</h3>
        <SimpleBarChart data={byBrand} />
      </div>
    </div>
  )
}
