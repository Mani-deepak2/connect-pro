"use client"
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, FileText, MessageSquare, 
  Settings, LogOut, CheckCircle, PlusCircle, Menu, X, BarChart3, Briefcase, DollarSign, Wallet, Activity, ArrowRight, UserPlus
} from 'lucide-react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Project } from '@/types'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

// Dynamic data will be fetched from Supabase

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [contractsCount, setContractsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [clientName, setClientName] = useState<string>('')
  const [recommendedFreelancers, setRecommendedFreelancers] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [walletBalance, setWalletBalance] = useState(0)
  const [totalSpending, setTotalSpending] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Removed Auto-Admin script for security

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data as Project[])
    }

    // Parallel fetching for performance
    const [
      { count: cCount },
      { data: profileData },
      { data: freelancersData },
      { data: activityData },
      { data: creditsData }
    ] = await Promise.all([
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('client_id', user.id),
      supabase.from('client_profiles').select('company_name').eq('user_id', user.id).single(),
      supabase.from('freelancer_profiles').select('*').limit(5),
      supabase.from('applications')
        .select(`
          id,
          status,
          created_at,
          projects!inner(client_id, title),
          freelancer_profiles(full_name)
        `)
        .eq('projects.client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase.from('user_credits').select('credits').eq('user_id', user.id).maybeSingle()
    ])

    if (cCount !== null) setContractsCount(cCount)
    if (profileData) setClientName(profileData.company_name)
    if (freelancersData) setRecommendedFreelancers(freelancersData)
    if (activityData) setRecentActivity(activityData)
    if (creditsData) setWalletBalance(creditsData.credits || 0)

    if (data && data.length > 0) {
      const projectIds = data.map(p => p.id)
      const { count: aCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).in('project_id', projectIds)
      if (aCount !== null) setApplicationsCount(aCount)
      
      const { data: contractsData } = await supabase.from('contracts').select('budget').eq('client_id', user.id)
      if (contractsData) {
        const spent = contractsData.reduce((acc, curr) => acc + (curr.budget || 0), 0)
        setTotalSpending(spent)
      }
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-6 md:p-10 text-[#15171C]">
      
      {/* Welcome Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back{clientName ? `, ${clientName}` : ''}!</h1>
          <p className="text-gray-500">Here's what's happening with your hiring pipeline today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="text-sm">
              <p className="text-gray-500 mb-1">Profile Completion</p>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <span className="font-bold text-teal-600">85%</span>
          </div>
          <Link href="/client/projects/new" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post Project
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Total Projects', value: projects.length.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Projects', value: projects.filter(p => p.status === 'open' || p.status === 'in_progress').length.toString(), icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Applications', value: applicationsCount.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Contracts', value: contractsCount.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Closed Projects', value: projects.filter(p => p.status === 'completed' || p.status === 'cancelled').length.toString(), icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'Drafts', value: '0', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Total Spending', value: `$${totalSpending.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Wallet Balance', value: `${walletBalance} Credits`, icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts 
        spendingData={useMemo(() => {
          // Dynamic Spending Data from Total Spending 
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const data = months.slice(0, new Date().getMonth() + 1).map(m => ({ name: m, amount: 0 }))
          if (data.length > 0) {
            data[data.length - 1].amount = totalSpending
          }
          return data.slice(-7).length > 0 ? data.slice(-7) : undefined
        }, [totalSpending])}
        hiringData={useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const data = months.slice(0, new Date().getMonth() + 1).map(m => ({ name: m, hires: 0 }))
        projects.forEach(p => {
          const d = new Date(p.created_at)
          if (d.getFullYear() === new Date().getFullYear()) {
            const m = d.getMonth()
            if (data[m]) data[m].hires += 1
          }
        })
        return data.slice(-7).length > 0 ? data.slice(-7) : undefined
      }, [projects])} />

      {/* Three Column Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Col: Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
            <Link href="/client/workspace?status=active" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {projects.slice(0, 4).map((project, index) => (
                 <ProjectCard 
                    key={`${project.id || 'proj'}-${index}`} 
                    project={project} 
                    href={`/client/workspace/${project.id}`} 
                 />
               ))}
            </div>
          ) : (
            <EmptyState 
              icon={FileText}
              title="No projects yet"
              description="Post your first project to start receiving applications."
              actionLabel="Post Project"
              actionHref="/client/projects/new"
            />
          )}
        </div>

        {/* Right Col: Activity Feed & Recommendations */}
        <div className="space-y-8">
          
          {/* Activity Feed */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={`${activity.id || 'act'}-${index}`} className="flex gap-4">
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">
                      {activity.freelancer_profiles?.full_name || 'A freelancer'} applied for "{activity.projects?.title}"
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">No recent activity found.</p>
              )}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              View Full History
            </button>
          </div>

          {/* Recommended Freelancers */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900">Recommended For You</h3>
            </div>
            <div className="space-y-4">
              {recommendedFreelancers.length > 0 ? recommendedFreelancers.map((freelancer, index) => (
                <Link href={`/profile/${freelancer.user_id}`} key={`${freelancer.id || 'free'}-${index}`} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold overflow-hidden">
                      {freelancer.profile_image ? (
                        <img src={freelancer.profile_image} alt={freelancer.full_name} className="w-full h-full object-cover" />
                      ) : (
                        freelancer.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{freelancer.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{freelancer.title || freelancer.experience_level || 'Freelancer'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${freelancer.hourly_rate || 0}/hr</p>
                    <p className="text-xs font-medium text-yellow-600">★ 5.0</p>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-gray-500">No freelancers found.</p>
              )}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors">
              Discover More
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
