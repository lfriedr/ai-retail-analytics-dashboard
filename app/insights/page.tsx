// Insights page — lives at /insights
export default function InsightsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">AI Insights</h2>
      <p className="text-zinc-500 mb-8">
        Claude analyzes your sales data and answers your questions
      </p>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
        <h3 className="font-semibold mb-3">Generated Insights</h3>
        <p className="text-zinc-400 text-sm">
          Click "Generate Insights" after uploading data
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="font-semibold mb-3">Ask a Question</h3>
        <p className="text-zinc-400 text-sm">
          e.g. "Which brands underperformed this month?"
        </p>
      </div>
    </div>
  )
}
