"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    // Fetch credits
    const { data: creditData } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    if (creditData) setCredits(creditData.balance)

    // Fetch applications count
    const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('freelancer_id', user.id)
    if (count !== null) setApplicationsCount(count)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#15171C] flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-[#ECEAE5] shadow-sm rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#ECEAE5] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl leading-none mb-8">
            <span className="text-[#15171C]">Connect</span>
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
              <Link key={i} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${item.active ? 'bg-[#EEF3FF] text-[#2563EB] font-semibold' : 'text-[#5B5E68] hover:bg-[#F7F6F3] hover:text-[#15171C] font-medium'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[#ECEAE5]">
          <button onClick={handleSignOut} className="flex items-center space-x-3 text-[#5B5E68] hover:text-red-600 font-medium transition-colors w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <header className="mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Freelancer Dashboard</h1>
            <p className="text-[#5B5E68]">Track your proposals, active projects, and earnings.</p>
          </div>
          <Link href="/freelancer/projects" className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center shadow-lg shadow-black/10 mt-4 inline-flex">
            <Search className="w-5 h-5 mr-2" />
            Find Work
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Credits Balance', value: credits.toString(), icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Available Projects', value: '342', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Applications Sent', value: applicationsCount.toString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Active Projects', value: '0', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[#5B5E68] font-medium text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-[#15171C]">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-display font-bold text-[#15171C] mb-6">Recent Activity</h2>
          {RECENT_ACTIVITY.length > 0 ? (
            <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6">
               {/* Activity List */}
            </div>
          ) : (
            <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#F7F6F3] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#ECEAE5]">
                <Briefcase className="w-8 h-8 text-[#8A8D96]" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#15171C] mb-2">No recent activity</h3>
              <p className="text-[#5B5E68] mb-6 max-w-sm mx-auto">You haven't applied to any projects recently. Start browsing available projects to kickstart your freelance journey.</p>
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
