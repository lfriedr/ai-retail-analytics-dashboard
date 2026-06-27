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

// Reusable bar chart wrapper so we don't repeat the same Recharts boilerplate three times
function SimpleBarChart({ data }: { data: ChartData[] }) {
  return (
    // ResponsiveContainer makes the chart fill its parent div's width
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        {/* Light grey grid lines in the background */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* X axis — the category labels along the bottom */}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y axis — the numbers on the left. tickFormatter adds a $ sign */}
        <YAxis
          tick={{ fontSize: 12, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
        />

        {/* Tooltip that appears on hover */}
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: 12 }}
        />

        {/* The actual bars */}
        <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
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
        <h3 className="font-semibold mb-4">Revenue by Month</h3>
        <SimpleBarChart data={byMonth} />
      </div>

      {/* Top products */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-4">Top Products</h3>
        <SimpleBarChart data={byProduct} />
      </div>

      {/* Brand comparison */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-4">Revenue by Brand</h3>
        <SimpleBarChart data={byBrand} />
      </div>
    </div>
  )
}
