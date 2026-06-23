"use client"
import { useState } from 'react'
import { Wallet, Search, FileText, CheckCircle, TrendingUp, Eye, Star, Zap, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const earningsData = [
  { name: 'Mon', amount: 120 },
  { name: 'Tue', amount: 250 },
  { name: 'Wed', amount: 400 },
  { name: 'Thu', amount: 180 },
  { name: 'Fri', amount: 350 },
  { name: 'Sat', amount: 50 },
  { name: 'Sun', amount: 0 },
]

export default function FreelancerDashboard() {
  const [profileCompletion] = useState(85)

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back, Alex!</h1>
          <p className="text-gray-500">Track your proposals, active contracts, and recent earnings.</p>
        </div>
        <Link href="/freelancer/projects" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20 flex items-center">
          <Search className="w-4 h-4 mr-2" />
          Find Work
        </Link>
      </header>

      {/* Gamified Profile Widget */}
      <div className="bg-gradient-to-r from-teal-900 to-teal-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full blur-3xl opacity-30 translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex-1 w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Your profile is {profileCompletion}% complete!</h2>
          <p className="text-teal-100 mb-5 max-w-xl text-sm leading-relaxed">Freelancers with completed profiles are 4x more likely to be hired. Add a portfolio project to reach 100%.</p>
          
          <div className="w-full bg-teal-950/50 rounded-full h-3 mb-2 backdrop-blur-sm overflow-hidden p-0.5">
            <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full relative" style={{ width: `${profileCompletion}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-teal-200 font-semibold uppercase tracking-wider">Next Step: Add Portfolio Item</p>
        </div>

        <button className="relative z-10 shrink-0 bg-white text-teal-900 font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
          Complete Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Available Connects', value: '45', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Profile Views', value: '128', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Proposals', value: '12', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Job Success Rate', value: '98%', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-gray-500 font-medium text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Earnings Chart & Active Contracts */}
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Earnings This Week</h3>
                <p className="text-sm text-gray-500">Total: <span className="font-bold text-emerald-600">$1,350.00</span></p>
              </div>
              <button className="text-sm text-gray-500 hover:text-teal-600 font-medium flex items-center">
                View Report <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`$${value}`, 'Earned']}
                  />
                  <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Active Contracts</h3>
              <Link href="/freelancer/contracts" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>
            </div>
            
            <div className="space-y-4">
              {[
                { title: 'E-commerce Redesign', client: 'Acme Corp', rate: '$65/hr', hours: '12 hrs logged this week' },
                { title: 'API Gateway Build', client: 'TechFlow', rate: '$5,000 fixed', hours: 'Milestone 2 in progress' },
              ].map((contract, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-200 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="font-bold text-gray-500">{contract.client.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{contract.title}</h4>
                      <p className="text-sm text-gray-500">{contract.client}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end text-sm">
                    <span className="font-bold text-gray-900">{contract.rate}</span>
                    <span className="text-gray-500 flex items-center mt-1"><Clock className="w-3.5 h-3.5 mr-1" />{contract.hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Recent Job Invites & Activity */}
        <div className="space-y-8">
          
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
              New Invitations
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-teal-100 bg-teal-50/30 rounded-2xl">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Direct Invite</p>
                <h4 className="font-bold text-gray-900 mb-1">Senior React Developer needed</h4>
                <p className="text-sm text-gray-600 mb-4">You have been invited by Google LLC to interview for this position.</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm">Accept</button>
                  <button className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Decline</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
            
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-100"></div>
              
              <div className="relative">
                <div className="absolute -left-[27px] bg-white p-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-50"></div>
                </div>
                <p className="text-sm text-gray-900 font-medium">Proposal Viewed</p>
                <p className="text-xs text-gray-500 mt-1">Acme Corp viewed your proposal for "E-commerce Redesign".</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">2 hours ago</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[27px] bg-white p-1">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-emerald-50"></div>
                </div>
                <p className="text-sm text-gray-900 font-medium">Payment Released</p>
                <p className="text-xs text-gray-500 mt-1">TechFlow released $2,500 for Milestone 1.</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Yesterday</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[27px] bg-white p-1">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full ring-4 ring-purple-50"></div>
                </div>
                <p className="text-sm text-gray-900 font-medium">Proposal Submitted</p>
                <p className="text-xs text-gray-500 mt-1">You applied to "Mobile App Design".</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">2 days ago</p>
              </div>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  )
}
