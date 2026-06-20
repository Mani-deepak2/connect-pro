"use client"
export default function AdminFinancesPage() {
  const stats = [
    { label: 'Total Deposits', value: '$28,450', color: 'text-emerald-400' },
    { label: 'Total Withdrawals', value: '$12,200', color: 'text-red-400' },
    { label: 'Pending Withdrawals', value: '$3,400', color: 'text-amber-400' },
    { label: 'Platform Earnings (10%)', value: '$2,845', color: 'text-cyan-400' },
    { label: 'Escrow Balance', value: '$8,600', color: 'text-blue-400' },
  ]
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finances & Payments</h1>
        <p className="text-[#6B7A90] text-sm mt-1">Platform financial overview and escrow management.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
            <p className="text-[#6B7A90] text-xs font-medium mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Pending Withdrawal Requests</h3>
        <p className="text-[#3D4A5C] text-sm">No pending withdrawal requests at this time.</p>
      </div>
    </div>
  )
}
