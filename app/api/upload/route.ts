// API route — lives at POST /api/upload
// Runs on the server. Receives a CSV file, parses it, saves to Supabase, returns JSON.
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'

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

  // Clear existing data before inserting — so each upload replaces the previous one
  // .gt('id', '00000000-0000-0000-0000-000000000000') matches all rows (can't delete without a filter)
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .gt('id', '00000000-0000-0000-0000-000000000000')

  if (deleteError) {
    console.error('Supabase delete error:', JSON.stringify(deleteError, null, 2))
    return Response.json(
      { error: 'Failed to clear existing data', details: deleteError.message },
      { status: 500 }
    )
  }

  // Insert all parsed rows into the Supabase sales table in one batch
  const { error } = await supabase.from('sales').insert(rows)

  if (error) {
    // Log full error to terminal so we can see exactly what Supabase rejected
    console.error('Supabase insert error:', JSON.stringify(error, null, 2))
    return Response.json(
      { error: 'Failed to save to database', details: error.message, code: error.code },
      { status: 500 }
    )
  }

  return Response.json({ rows, count: rows.length })
}
