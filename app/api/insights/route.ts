// API route — POST /api/insights
// Fetches all sales data from Supabase, sends it to Claude,
// and streams back structured business insights.
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../../lib/supabase'

// Initialize the Anthropic client — reads ANTHROPIC_API_KEY from .env.local
const anthropic = new Anthropic()

export async function POST() {
  // Fetch all sales rows from Supabase
  const { data, error } = await supabase.from('sales').select('*')

  if (error || !data || data.length === 0) {
    return Response.json({ error: 'No sales data found. Upload a CSV first.' }, { status: 400 })
  }

  // Format the data as a compact CSV string to send to Claude.
  // We don't send the full JSON — CSV is more token-efficient.
  const csvRows = [
    'date,product,brand,category,units,revenue',
    ...data.map((r) =>
      `${r.date},${r.product},${r.brand},${r.category},${r.units},${r.revenue}`
    ),
  ].join('\n')

  // Use the Vercel streaming response pattern.
  // ReadableStream lets us push Claude's output to the browser token by token
  // instead of waiting for the full response.
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Stream the Claude response
      // claude-opus-4-8 is the default — most capable model
      // thinking: adaptive lets Claude decide when to reason deeply
      const claudeStream = anthropic.messages.stream({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system: `You are a retail business analyst. Analyze sales data and return exactly 4 insights.
Format your response as exactly 4 items, each on its own line, starting with a relevant emoji.
Be specific — use actual numbers and brand names from the data.
Example format:
🏆 Channel Islands leads revenue at $2,050 (37% of total).
📉 FCS accessories show declining units — 2 sold in Feb vs 4 in Jan.
📈 Wetsuit sales grew 54% from January to February.
🔁 Boardshorts are the highest-volume category at 15 units sold.`,
        messages: [
          {
            role: 'user',
            content: `Here is the sales data:\n\n${csvRows}\n\nGenerate 4 business insights.`,
          },
        ],
      })

      // As each text chunk arrives from Claude, push it to the browser
      for await (const event of claudeStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }

      controller.close()
    },
  })

  // Return the stream as a plain text response
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
