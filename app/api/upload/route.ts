// API route — lives at POST /api/upload
// Runs on the server. Receives a CSV file, parses it, returns JSON.
import Papa from 'papaparse'

export interface SaleRow {
  date: string
  product: string
  brand: string
  category: string
  units: number
  revenue: number
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 })
  }

  if (!file.name.endsWith('.csv')) {
    return Response.json({ error: 'File must be a .csv' }, { status: 400 })
  }

  const text = await file.text()

  // header: true — first row becomes column names
  // skipEmptyLines: true — ignore blank rows
  // dynamicTyping: true — auto-converts "2" → 2
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  if (result.errors.length > 0) {
    return Response.json(
      { error: 'Could not parse CSV', details: result.errors },
      { status: 422 }
    )
  }

  // Normalize column names: lowercase + trim so "Date " and "date" both work
  const rows: SaleRow[] = result.data.map((raw) => {
    const row: Record<string, unknown> = {}
    for (const key of Object.keys(raw)) {
      row[key.toLowerCase().trim()] = raw[key]
    }
    return {
      date: String(row['date'] ?? ''),
      product: String(row['product'] ?? ''),
      brand: String(row['brand'] ?? ''),
      category: String(row['category'] ?? ''),
      units: Number(row['units'] ?? 0),
      revenue: Number(row['revenue'] ?? 0),
    }
  })

  return Response.json({ rows, count: rows.length })
}
