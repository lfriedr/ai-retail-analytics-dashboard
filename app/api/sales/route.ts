// GET /api/sales?session_id=xxx
// Returns all sales rows for a specific session
import { supabase } from '../../lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return Response.json({ error: 'No session_id provided' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('session_id', sessionId)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ rows: data })
}
