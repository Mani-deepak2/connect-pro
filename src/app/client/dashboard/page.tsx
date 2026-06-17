"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, FileText, MessageSquare, 
  Settings, LogOut, CheckCircle, PlusCircle, Menu, X, BarChart3, Briefcase, DollarSign, Wallet, Activity, ArrowRight, UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Project } from '@/types'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'

const RECENT_ACTIVITY = [
  { id: 1, type: 'applicant', message: 'Sarah Smith applied for Full Stack Developer', time: '2 hours ago', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, type: 'message', message: 'New message from Michael Johnson', time: '5 hours ago', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 3, type: 'contract', message: 'Contract signed for E-commerce Project', time: '1 day ago', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, type: 'payment', message: 'Payment of $1,500 successfully processed', time: '2 days ago', icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-50' },
]

const RECOMMENDED_FREELANCERS = [
  { id: 1, name: 'Alex Rivera', role: 'Senior React Developer', rating: 4.9, rate: '$65/hr', img: 'A' },
  { id: 2, name: 'Emily Chen', role: 'UI/UX Designer', rating: 5.0, rate: '$50/hr', img: 'E' },
  { id: 3, name: 'David Kim', role: 'Node.js Expert', rating: 4.8, rate: '$75/hr', img: 'D' },
]

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [contractsCount, setContractsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

    // Fetch contracts count
    const { count: cCount } = await supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('client_id', user.id)
    if (cCount !== null) setContractsCount(cCount)

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back!</h1>
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
          { label: 'Applications', value: '124', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Contracts', value: contractsCount.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Closed Projects', value: projects.filter(p => p.status === 'completed' || p.status === 'closed').length.toString(), icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'Drafts', value: projects.filter(p => p.status === 'draft').length.toString(), icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Total Spending', value: '$12,450', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Wallet Balance', value: '$3,550', icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
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
      <DashboardCharts />

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
               {projects.slice(0, 4).map(project => (
                 <ProjectCard 
                    key={project.id} 
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
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className={`mt-0.5 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center shrink-0`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">{activity.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">{activity.time}</span>
                  </div>
                </div>
              ))}
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
              {RECOMMENDED_FREELANCERS.map((freelancer) => (
                <div key={freelancer.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      {freelancer.img}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{freelancer.name}</p>
                      <p className="text-xs text-gray-500">{freelancer.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{freelancer.rate}</p>
                    <p className="text-xs font-medium text-yellow-600">★ {freelancer.rating}</p>
                  </div>
                </div>
              ))}
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
