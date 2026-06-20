"use client"
export default function AdminModerationPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
        <p className="text-[#6B7A90] text-sm mt-1">Review reported users, messages, and projects.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Reported Users', value: 0, color: 'text-red-400' },
          { label: 'Reported Projects', value: 0, color: 'text-amber-400' },
          { label: 'Reported Messages', value: 0, color: 'text-orange-400' },
        ].map((m, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
            <p className="text-[#6B7A90] text-xs font-medium mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-8 text-center">
        <p className="text-[#3D4A5C] text-sm">No items pending moderation. The platform is clean! ✅</p>
      </div>
    </div>
  )
}
