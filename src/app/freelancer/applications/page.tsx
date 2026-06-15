"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2, Briefcase, Clock, DollarSign } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setApplications(data)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f1115] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/freelancer/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-gray-400">Track the status of your submitted proposals</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/freelancer/projects/${app.project_id}`} className="hover:underline">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                        {app.project?.title || 'Unknown Project'}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-400">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
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
                
                <div className="flex gap-6 mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                    Bid: ${app.bid_amount}
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Clock className="w-4 h-4 mr-1 text-blue-400" />
                    Delivery: {app.estimated_delivery_days} days
                  </div>
                </div>

                <div className="bg-[#15171C] p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Your Proposal</h4>
                  <p className="text-sm text-gray-300 line-clamp-2">{app.proposal}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Briefcase}
            title="No applications yet"
            description="You haven't applied to any projects. Browse the marketplace to find exciting opportunities."
            actionLabel="Find Work"
            actionHref="/freelancer/projects"
          />
        )}
      </div>
    </div>
  )
}
