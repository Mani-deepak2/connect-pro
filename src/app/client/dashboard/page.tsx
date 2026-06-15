"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, FileText, MessageSquare, 
  Settings, LogOut, CheckCircle, PlusCircle, Menu, X, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Project } from '@/types'

const RECENT_ACTIVITY: any[] = []

export default function ClientDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
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
    setIsLoading(false)
  }

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
          <h2 className="text-2xl font-bold text-purple-500 mb-8 tracking-tight">ConnectPro</h2>
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard', active: true, href: '#' },
              { icon: Building2, label: 'Company Profile', href: '/onboarding/client' },
              { icon: PlusCircle, label: 'Post Project', href: '/client/projects/new' },
              { icon: FileText, label: 'My Projects', href: '/client/projects' },
              { icon: Users, label: 'Applications', href: '/client/applications' },
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
        <header className="mb-10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Dashboard</h1>
            <p className="text-gray-400">Manage your projects and hired freelancers.</p>
          </div>
          <Link href="/client/projects/new" className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center shadow-lg shadow-purple-500/20">
            <PlusCircle className="w-5 h-5 mr-2" />
            Post New Project
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Projects', value: projects.length.toString(), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Active Projects', value: projects.filter(p => p.status === 'open' || p.status === 'in_progress').length.toString(), icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Applications Received', value: '-', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Hired Freelancers', value: '-', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
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
          <h2 className="text-xl font-bold text-white mb-6">Your Posted Projects</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projects.map(project => (
                 <ProjectCard 
                    key={project.id} 
                    project={project} 
                    href={`/client/projects/${project.id}/applications`} 
                 />
               ))}
            </div>
          ) : (
            <EmptyState 
              icon={FileText}
              title="No projects yet"
              description="You haven't posted any projects. Create your first project to start receiving applications from talented freelancers."
              actionLabel="Post Project"
              actionHref="/client/projects/new"
            />
          )}
        </div>
      </main>
    </div>
  )
}
