"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, User as UserIcon, Clock, DollarSign } from 'lucide-react'
import { Project, Application } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'

export default function ViewApplications() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const fetchData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('client_id', user.id)
      .single()

    if (projectData) setProject(projectData as Project)

    // Fetch applications with freelancer profile data
    const { data: appsData } = await supabase
      .from('applications')
      .select(`
        *,
        freelancer:freelancer_profiles(*)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false })

    if (appsData) setApplications(appsData)
    setIsLoading(false)
  }

  const updateStatus = async (appId: string, status: string) => {
    // Optimistic update
    setApplications(apps => apps.map(app => app.id === appId ? { ...app, status } : app))
    
    await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  }

  if (!project) {
    return <div className="min-h-screen bg-[#0f1115] p-10 text-white">Project not found</div>
  }

  return (
    <div className="min-h-screen bg-[#0f1115] py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/client/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Applications for {project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              project.status === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {project.status.toUpperCase()}
            </span>
            <span>{applications.length} total applicants</span>
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row gap-8">
                {/* Profile column */}
                <div className="md:w-1/3 border-r border-white/5 pr-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {app.freelancer?.profile_image ? (
                        <img src={app.freelancer.profile_image} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{app.freelancer?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-400">{app.freelancer?.professional_title}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm"><span className="text-gray-500">Rate:</span> <span className="text-white">${app.freelancer?.hourly_rate || 0}/hr</span></div>
                    <div className="text-sm"><span className="text-gray-500">Exp:</span> <span className="text-white capitalize">{app.freelancer?.experience_level || 'Unknown'}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {app.freelancer?.skills?.slice(0,4).map((s:string) => (
                      <span key={s} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Proposal column */}
                <div className="md:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-6">
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                        <span className="font-semibold">${app.bid_amount}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-1 text-blue-400" />
                        <span className="font-semibold">{app.estimated_delivery_days} days</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                      app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                      app.status === 'shortlisted' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Cover Letter</h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.proposal}</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                      <button onClick={() => updateStatus(app.id, 'rejected')} className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => updateStatus(app.id, 'shortlisted')} className="px-4 py-2 rounded-lg text-sm font-medium text-orange-400 hover:bg-orange-500/10 transition-colors">
                        Shortlist
                      </button>
                      <button onClick={() => updateStatus(app.id, 'accepted')} className="px-6 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors">
                        Hire Freelancer
                      </button>
                    </div>
                  )}
                  {app.status === 'shortlisted' && (
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                      <button onClick={() => updateStatus(app.id, 'rejected')} className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => updateStatus(app.id, 'accepted')} className="px-6 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors">
                        Hire Freelancer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={UserIcon}
            title="No applications yet"
            description="Your project hasn't received any applications yet. Make sure your description is clear and budget is competitive."
          />
        )}
      </div>
    </div>
  )
}
