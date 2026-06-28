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

// Reusable bar chart wrapper so we don't repeat the same Recharts boilerplate three times.
// When there are more than 3 bars, labels are angled 45° so long names don't overlap.
function SimpleBarChart({ data }: { data: ChartData[] }) {
  const angled = data.length > 3
  const bottomMargin = angled ? 60 : 4

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: bottomMargin }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* Angle labels when there are many bars so long names don't overlap */}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
          angle={angled ? -40 : 0}
          textAnchor={angled ? 'end' : 'middle'}
          interval={0}
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
