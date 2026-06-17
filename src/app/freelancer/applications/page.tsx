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
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/freelancer/dashboard" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">My Applications</h1>
          <p className="text-[#5B5E68]">Track the status of your submitted proposals</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white border border-[#ECEAE5] rounded-3xl p-6 transition-all hover:shadow-md hover:border-[#2563EB]/20 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/freelancer/projects/${app.project_id}`} className="hover:underline">
                      <h3 className="text-lg font-display font-bold text-[#15171C] mb-1 hover:text-[#2563EB] transition-colors">
                        {app.project?.title || 'Unknown Project'}
                      </h3>
                    </Link>
                    <p className="text-sm text-[#8A8D96] font-medium">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      app.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                      app.status === 'shortlisted' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-[#F7F6F3] text-[#5B5E68] border border-[#ECEAE5]'
                    }`}>
                      {app.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex gap-6 mb-4">
                  <div className="flex items-center text-sm font-semibold text-[#15171C]">
                    <DollarSign className="w-4 h-4 mr-1 text-emerald-500" />
                    Bid: ${app.bid_amount}
                  </div>
                  <div className="flex items-center text-sm font-medium text-[#5B5E68]">
                    <Clock className="w-4 h-4 mr-1 text-[#2563EB]" />
                    Delivery: {app.estimated_delivery_days} days
                  </div>
                </div>

                <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#ECEAE5]">
                  <h4 className="text-xs font-bold text-[#8A8D96] mb-2 uppercase tracking-wider">Your Proposal</h4>
                  <p className="text-sm text-[#5B5E68] line-clamp-2">{app.proposal}</p>
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
