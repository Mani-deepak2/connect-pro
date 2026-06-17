"use client"
import { useState, useEffect } from 'react'
import { Send, Clock, CheckCircle, XCircle, MoreVertical, MessageSquare, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function Applications() {
  const [activeTab, setActiveTab] = useState('active')
  const [proposals, setProposals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('applications')
      .select('*, project:project_id(title, client:client_id(company_name))')
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setProposals(data)
    }
    setIsLoading(false)
  }

  // Fallback to MOCK data ONLY if the database returns 0 proposals.
  const MOCK_PROPOSALS = [
    { id: '1', project: { title: 'Senior React Developer for Fintech SaaS', client: { company_name: 'Acme Corp' } }, bid_amount: 65, status: 'interviewing', created_at: new Date().toISOString(), unread: 1, proposal: 'Hi Acme team, I have 5 years of experience building React/Next.js dashboards in the fintech space...' },
    { id: '2', project: { title: 'Complete UX/UI Redesign for Mobile App', client: { company_name: 'HealthFlow' } }, bid_amount: 5000, status: 'pending', created_at: new Date().toISOString(), unread: 0, proposal: 'I have attached my Figma portfolio featuring 3 recent mobile app redesigns. I can deliver this within...' },
    { id: '3', project: { title: 'Backend API Development (Node.js)', client: { company_name: 'TechStart Inc.' } }, bid_amount: 50, status: 'accepted', created_at: new Date().toISOString(), unread: 0, proposal: 'I am an AWS Certified backend engineer. I can build your REST APIs using Express and Postgres...' },
    { id: '4', project: { title: 'WordPress Theme Customization', client: { company_name: 'BloggerPro' } }, bid_amount: 500, status: 'rejected', created_at: new Date().toISOString(), unread: 0, proposal: 'I can customize the theme exactly to your specifications...' },
  ]

  const displayProposals = proposals.length > 0 ? proposals : MOCK_PROPOSALS

  const filteredProposals = displayProposals.filter(p => {
    if (activeTab === 'active') return ['pending', 'interviewing'].includes(p.status)
    if (activeTab === 'archived') return ['accepted', 'rejected'].includes(p.status)
    return true
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'interviewing': return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 flex items-center w-fit"><MessageSquare className="w-3 h-3 mr-1" /> Interviewing</span>;
      case 'accepted': return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Accepted</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100 flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default: return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-100 flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Proposals</h1>
          <p className="text-gray-500">Track the status of your submitted job applications.</p>
        </div>
        <Link href="/freelancer/projects" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm flex items-center">
          <Send className="w-4 h-4 mr-2" />
          Submit New Proposal
        </Link>
      </header>

      {/* Main Content */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm mb-8">
        
        {/* Tabs */}
        <div className="flex px-2 pt-2 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
          {[
            { id: 'active', label: 'Active Proposals' },
            { id: 'archived', label: 'Archived' },
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
                {tab.id === 'active' ? displayProposals.filter((p:any) => ['pending', 'interviewing'].includes(p.status)).length : displayProposals.filter((p:any) => ['accepted', 'rejected'].includes(p.status)).length}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading proposals...</div>
          ) : filteredProposals.length > 0 ? (
            filteredProposals.map((proposal: any) => (
              <div key={proposal.id} className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors group flex flex-col lg:flex-row gap-6">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Link href={`#`} className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                          {proposal.project?.title}
                        </Link>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {proposal.project?.client?.company_name} <span className="mx-1 text-gray-300">•</span> ${proposal.bid_amount}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4 leading-relaxed bg-gray-50 border border-gray-100 p-4 rounded-xl italic">
                    "{proposal.proposal}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted {new Date(proposal.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-gray-300">|</span>
                    <Link href="#" className="text-teal-600 hover:underline">View original job posting</Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-48 shrink-0 flex flex-col gap-2 lg:pl-6 lg:border-l border-gray-100">
                  {proposal.status === 'interviewing' && (
                    <button className="w-full px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Message Client
                    </button>
                  )}
                  {proposal.status === 'accepted' && (
                    <button className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View Contract
                    </button>
                  )}
                  {proposal.status === 'pending' && (
                    <button className="w-full px-4 py-2 bg-white border border-gray-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                      Withdraw Proposal
                    </button>
                  )}
                  
                  <button className="w-full px-4 py-2 bg-white border border-transparent text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-auto">
                    <MoreVertical className="w-4 h-4" /> Options
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No {activeTab} proposals</h3>
              <p className="text-sm text-gray-500 mb-6">You don't have any {activeTab} proposals at the moment.</p>
              <Link href="/freelancer/projects" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm inline-flex">
                Search for Jobs
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
