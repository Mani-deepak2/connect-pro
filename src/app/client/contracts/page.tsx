"use client"
import { useState, useEffect } from 'react'
import { FileSignature, Search, Filter, MoreVertical, Download, RefreshCcw, XCircle, Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function Contracts() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('contracts')
      .select(`
        *,
        project:project_id(title, budget_type),
        freelancer:freelancer_id(full_name, professional_title)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setContracts(data)
    }
    setIsLoading(false)
  }

  // Fallback to MOCK data ONLY if the database returns 0 contracts.
  const MOCK_CONTRACTS = [
    { id: 'CON-2026-891', freelancer: { full_name: 'Alex Rivera' }, project: { title: 'E-commerce Redesign', budget_type: 'hourly' }, created_at: '2026-06-01', updated_at: '2026-12-01', status: 'active', amount: 65 },
    { id: 'CON-2026-742', freelancer: { full_name: 'Emily Chen' }, project: { title: 'Mobile App Design', budget_type: 'fixed' }, created_at: '2026-05-15', updated_at: '2026-08-15', status: 'completed', amount: 5000 },
    { id: 'CON-2026-921', freelancer: { full_name: 'David Kim' }, project: { title: 'API Gateway Build', budget_type: 'hourly' }, created_at: '2026-06-20', updated_at: '2026-10-20', status: 'pending', amount: 75 },
    { id: 'CON-2026-618', freelancer: { full_name: 'Sarah Smith' }, project: { title: 'Fitness Tracking App', budget_type: 'fixed' }, created_at: '2026-03-01', updated_at: '2026-05-01', status: 'cancelled', amount: 12000 },
  ]

  const displayContracts = contracts.length > 0 ? contracts : MOCK_CONTRACTS

  const filteredContracts = displayContracts.filter(contract => {
    if (activeTab !== 'all' && contract.status !== activeTab) return false
    if (searchTerm && !contract.freelancer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) && !contract.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">Active</span>;
      case 'completed': return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">Completed</span>;
      case 'cancelled': return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">Cancelled</span>;
      default: return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-100">Pending Signature</span>;
    }
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Contracts</h1>
          <p className="text-gray-500">Manage all your active and historical freelancer agreements.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>
      </header>

      {/* Advanced Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-100 gap-4">
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl overflow-x-auto hide-scrollbar w-full md:w-auto">
            {['all', 'pending', 'active', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {tab}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                  {tab === 'all' ? displayContracts.length : displayContracts.filter((c:any) => c.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contract Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Contract / Freelancer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terms</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading contracts...</td>
                </tr>
              ) : filteredContracts.length > 0 ? (
                filteredContracts.map((contract: any) => (
                  <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Freelancer Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0`}>
                          {contract.freelancer?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 hover:text-teal-600 cursor-pointer">{contract.freelancer?.full_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-500 font-medium font-mono bg-gray-100 px-1.5 py-0.5 rounded">{contract.id.substring(0, 13)}</span>
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">{contract.project?.title}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(contract.status)}
                    </td>

                    {/* Terms */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">${contract.amount}{contract.project?.budget_type === 'hourly' ? '/hr' : ''}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 capitalize">
                          {contract.project?.budget_type === 'fixed' ? <DollarSign className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {contract.project?.budget_type}
                        </span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(contract.created_at).toISOString().split('T')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                          <span>{new Date(contract.updated_at).toISOString().split('T')[0]}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        {contract.status === 'active' && (
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Renew">
                            <RefreshCcw className="w-4 h-4" />
                          </button>
                        )}
                        {(contract.status === 'active' || contract.status === 'pending') && (
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Contract">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg">
                          View Details
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <FileSignature className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">No contracts found</h3>
                    <p className="text-sm text-gray-500">There are no contracts matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
