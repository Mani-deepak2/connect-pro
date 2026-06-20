"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Building2, Users, FileText, MessageSquare, 
  Settings, LogOut, CheckCircle, PlusCircle, Menu, X, BarChart3, Briefcase
} from 'lucide-react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Project } from '@/types'

const RECENT_ACTIVITY: any[] = []

export default function ClientDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [contractsCount, setContractsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Auto-Admin script for admin22006@gmail.com
  useEffect(() => {
    const makeAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'admin22006@gmail.com') {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
          await supabase.from('users').update({ role: 'admin' }).eq('id', user.id)
          router.push('/admin')
        }
      }
    }
    makeAdmin()
  }, [])

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
              { icon: Building2, label: 'Company Profile', href: '#' },
              { icon: PlusCircle, label: 'Post Project', href: '/client/projects/new' },
              { icon: FileText, label: 'My Projects', href: '/client/projects' },
              { icon: Users, label: 'Applications', href: '/client/applications' },
              { icon: Briefcase, label: 'Contracts', href: '/client/contracts' },
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
        <header className="mb-10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Client Dashboard</h1>
            <p className="text-[#5B5E68]">Manage your projects and hired freelancers.</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/client/projects/new" className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center shadow-lg shadow-black/10">
              <PlusCircle className="w-5 h-5 mr-2" />
              Post New Project
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Projects', value: projects.length.toString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Projects', value: projects.filter(p => p.status === 'open' || p.status === 'in_progress').length.toString(), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Applications Received', value: '-', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Contracts', value: contractsCount.toString(), icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
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
          <h2 className="text-xl font-display font-bold text-[#15171C] mb-6">Your Posted Projects</h2>
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
                    href={`/client/workspace/${project.id}`} 
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
