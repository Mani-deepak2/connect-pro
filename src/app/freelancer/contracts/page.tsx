"use client"
import { useState } from 'react'
import { FileText, Clock, DollarSign, Calendar, CheckCircle, ChevronRight, Play, Square, ExternalLink } from 'lucide-react'

const MOCK_CONTRACTS = [
  { id: 'CON-2026-891', client: 'Acme Corp', project: 'E-commerce Redesign', type: 'Hourly', rate: '$65/hr', status: 'active', startDate: '2026-06-01', loggedHours: 12.5, weeklyLimit: 40, earned: '$812.50' },
  { id: 'CON-2026-742', client: 'HealthFlow', project: 'Mobile App Design', type: 'Fixed Price', rate: '$5,000', status: 'active', startDate: '2026-05-15', nextMilestone: 'Milestone 2: High Fidelity Mocks', earned: '$1,500.00' },
  { id: 'CON-2026-921', client: 'TechStart Inc.', project: 'Backend API Development', type: 'Hourly', rate: '$50/hr', status: 'completed', startDate: '2026-01-10', endDate: '2026-04-20', earned: '$12,500.00' },
]

export default function Contracts() {
  const [activeTab, setActiveTab] = useState('active')

  const filteredContracts = MOCK_CONTRACTS.filter(c => {
    if (activeTab === 'active') return c.status === 'active'
    if (activeTab === 'completed') return c.status === 'completed'
    return true
  })

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Contracts</h1>
        <p className="text-gray-500">Manage your active engagements, milestones, and tracked hours.</p>
      </header>

      {/* Main Content */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm mb-8">
        
        {/* Tabs */}
        <div className="flex px-2 pt-2 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
          {[
            { id: 'active', label: 'Active Contracts', count: 2 },
            { id: 'completed', label: 'Completed', count: 1 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold transition-colors relative flex items-center ${
                activeTab === tab.id ? 'text-teal-700' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredContracts.length > 0 ? (
            filteredContracts.map(contract => (
              <div key={contract.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 hover:text-teal-600 cursor-pointer transition-colors mb-1">
                      {contract.project}
                    </h2>
                    <p className="text-sm font-medium text-gray-600">
                      {contract.client} <span className="mx-1 text-gray-300">•</span> 
                      <span className="font-mono text-xs">{contract.id}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-2xl font-bold text-gray-900">{contract.rate}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded mt-1">
                      {contract.type}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 flex flex-wrap gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</p>
                      <p className="font-medium text-gray-900">{contract.startDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Earned</p>
                      <p className="font-bold text-emerald-600">{contract.earned}</p>
                    </div>
                  </div>

                  {contract.type === 'Hourly' && contract.status === 'active' && (
                    <div className="flex items-center gap-3 ml-auto">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">This Week</p>
                        <p className="font-medium text-gray-900"><span className="font-bold">{contract.loggedHours}</span> / {contract.weeklyLimit} hrs</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20 transition-colors" title="Start Timer">
                          <Play className="w-4 h-4 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.type === 'Fixed Price' && contract.status === 'active' && (
                    <div className="flex items-center gap-3 ml-auto bg-white p-3 rounded-xl border border-gray-200">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Up Next</p>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{contract.nextMilestone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-sm flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" /> View Contract Details
                  </button>
                  {contract.status === 'active' && (
                    <button className="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors text-sm shadow-sm flex items-center">
                      Submit Work
                    </button>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No {activeTab} contracts</h3>
              <p className="text-sm text-gray-500">You don't have any {activeTab} contracts at the moment.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
