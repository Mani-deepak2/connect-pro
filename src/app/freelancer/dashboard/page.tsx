"use client"
import { useState, useEffect } from 'react'
import { Wallet, Search, FileText, CheckCircle, TrendingUp, Eye, Star, Zap, Clock, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/utils/supabase/client'

export default function FreelancerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [credits, setCredits] = useState<number>(0)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [contractsCount, setContractsCount] = useState(0)
  const [activeContracts, setActiveContracts] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch profile
        const { data: profileData } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileData) setProfile(profileData)

        // Fetch credits
        const { data: creditData } = await supabase
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()
        
        if (creditData) setCredits(creditData.balance)

        // Fetch applications count
        const { count: appsCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id)
        
        if (appsCount) setApplicationsCount(appsCount)

        // Fetch active contracts
        const { data: contractsData } = await supabase
          .from('contracts')
          .select(`
            *,
            projects(title, client_profiles(company_name))
          `)
          .eq('freelancer_id', user.id)
          .eq('status', 'active')
        
        if (contractsData) {
          setActiveContracts(contractsData)
          setContractsCount(contractsData.length)
        }

        // Fetch upcoming interviews
        const { data: interviewsData } = await supabase
          .from('interviews')
          .select(`*, client_profiles(company_name)`)
          .eq('freelancer_id', user.id)
          .eq('status', 'Scheduled')
          .order('scheduled_at', { ascending: true })
          .limit(5)
        
        if (interviewsData) setInterviews(interviewsData)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()

    // Realtime subscriptions
    const channel = supabase.channel('freelancer_dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'credits' }, (payload) => {
        // Handle credit updates
        loadDashboardData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, (payload) => {
        loadDashboardData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  // Calculate profile completion dynamically based on available fields
  let profileCompletion = 0
  if (profile) {
    let fields = ['full_name', 'title', 'bio', 'hourly_rate', 'experience_level', 'skills', 'profile_image', 'portfolio_link']
    let filled = fields.filter(f => profile[f] !== null && profile[f] !== '' && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)).length
    profileCompletion = Math.round((filled / fields.length) * 100)
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || profile?.username || 'Freelancer'}!</h1>
          <p className="text-gray-500">Track your proposals, active contracts, and upcoming interviews.</p>
        </div>
        <Link href="/freelancer/projects" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20 flex items-center">
          <Search className="w-4 h-4 mr-2" />
          Find Work
        </Link>
      </header>

      {/* Gamified Profile Widget */}
      {profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full blur-3xl opacity-30 translate-y-1/4 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex-1 w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Your profile is {profileCompletion}% complete!</h2>
            <p className="text-teal-100 mb-5 max-w-xl text-sm leading-relaxed">Freelancers with completed profiles are 4x more likely to be hired.</p>
            
            <div className="w-full bg-teal-950/50 rounded-full h-3 mb-2 backdrop-blur-sm overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full relative" style={{ width: `${profileCompletion}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <Link href="/freelancer/profile/edit" className="relative z-10 shrink-0 bg-white text-teal-900 font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Available Credits', value: credits, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Active Applications', value: applicationsCount, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Contracts', value: contractsCount, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Upcoming Interviews', value: interviews.length, icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        
        {/* Left Col: Active Contracts */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Active Contracts</h3>
              <Link href="/freelancer/contracts" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>
            </div>
            
            <div className="space-y-4">
              {activeContracts.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No active contracts found.</p>
              ) : activeContracts.map((contract, i) => (
                <div key={contract.id} className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-200 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="font-bold text-gray-500">{contract.projects?.client_profiles?.company_name?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{contract.projects?.title || 'Untitled Project'}</h4>
                      <p className="text-sm text-gray-500">{contract.projects?.client_profiles?.company_name || 'Unknown Client'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end text-sm">
                    <span className="font-bold text-gray-900">${contract.amount || 0}</span>
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
              Upcoming Interviews
            </h3>
            
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No scheduled interviews.</p>
              ) : interviews.map(interview => (
                <div key={interview.id} className="p-4 border border-teal-100 bg-teal-50/30 rounded-2xl">
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Scheduled Interview</p>
                  <h4 className="font-bold text-gray-900 mb-1">Interview with {interview.client_profiles?.company_name || 'Client'}</h4>
                  <p className="text-sm text-gray-600 mb-4">{new Date(interview.scheduled_at).toLocaleString()}</p>
                  {interview.meeting_link && (
                    <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="block w-full text-center px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
                      Join Meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
