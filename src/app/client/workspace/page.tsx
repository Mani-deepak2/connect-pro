"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PlusCircle, Search, Filter, MoreVertical, Edit, Copy, Archive, CheckCircle, Trash2, Clock, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/types'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSearchParams } from 'next/navigation'

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'active'
  const [activeTab, setActiveTab] = useState(initialStatus)

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      setActiveTab(status)
    }
  }, [searchParams])

  const fetchProjects = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setProjects(data)
    setIsLoading(false)
  }

  const filteredProjects = projects.filter(p => {
    // Tab filtering
    if (activeTab === 'active' && !['open', 'in_progress'].includes(p.status)) return false
    if (activeTab === 'closed' && !['closed', 'completed'].includes(p.status)) return false
    if (activeTab === 'draft' && p.status !== 'draft') return false
    
    // Search filtering
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    
    return true
  })

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Projects</h1>
          <p className="text-gray-500">Manage your project postings and active engagements.</p>
        </div>
        <Link href="/client/projects/new" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center shadow-sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          Post New Project
        </Link>
      </header>

      {/* Advanced Tabs & Search */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-100 gap-4">
          <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl overflow-x-auto hide-scrollbar w-full md:w-auto">
            {['active', 'closed', 'draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-teal-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {tab}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                  {tab === 'active' ? projects.filter(p => ['open', 'in_progress'].includes(p.status)).length :
                   tab === 'closed' ? projects.filter(p => ['closed', 'completed'].includes(p.status)).length :
                   projects.filter(p => p.status === 'draft').length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredProjects.map(project => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors group flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/client/workspace/${project.id}`} className="text-xl font-bold text-gray-900 hover:text-teal-600 transition-colors truncate">
                        {project.title}
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider
                        ${project.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                          project.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'}`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        {project.budget_type === 'fixed' ? `$${project.fixed_budget}` : `$${project.hourly_rate_min} - $${project.hourly_rate_max}/hr`}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> 12 Applicants
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 pr-8">{project.description}</p>
                  </div>

                  <div className="flex items-center gap-3 md:pl-6 md:border-l border-gray-100 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <Link href={`/client/workspace/${project.id}`} className="text-teal-600 font-medium text-sm hover:text-teal-700 flex items-center">
                      Manage <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                    
                    <div className="relative group/menu">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden">
                        <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Edit Project
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        {activeTab !== 'closed' && (
                          <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Mark as Closed
                          </button>
                        )}
                        <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Archive className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 max-w-sm mb-6">There are currently no {activeTab} projects matching your filters.</p>
              {activeTab !== 'draft' && (
                <Link href="/client/projects/new" className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl transition-colors">
                  Post a Project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
