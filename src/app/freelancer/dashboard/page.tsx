"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { 
  Briefcase, User as UserIcon, FileText, MessageSquare, 
  Settings, LogOut, Wallet, CheckCircle, Search, Menu, X, BarChart3
} from 'lucide-react'

const RECENT_ACTIVITY: any[] = [] 

export default function FreelancerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [credits, setCredits] = useState(0)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  
  // New States
  const [availableProjectsCount, setAvailableProjectsCount] = useState(0)
  const [activeProjectsCount, setActiveProjectsCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Parallel fetching for performance
    const [
      { data: creditData },
      { count: appCount },
      { count: availableCount },
      { count: activeCount },
      { data: activityData }
    ] = await Promise.all([
      supabase.from('credits').select('balance').eq('user_id', user.id).single(),
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_id', user.id),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('freelancer_id', user.id).eq('status', 'active'),
      supabase.from('applications')
        .select(`
          id,
          status,
          created_at,
          projects(title)
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    if (creditData) setCredits(creditData.balance)
    if (appCount !== null) setApplicationsCount(appCount)
    if (availableCount !== null) setAvailableProjectsCount(availableCount)
    if (activeCount !== null) setActiveProjectsCount(activeCount)
    if (activityData) setRecentActivity(activityData)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#0A0A0A] text-[#15171C] dark:text-[#ECEAE5] flex transition-colors duration-300">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] shadow-sm rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="dark:text-white" /> : <Menu className="dark:text-white" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#15171C] border-r border-[#ECEAE5] dark:border-[#2A2B32] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl leading-none mb-8">
            <span className="text-[#15171C] dark:text-white">Connect</span>
            <span className="text-[#2563EB]">Pro</span>
          </Link>
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard', active: true, href: '#' },
              { icon: UserIcon, label: 'My Profile', href: userId ? `/profile/${userId}` : '#' },
              { icon: Search, label: 'Find Work', href: '/freelancer/projects' },
              { icon: Briefcase, label: 'My Applications', href: '/freelancer/applications' },
              { icon: FileText, label: 'Contracts', href: '/freelancer/contracts' },
              { icon: MessageSquare, label: 'Messages', href: '/messages' },
              { icon: Settings, label: 'Settings', href: '/settings' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${item.active ? 'bg-[#EEF3FF] text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA] font-semibold' : 'text-[#5B5E68] dark:text-[#8A8D96] hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] hover:text-[#15171C] dark:hover:text-white font-medium'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[#ECEAE5] dark:border-[#2A2B32]">
          <button onClick={handleSignOut} className="flex items-center space-x-3 text-[#5B5E68] dark:text-[#8A8D96] hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#15171C] dark:text-white mb-2">Freelancer Dashboard</h1>
            <p className="text-[#5B5E68] dark:text-[#8A8D96]">Track your proposals, active projects, and earnings.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/freelancer/projects" className="bg-[#15171C] dark:bg-[#2563EB] hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center shadow-lg shadow-black/10">
              <Search className="w-5 h-5 mr-2" />
              Find Work
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Credits Balance', value: credits.toString(), icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
            { label: 'Available Projects', value: availableProjectsCount.toString(), icon: Search, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Applications Sent', value: applicationsCount.toString(), icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            { label: 'Active Projects', value: activeProjectsCount.toString(), icon: CheckCircle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[#5B5E68] dark:text-[#8A8D96] font-medium text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-[#15171C] dark:text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-display font-bold text-[#15171C] dark:text-white mb-6">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EEF3FF] dark:bg-[#2563EB]/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#2563EB] dark:text-[#60A5FA]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#15171C] dark:text-white">{activity.projects?.title || 'Unknown Project'}</h4>
                        <p className="text-sm text-[#5B5E68] dark:text-[#8A8D96]">Applied on {new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        activity.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        activity.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#F7F6F3] dark:bg-[#0A0A0A] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#ECEAE5] dark:border-[#2A2B32]">
                <Briefcase className="w-8 h-8 text-[#8A8D96] dark:text-[#5B5E68]" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#15171C] dark:text-white mb-2">No recent activity</h3>
              <p className="text-[#5B5E68] dark:text-[#8A8D96] mb-6 max-w-sm mx-auto">You haven't applied to any projects recently. Start browsing available projects to kickstart your freelance journey.</p>
              <Link href="/freelancer/projects" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 px-6 rounded-full transition-colors inline-block shadow-lg shadow-blue-500/20">
                Find Projects
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
