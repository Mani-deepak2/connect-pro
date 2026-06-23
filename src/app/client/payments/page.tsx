"use client"
import { useState, useEffect } from 'react'
import { DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Search, Filter, Download, FileText, CheckCircle, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/utils/supabase/client'

const monthlySpendingData = [
  { name: 'Jan', amount: 4000 },
  { name: 'Feb', amount: 3000 },
  { name: 'Mar', amount: 2000 },
  { name: 'Apr', amount: 2780 },
  { name: 'May', amount: 1890 },
  { name: 'Jun', amount: 2390 },
  { name: 'Jul', amount: 3490 },
]

export default function Payments() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('payments')
      .select('*, freelancer:users!payments_freelancer_id_fkey(full_name), contract:contracts(project:projects(title))')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setTransactions(data.map((p: any) => ({
        id: p.id.split('-')[0],
        date: new Date(p.created_at).toLocaleDateString(),
        freelancer: p.freelancer?.full_name || 'Unknown',
        project: p.contract?.project?.title || 'Unknown Project',
        amount: `$${p.amount.toFixed(2)}`,
        status: p.status,
        type: 'Payment'
      })))
    }
    setIsLoading(false)
  }

  const filteredTransactions = transactions.filter(t => {
    if (activeTab !== 'all' && t.status !== activeTab) return false
    if (searchTerm && !t.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) && !t.id.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Payments & Billing</h1>
          <p className="text-gray-500">Manage your transactions, invoices, and wallet balance.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 font-medium py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Statement
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20">
            Fund Wallet
          </button>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Wallet Balance', value: '$3,550.00', icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50', trend: null },
          { label: 'Total Spending', value: '$12,450.00', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12% this month', trendUp: true },
          { label: 'Pending Payments', value: '$2,500.00', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', trend: '2 invoices', trendUp: null },
          { label: 'Refunds', value: '$3,000.00', icon: ArrowDownRight, color: 'text-purple-600', bg: 'bg-purple-50', trend: '1 invoice', trendUp: null },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.trend && (
                <span className={`text-xs font-semibold ${stat.trendUp === true ? 'text-emerald-600' : stat.trendUp === false ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Monthly Spending Analysis</h3>
            <p className="text-sm text-gray-500">Track your expenses across all projects</p>
          </div>
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium cursor-pointer">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${value}`, 'Amount']}
              />
              <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-100 gap-4">
          <h2 className="text-lg font-bold text-gray-900 px-2">Transaction History</h2>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl overflow-x-auto hide-scrollbar w-full md:w-auto">
              {['all', 'completed', 'pending', 'refunded'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-white text-teal-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="px-6 py-4">Date / Invoice</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Date / ID */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{tx.date}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">{tx.id}</span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{tx.freelancer}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">{tx.project}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-teal-600 font-medium">{tx.type}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{tx.amount}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                        tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        tx.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {tx.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : 
                         tx.status === 'pending' ? <Clock className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> View
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100" title="Download Invoice">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <DollarSign className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">No transactions found</h3>
                    <p className="text-sm text-gray-500">There are no transactions matching your current filters.</p>
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
