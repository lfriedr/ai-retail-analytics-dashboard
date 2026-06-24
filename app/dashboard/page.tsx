// Dashboard page — lives at /dashboard
// Server Component by default — renders on the server, sends plain HTML to the browser.

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-zinc-500 mb-8">Your store's sales overview</p>

      {/* Stat cards row — placeholder values until we wire up real data */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Total Revenue" value="$0" />
        <StatCard label="Units Sold" value="0" />
        <StatCard label="Top Brand" value="—" />
        <StatCard label="Monthly Growth" value="—" />
      </div>

      {/* Charts section — we'll add Recharts here next */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <p className="text-zinc-400 text-sm text-center py-16">
          Upload sales data to see charts
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
