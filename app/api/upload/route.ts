// API route — POST /api/upload
// Receives a CSV file, parses it, saves to Supabase under the user's session ID.
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
  const sessionId = formData.get('session_id') as string | null

  if (!file) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 })
  }

  if (!file.name.endsWith('.csv')) {
    return Response.json({ error: 'File must be a .csv' }, { status: 400 })
  }

  if (!sessionId) {
    return Response.json({ error: 'No session_id provided' }, { status: 400 })
  }

  const text = await file.text()

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

  // Normalize column names: lowercase + trim
  const rows = result.data.map((raw) => {
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
      session_id: sessionId,
    }
  })

  // Only delete this session's existing rows before inserting new ones
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('session_id', sessionId)

  if (deleteError) {
    console.error('Supabase delete error:', JSON.stringify(deleteError, null, 2))
    return Response.json(
      { error: 'Failed to clear existing data', details: deleteError.message },
      { status: 500 }
    )
  }

  const { error } = await supabase.from('sales').insert(rows)

  if (error) {
    console.error('Supabase insert error:', JSON.stringify(error, null, 2))
    return Response.json(
      { error: 'Failed to save to database', details: error.message },
      { status: 500 }
    )
  }

  // Return rows without the session_id field for the preview table
  const clientRows: SaleRow[] = rows.map(({ session_id: _, ...rest }) => rest)
  return Response.json({ rows: clientRows, count: clientRows.length })
}
