"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Briefcase, User as UserIcon, FileText, MessageSquare, 
  Settings, LogOut, Wallet, CheckCircle, Search, Menu, X
} from 'lucide-react'

const RECENT_ACTIVITY: any[] = [] 

export default function FreelancerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white/10 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#15171c] border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-500 mb-8 tracking-tight">ConnectPro</h2>
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard', active: true, href: '#' },
              { icon: User, label: 'My Profile', href: '/onboarding/freelancer' },
              { icon: Search, label: 'Find Work', href: '/freelancer/projects' },
              { icon: Briefcase, label: 'My Applications', href: '/freelancer/applications' },
              { icon: MessageSquare, label: 'Messages', href: '/messages' },
              { icon: Settings, label: 'Settings', href: '/settings' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${item.active ? 'bg-purple-600/10 text-purple-500 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5">
          <button onClick={handleSignOut} className="flex items-center space-x-3 text-gray-400 hover:text-red-400 transition-colors w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <header className="mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Freelancer Dashboard</h1>
            <p className="text-gray-400">Track your proposals, active projects, and earnings.</p>
          </div>
          <Link href="/freelancer/projects" className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center shadow-lg shadow-purple-500/20 mt-4 inline-flex">
            <Search className="w-5 h-5 mr-2" />
            Find Work
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Credits Balance', value: '150', icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Available Projects', value: '342', icon: Search, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Applications Sent', value: '12', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Active Projects', value: '3', icon: CheckCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          {RECENT_ACTIVITY.length > 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
               {/* Activity List */}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No recent activity</h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">You haven't applied to any projects recently. Start browsing available projects to kickstart your freelance journey.</p>
              <Link href="/freelancer/projects" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-block">
                Find Projects
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
