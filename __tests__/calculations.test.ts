import {
  getTotalRevenue,
  getTotalUnits,
  getTopBrand,
  getMonthlyGrowth,
  getRevenueByMonth,
  getTopProducts,
  getRevenueByBrand,
  type SaleRow,
} from '../app/lib/calculations'

// Sample rows used across multiple tests
const SAMPLE_ROWS: SaleRow[] = [
  { date: '2026-01-05', product: '4/3 Wetsuit', brand: "O'Neill", category: 'Wetsuits', units: 3, revenue: 510 },
  { date: '2026-01-10', product: "Surfboard 6'2", brand: 'Channel Islands', category: 'Surfboards', units: 1, revenue: 650 },
  { date: '2026-02-02', product: "Surfboard 7'0", brand: 'Firewire', category: 'Surfboards', units: 1, revenue: 720 },
  { date: '2026-02-05', product: '4/3 Wetsuit', brand: "O'Neill", category: 'Wetsuits', units: 4, revenue: 680 },
  { date: '2026-03-01', product: "Surfboard 6'4", brand: 'Channel Islands', category: 'Surfboards', units: 2, revenue: 1400 },
  { date: '2026-03-07', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 10, revenue: 550 },
]

// ── getTotalRevenue ──────────────────────────────────────────────────────

describe('getTotalRevenue', () => {
  it('sums all revenue correctly', () => {
    expect(getTotalRevenue(SAMPLE_ROWS)).toBe(4510)
  })

  it('returns 0 for empty data', () => {
    expect(getTotalRevenue([])).toBe(0)
  })

  it('works with a single row', () => {
    expect(getTotalRevenue([SAMPLE_ROWS[0]])).toBe(510)
  })
})

// ── getTotalUnits ────────────────────────────────────────────────────────

describe('getTotalUnits', () => {
  it('sums all units correctly', () => {
    expect(getTotalUnits(SAMPLE_ROWS)).toBe(21)
  })

  it('returns 0 for empty data', () => {
    expect(getTotalUnits([])).toBe(0)
  })
})

// ── getTopBrand ──────────────────────────────────────────────────────────

describe('getTopBrand', () => {
  it('returns the brand with the highest total revenue', () => {
    // O'Neill: 510+680=1190, Channel Islands: 650+1400=2050, Firewire: 720, Billabong: 550
    expect(getTopBrand(SAMPLE_ROWS)).toBe('Channel Islands')
  })

  it('returns — for empty data', () => {
    expect(getTopBrand([])).toBe('—')
  })

  it('handles a single brand', () => {
    const rows = SAMPLE_ROWS.filter((r) => r.brand === "O'Neill")
    expect(getTopBrand(rows)).toBe("O'Neill")
  })
})

// ── getMonthlyGrowth ─────────────────────────────────────────────────────

describe('getMonthlyGrowth', () => {
  it('calculates percentage growth between the last two months', () => {
    // Jan: 510+650=1160, Feb: 720+680=1400, Mar: 1400+550=1950
    // Growth = (1950 - 1400) / 1400 * 100 = +39.3%
    expect(getMonthlyGrowth(SAMPLE_ROWS)).toBe('+39.3%')
  })

  it('returns — when there is only one month of data', () => {
    const oneMonth = SAMPLE_ROWS.filter((r) => r.date.startsWith('2026-01'))
    expect(getMonthlyGrowth(oneMonth)).toBe('—')
  })

  it('returns — for empty data', () => {
    expect(getMonthlyGrowth([])).toBe('—')
  })

  it('shows negative growth when revenue declines', () => {
    const declining: SaleRow[] = [
      { date: '2026-01-01', product: 'A', brand: 'X', category: 'Y', units: 1, revenue: 1000 },
      { date: '2026-02-01', product: 'A', brand: 'X', category: 'Y', units: 1, revenue: 500 },
    ]
    expect(getMonthlyGrowth(declining)).toBe('-50.0%')
  })
})

// ── getRevenueByMonth ────────────────────────────────────────────────────

describe('getRevenueByMonth', () => {
  it('groups revenue by month in chronological order', () => {
    const result = getRevenueByMonth(SAMPLE_ROWS)
    expect(result).toHaveLength(3)
    expect(result[0].value).toBe(1160) // Jan
    expect(result[1].value).toBe(1400) // Feb
    expect(result[2].value).toBe(1950) // Mar
  })

  it('returns empty array for no data', () => {
    expect(getRevenueByMonth([])).toHaveLength(0)
  })
})

// ── getTopProducts ───────────────────────────────────────────────────────

describe('getTopProducts', () => {
  it('collapses all surfboard variants into one Surfboards entry', () => {
    const result = getTopProducts(SAMPLE_ROWS)
    const surfboards = result.find((r) => r.name === 'Surfboards')
    // 650 + 720 + 1400 = 2770
    expect(surfboards?.value).toBe(2770)
    // No individual surfboard product names should appear
    expect(result.find((r) => r.name.startsWith('Surfboard '))).toBeUndefined()
  })

  it('returns results sorted by revenue descending', () => {
    const result = getTopProducts(SAMPLE_ROWS)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].value).toBeGreaterThanOrEqual(result[i + 1].value)
    }
  })

  it('respects the limit parameter', () => {
    const result = getTopProducts(SAMPLE_ROWS, 2)
    expect(result).toHaveLength(2)
  })

  it('returns empty array for no data', () => {
    expect(getTopProducts([])).toHaveLength(0)
  })
})

// ── getRevenueByBrand ────────────────────────────────────────────────────

describe('getRevenueByBrand', () => {
  it('groups and sorts brands by revenue descending', () => {
    const result = getRevenueByBrand(SAMPLE_ROWS)
    // Channel Islands (2050) should be first
    expect(result[0].name).toBe('Channel Islands')
    expect(result[0].value).toBe(2050)
  })

  it('combines multiple rows from the same brand', () => {
    const result = getRevenueByBrand(SAMPLE_ROWS)
    const oneill = result.find((r) => r.name === "O'Neill")
    expect(oneill?.value).toBe(1190) // 510 + 680
  })

  it('returns empty array for no data', () => {
    expect(getRevenueByBrand([])).toHaveLength(0)
  })
})
