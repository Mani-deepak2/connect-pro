"use client"
export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Center</h1>
        <p className="text-[#6B7A90] text-sm mt-1">Deep platform analytics and growth metrics.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Monthly Active Users', value: '—', sub: 'Requires activity tracking' },
          { label: 'Conversion Rate', value: '—', sub: 'Applications → Hires' },
          { label: 'Retention Rate', value: '—', sub: 'Monthly returning users' },
        ].map((m, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
            <p className="text-[#6B7A90] text-xs font-medium mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
            <p className="text-[10px] text-[#3D4A5C]">{m.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-8 text-center">
        <p className="text-[#3D4A5C] text-sm">Advanced analytics charts will populate as user activity grows.</p>
      </div>
    </div>
  )
}
