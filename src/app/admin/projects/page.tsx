"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Briefcase, Search, Flag, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*, client_profiles(company_name)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setProjects(data)
    setIsLoading(false)
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  const statusColor: Record<string, string> = {
    open: 'text-cyan-400 bg-cyan-500/10',
    in_progress: 'text-amber-400 bg-amber-500/10',
    completed: 'text-emerald-400 bg-emerald-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Management</h1>
          <p className="text-[#6B7A90] text-sm mt-1">Oversee all projects on the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          {['all', 'open', 'in_progress', 'completed', 'cancelled'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-[#6B7A90] hover:bg-[#131720]'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-[#1B2232] mx-auto mb-3" />
            <p className="text-[#6B7A90] text-sm">No projects found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#3D4A5C] text-[10px] uppercase tracking-widest border-b border-[#1B2232]">
                  <th className="text-left px-5 py-3.5 font-semibold">Project</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Client</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Budget</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Posted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-b border-[#1B2232]/50 hover:bg-[#131720] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white font-medium text-sm">{project.title}</p>
                      <p className="text-[#3D4A5C] text-[10px] font-mono">{project.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-5 py-4 text-[#6B7A90] text-xs">{project.client_profiles?.company_name || 'Unknown'}</td>
                    <td className="px-5 py-4 text-white text-xs font-semibold">${project.budget?.toLocaleString() || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[project.status] || 'text-[#6B7A90]'}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B7A90] text-xs">{new Date(project.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
