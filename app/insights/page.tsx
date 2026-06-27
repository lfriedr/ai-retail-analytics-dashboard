// Insights page — lives at /insights
// 'use client' is needed because we use useState and handle button clicks/form input
'use client'

import { useState } from 'react'

export default function InsightsPage() {
  // The streamed text from Claude's insight generation
  const [insights, setInsights] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(false)

  // The user's typed question and Claude's streamed answer
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [answerLoading, setAnswerLoading] = useState(false)

  // Called when the user clicks "Generate Insights"
  async function handleGenerateInsights() {
    setInsightsLoading(true)
    setInsights('')

    try {
      // POST to our Claude insights API route
      const res = await fetch('/api/insights', { method: 'POST' })

      if (!res.ok) {
        const data = await res.json()
        setInsights(`Error: ${data.error}`)
        return
      }

      // res.body is a ReadableStream — we read it chunk by chunk as Claude streams
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // Append each new chunk to the insights string, triggering a re-render
        setInsights((prev) => prev + decoder.decode(value))
      }
    } catch {
      setInsights('Network error — is the server running?')
    } finally {
      setInsightsLoading(false)
    }
  }

  // Called when the user submits a question
  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setAnswerLoading(true)
    setAnswer('')

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        const data = await res.json()
        setAnswer(`Error: ${data.error}`)
        return
      }

      // Same streaming read pattern as above
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setAnswer((prev) => prev + decoder.decode(value))
      }
    } catch {
      setAnswer('Network error — is the server running?')
    } finally {
      setAnswerLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">AI Insights</h2>
      <p className="text-zinc-500 mb-8">
        Claude analyzes your sales data and answers your questions
      </p>

      {/* ── Generate Insights ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-700">Generated Insights</h3>
          <button
            onClick={handleGenerateInsights}
            disabled={insightsLoading}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            {insightsLoading ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>

        {/* Insights output — shows streaming text as it arrives */}
        {insights ? (
          <div className="space-y-2">
            {/* Split by newline so each insight renders as its own line */}
            {insights.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-zinc-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            {insightsLoading ? 'Claude is analyzing your data...' : 'Click "Generate Insights" to get started'}
          </p>
        )}
      </div>

      {/* ── Ask a Question ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-4 text-zinc-700">Ask a Question</h3>

        {/* Question input form */}
        <form onSubmit={handleAskQuestion} className="flex gap-2 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder='e.g. "Which brands underperformed this month?"'
            className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={answerLoading || !question.trim()}
            className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            {answerLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {/* Answer output — streams in as Claude responds */}
        {answer ? (
          <p className="text-sm text-zinc-700 leading-relaxed">{answer}</p>
        ) : (
          <p className="text-zinc-500 text-sm">
            {answerLoading ? 'Claude is thinking...' : 'Ask anything about your sales data'}
          </p>
        )}
      </div>
    </div>
  )
}
