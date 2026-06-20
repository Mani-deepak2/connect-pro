"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Users, Briefcase, AlertCircle, TrendingUp, TrendingDown, Activity, DollarSign, 
  CreditCard, FileText, ArrowUpRight, Clock, CheckCircle2, XCircle
} from 'lucide-react'
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    freelancers: 0,
    clients: 0,
    activeProjects: 0,
    totalRevenue: 15420,
    openTickets: 0,
    creditsSold: 4850,
    creditsUsed: 3200
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Chart data
  const revenueData = [
    { name: 'Jan', revenue: 2400, profit: 1800 },
    { name: 'Feb', revenue: 1398, profit: 900 },
    { name: 'Mar', revenue: 4800, profit: 3200 },
    { name: 'Apr', revenue: 3908, profit: 2780 },
    { name: 'May', revenue: 4800, profit: 3100 },
    { name: 'Jun', revenue: 3800, profit: 2500 },
    { name: 'Jul', revenue: 4300, profit: 3490 },
  ]

  const userGrowthData = [
    { name: 'Mon', freelancers: 12, clients: 8 },
    { name: 'Tue', freelancers: 19, clients: 14 },
    { name: 'Wed', freelancers: 15, clients: 11 },
    { name: 'Thu', freelancers: 22, clients: 18 },
    { name: 'Fri', freelancers: 28, clients: 21 },
    { name: 'Sat', freelancers: 35, clients: 25 },
    { name: 'Sun', freelancers: 42, clients: 30 },
  ]

  const creditData = [
    { name: 'Sold', value: 4850, color: '#06B6D4' },
    { name: 'Used', value: 3200, color: '#3B82F6' },
    { name: 'Remaining', value: 1650, color: '#1B2232' },
  ]

  const recentOrders = [
    { id: '#CP00234', user: 'Ravi Kumar', type: 'Credit Purchase', status: 'Completed', amount: '$24.00', date: 'Jun 18, 2026' },
    { id: '#CP00233', user: 'Sarah Chen', type: 'Project Payment', status: 'Pending', amount: '$450.00', date: 'Jun 18, 2026' },
    { id: '#CP00232', user: 'Mike Ross', type: 'Withdrawal', status: 'Processing', amount: '$1,200.00', date: 'Jun 17, 2026' },
    { id: '#CP00231', user: 'Priya S.', type: 'Credit Purchase', status: 'Completed', amount: '$12.00', date: 'Jun 17, 2026' },
    { id: '#CP00230', user: 'John Doe', type: 'Refund', status: 'Failed', amount: '$85.00', date: 'Jun 16, 2026' },
  ]

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: freelancers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'freelancer')
    const { count: clients } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client')
    
    let activeProjects = 0
    try {
      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'open')
      activeProjects = count || 0
    } catch {}
    
    let openTickets = 0
    try {
      const { count } = await supabase.from('support_tickets').select('*', { count: 'exact', head: true }).neq('status', 'Closed')
      openTickets = count || 0
    } catch {}

    setStats(prev => ({
      ...prev,
      totalUsers: totalUsers || 0,
      freelancers: freelancers || 0,
      clients: clients || 0,
      activeProjects,
      openTickets
    }))
    setIsLoading(false)
  }

  const statusColor: Record<string, string> = {
    'Completed': 'text-emerald-400 bg-emerald-500/10',
    'Pending': 'text-amber-400 bg-amber-500/10',
    'Processing': 'text-cyan-400 bg-cyan-500/10',
    'Failed': 'text-red-400 bg-red-500/10',
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-[#6B7A90] text-sm mt-1">Platform metrics and analytics at a glance.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">7 Days</button>
          <button className="px-3 py-1.5 rounded-lg text-[#6B7A90] hover:bg-[#131720] transition-colors">30 Days</button>
          <button className="px-3 py-1.5 rounded-lg text-[#6B7A90] hover:bg-[#131720] transition-colors">90 Days</button>
          <button className="px-3 py-1.5 rounded-lg text-[#6B7A90] hover:bg-[#131720] transition-colors">1 Year</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: stats.totalUsers.toLocaleString(), trend: '+12.5%', up: true, icon: Users, accent: 'cyan' },
          { title: 'Active Projects', value: stats.activeProjects.toLocaleString(), trend: '+5.2%', up: true, icon: Briefcase, accent: 'emerald' },
          { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, trend: '+18.3%', up: true, icon: DollarSign, accent: 'blue' },
          { title: 'Open Tickets', value: stats.openTickets.toLocaleString(), trend: '-2.1%', up: false, icon: AlertCircle, accent: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5 hover:border-[#2A3545] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-lg bg-${stat.accent}-500/10 border border-${stat.accent}-500/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.accent}-400`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-[#6B7A90] text-xs font-medium mb-1">{stat.title}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            {/* Mini sparkline bar */}
            <div className="mt-3 flex gap-0.5">
              {[40, 60, 35, 80, 55, 70, 90].map((h, j) => (
                <div key={j} className={`flex-1 rounded-sm bg-${stat.accent}-500/20`} style={{ height: `${h / 5}px` }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - takes 2 cols */}
        <div className="lg:col-span-2 bg-[#0D1117] border border-[#1B2232] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold">Revenue & Profit</h3>
              <p className="text-[#6B7A90] text-xs mt-0.5">Monthly breakdown</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span><span className="text-[#6B7A90]">Revenue</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-[#6B7A90]">Profit</span></div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1B2232" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#3D4A5C" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#3D4A5C" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131720', border: '1px solid #1B2232', borderRadius: '8px', color: '#C8CFD8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit Usage Donut */}
        <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-6 flex flex-col">
          <h3 className="text-white font-bold mb-1">Credit Analytics</h3>
          <p className="text-[#6B7A90] text-xs mb-4">Platform credit circulation</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={creditData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {creditData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{stats.creditsSold}</span>
                <span className="text-[10px] text-[#6B7A90] uppercase tracking-widest">Total Credits</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {creditData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[#6B7A90]">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-[#0D1117] border border-[#1B2232] rounded-xl p-6">
          <h3 className="text-white font-bold mb-1">User Signups</h3>
          <p className="text-[#6B7A90] text-xs mb-6">Last 7 days</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData} barGap={3}>
                <CartesianGrid stroke="#1B2232" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#3D4A5C" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#3D4A5C" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#131720', border: '1px solid #1B2232', borderRadius: '8px', color: '#C8CFD8', fontSize: '12px' }} />
                <Bar dataKey="freelancers" fill="#06B6D4" radius={[3, 3, 0, 0]} />
                <Bar dataKey="clients" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 bg-[#0D1117] border border-[#1B2232] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold">Recent Transactions</h3>
              <p className="text-[#6B7A90] text-xs mt-0.5">Latest platform financial activity</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#3D4A5C] text-xs uppercase tracking-wider border-b border-[#1B2232]">
                  <th className="text-left pb-3 font-semibold">Order ID</th>
                  <th className="text-left pb-3 font-semibold">User</th>
                  <th className="text-left pb-3 font-semibold">Type</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-right pb-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#1B2232]/50 hover:bg-[#131720] transition-colors">
                    <td className="py-3 text-cyan-400 font-mono text-xs">{order.id}</td>
                    <td className="py-3 text-white font-medium">{order.user}</td>
                    <td className="py-3 text-[#6B7A90]">{order.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-white font-semibold">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm">API Uptime</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400 mb-1">99.9%</p>
          <p className="text-[#6B7A90] text-xs">No incidents in last 30 days</p>
          <div className="mt-3 w-full bg-[#1B2232] rounded-full h-1.5">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full" style={{ width: '99.9%' }}></div>
          </div>
        </div>
        <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm">Database Load</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-400 mb-1">24%</p>
          <p className="text-[#6B7A90] text-xs">Normal operating range</p>
          <div className="mt-3 w-full bg-[#1B2232] rounded-full h-1.5">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
          </div>
        </div>
        <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm">Storage Used</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400 mb-1">1.2 GB</p>
          <p className="text-[#6B7A90] text-xs">of 8 GB total (Supabase)</p>
          <div className="mt-3 w-full bg-[#1B2232] rounded-full h-1.5">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
