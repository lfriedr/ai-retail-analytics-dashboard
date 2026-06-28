// Pure calculation functions used by the dashboard.
// Keeping them separate from the React component makes them easy to unit test.

export interface SaleRow {
  date: string
  product: string
  brand: string
  category: string
  units: number
  revenue: number
}

export function getTotalRevenue(rows: SaleRow[]): number {
  return rows.reduce((sum, r) => sum + r.revenue, 0)
}

export function getTotalUnits(rows: SaleRow[]): number {
  return rows.reduce((sum, r) => sum + r.units, 0)
}

export function getTopBrand(rows: SaleRow[]): string {
  const brandRevenue: Record<string, number> = {}
  for (const row of rows) {
    brandRevenue[row.brand] = (brandRevenue[row.brand] ?? 0) + row.revenue
  }
  return Object.entries(brandRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

export function getMonthlyGrowth(rows: SaleRow[]): string {
  const monthlyRevenue: Record<string, number> = {}
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + row.revenue
  }
  const sortedMonths = Object.keys(monthlyRevenue).sort()
  if (sortedMonths.length < 2) return '—'

  const last = monthlyRevenue[sortedMonths[sortedMonths.length - 1]]
  const prev = monthlyRevenue[sortedMonths[sortedMonths.length - 2]]
  const pct = ((last - prev) / prev) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

export function getRevenueByMonth(rows: SaleRow[]) {
  const monthlyRevenue: Record<string, number> = {}
  for (const row of rows) {
    const month = row.date.slice(0, 7)
    monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + row.revenue
  }
  return Object.keys(monthlyRevenue)
    .sort()
    .map((month) => ({
      name: new Date(month + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: monthlyRevenue[month],
    }))
}

export function getTopProducts(rows: SaleRow[], limit = 5) {
  const productRevenue: Record<string, number> = {}
  for (const row of rows) {
    // Collapse all surfboard variants into one entry
    const key = row.product.startsWith('Surfboard') ? 'Surfboards' : row.product
    productRevenue[key] = (productRevenue[key] ?? 0) + row.revenue
  }
  return Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }))
}

export function getRevenueByBrand(rows: SaleRow[]) {
  const brandRevenue: Record<string, number> = {}
  for (const row of rows) {
    brandRevenue[row.brand] = (brandRevenue[row.brand] ?? 0) + row.revenue
  }
  return Object.entries(brandRevenue)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}
