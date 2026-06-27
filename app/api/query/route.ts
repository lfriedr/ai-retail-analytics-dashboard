// API route — POST /api/query
// Accepts a natural language question about the store's sales data,
// fetches the data from Supabase, and streams Claude's answer back.
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '../../lib/supabase'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const { question } = await request.json()

  if (!question?.trim()) {
    return Response.json({ error: 'No question provided' }, { status: 400 })
  }

  const { data, error } = await supabase.from('sales').select('*')

  if (error || !data || data.length === 0) {
    return Response.json({ error: 'No sales data found. Upload a CSV first.' }, { status: 400 })
  }

  const csvRows = [
    'date,product,brand,category,units,revenue',
    ...data.map((r) =>
      `${r.date},${r.product},${r.brand},${r.category},${r.units},${r.revenue}`
    ),
  ].join('\n')

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const claudeStream = anthropic.messages.stream({
        model: 'claude-opus-4-8',
        max_tokens: 512,
        thinking: { type: 'adaptive' },
        system: `You are a retail sales analyst. Answer questions about store sales data concisely.
Use specific numbers and product names from the data. Keep answers to 2-4 sentences.`,
        messages: [
          {
            role: 'user',
            content: `Sales data:\n\n${csvRows}\n\nQuestion: ${question}`,
          },
        ],
      })

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

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
