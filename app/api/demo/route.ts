// API route — POST /api/demo
// Clears this session's sales data and inserts hardcoded sample surf shop data.
import { supabase } from '../../lib/supabase'

const DEMO_DATA = [
  // January
  { date: '2026-01-05', product: "4/3 Wetsuit", brand: "O'Neill", category: 'Wetsuits', units: 3, revenue: 510 },
  { date: '2026-01-08', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 6, revenue: 330 },
  { date: '2026-01-10', product: "Surfboard 6'2", brand: 'Channel Islands', category: 'Surfboards', units: 1, revenue: 650 },
  { date: '2026-01-12', product: 'Rash Guard LS', brand: 'Rip Curl', category: 'Apparel', units: 4, revenue: 180 },
  { date: '2026-01-15', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 5, revenue: 125 },
  { date: '2026-01-18', product: 'Fins Thruster', brand: 'FCS', category: 'Accessories', units: 3, revenue: 135 },
  { date: '2026-01-20', product: 'Beanie', brand: 'Billabong', category: 'Apparel', units: 7, revenue: 140 },
  { date: '2026-01-22', product: "4/3 Wetsuit", brand: 'Rip Curl', category: 'Wetsuits', units: 2, revenue: 350 },
  { date: '2026-01-25', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 12, revenue: 60 },
  { date: '2026-01-28', product: 'Boardshorts 18in', brand: 'Quiksilver', category: 'Boardshorts', units: 4, revenue: 180 },
  // February
  { date: '2026-02-02', product: "Surfboard 7'0", brand: 'Firewire', category: 'Surfboards', units: 1, revenue: 720 },
  { date: '2026-02-05', product: "4/3 Wetsuit", brand: "O'Neill", category: 'Wetsuits', units: 4, revenue: 680 },
  { date: '2026-02-08', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 8, revenue: 440 },
  { date: '2026-02-10', product: 'Wetsuit Boots', brand: 'Rip Curl', category: 'Wetsuits', units: 3, revenue: 195 },
  { date: '2026-02-12', product: 'Rash Guard SS', brand: "O'Neill", category: 'Apparel', units: 5, revenue: 175 },
  { date: '2026-02-14', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 6, revenue: 150 },
  { date: '2026-02-18', product: "Surfboard 6'8", brand: 'Channel Islands', category: 'Surfboards', units: 1, revenue: 750 },
  { date: '2026-02-20', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 15, revenue: 75 },
  { date: '2026-02-22', product: 'Boardshorts 18in', brand: 'Quiksilver', category: 'Boardshorts', units: 5, revenue: 225 },
  { date: '2026-02-25', product: 'Fins Thruster', brand: 'FCS', category: 'Accessories', units: 4, revenue: 180 },
  // March
  { date: '2026-03-01', product: "Surfboard 6'4", brand: 'Channel Islands', category: 'Surfboards', units: 2, revenue: 1400 },
  { date: '2026-03-04', product: "4/3 Wetsuit", brand: 'Rip Curl', category: 'Wetsuits', units: 5, revenue: 875 },
  { date: '2026-03-07', product: 'Boardshorts 20in', brand: 'Billabong', category: 'Boardshorts', units: 10, revenue: 550 },
  { date: '2026-03-10', product: 'Rash Guard LS', brand: 'Rip Curl', category: 'Apparel', units: 6, revenue: 270 },
  { date: '2026-03-12', product: 'Surf Wax 3pk', brand: 'Sticky Bumps', category: 'Accessories', units: 18, revenue: 90 },
  { date: '2026-03-15', product: 'Leash 9ft', brand: 'FCS', category: 'Accessories', units: 7, revenue: 175 },
  { date: '2026-03-18', product: "Surfboard 7'2", brand: 'Firewire', category: 'Surfboards', units: 1, revenue: 850 },
  { date: '2026-03-20', product: 'Beanie', brand: 'Quiksilver', category: 'Apparel', units: 5, revenue: 100 },
  { date: '2026-03-22', product: 'Wetsuit Boots', brand: "O'Neill", category: 'Wetsuits', units: 4, revenue: 260 },
  { date: '2026-03-28', product: 'Boardshorts 18in', brand: 'Billabong', category: 'Boardshorts', units: 9, revenue: 405 },
]

export async function POST(request: Request) {
  const { session_id } = await request.json()

  if (!session_id) {
    return Response.json({ error: 'No session_id provided' }, { status: 400 })
  }

  // Only clear this session's data
  const { error: deleteError } = await supabase
    .from('sales')
    .delete()
    .eq('session_id', session_id)

  if (deleteError) {
    return Response.json(
      { error: 'Failed to clear existing data', details: deleteError.message },
      { status: 500 }
    )
  }

  // Tag each row with this session's ID
  const rows = DEMO_DATA.map((row) => ({ ...row, session_id }))

  const { error } = await supabase.from('sales').insert(rows)

  if (error) {
    return Response.json(
      { error: 'Failed to insert demo data', details: error.message },
      { status: 500 }
    )
  }

  return Response.json({ success: true, count: rows.length })
}
