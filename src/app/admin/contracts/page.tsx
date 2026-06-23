"use client"
export default function AdminContractsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Contract Management</h1>
      <p className="text-[#6B7A90] text-sm">View and manage all platform contracts. <span className="text-cyan-400">(Full data loads from your contracts table)</span></p>
      <div className="mt-8 bg-[#0D1117] border border-[#1B2232] rounded-xl p-12 text-center">
        <p className="text-[#3D4A5C] text-sm">Contracts will appear here once freelancers and clients create active contracts.</p>
      </div>
    </div>
  )
}
