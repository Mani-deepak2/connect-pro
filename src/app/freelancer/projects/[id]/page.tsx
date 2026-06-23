"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Clock, DollarSign, Briefcase, Calendar, CheckCircle } from 'lucide-react'
import { Project } from '@/types'
import { useForm } from 'react-hook-form'

interface ApplicationFormData {
  proposal: string;
  bid_amount: number;
  estimated_delivery_days: number;
}

export default function ProjectDetails() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  
  const [project, setProject] = useState<Project | null>(null)
  const [clientProfile, setClientProfile] = useState<any>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creditError, setCreditError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>()

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
      .single()

    if (projectData) {
      setProject(projectData as Project)
      // Fetch client info
      const { data: cData } = await supabase.from('client_profiles').select('*').eq('user_id', projectData.client_id).single()
      if (cData) setClientProfile(cData)
    }

    // Check if applied
    const { data: appData } = await supabase
      .from('applications')
      .select('id')
      .eq('project_id', id)
      .eq('freelancer_id', user.id)
      .single()

    if (appData) setHasApplied(true)
    
    setIsLoading(false)
  }

  const onSubmitApplication = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    setCreditError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check credits
    const { data: creditData } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    if (!creditData || creditData.balance < 2) {
      setCreditError("You don't have enough credits to apply (2 required). Please purchase more credits.")
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('applications').insert({
      project_id: id,
      freelancer_id: user.id,
      proposal: data.proposal,
      bid_amount: data.bid_amount,
      estimated_delivery_days: data.estimated_delivery_days,
      status: 'pending'
    })

    if (!error) {
      // Deduct 2 credits
      await supabase.from('credits').update({ balance: creditData.balance - 2 }).eq('user_id', user.id)
      await supabase.from('credit_transactions').insert({
        user_id: user.id,
        amount: -2,
        type: 'application_fee',
        description: `Applied to project: ${project?.title}`
      })
      setHasApplied(true)
    }
    setIsSubmitting(false)
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
        <Link href="/freelancer/projects" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">{project.title}</h1>
              <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm font-medium mb-6">
                {project.category}
              </span>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-white mb-2">Project Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.required_skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Application Form */}
            {!hasApplied && project.status === 'open' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mt-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Submit a Proposal</h3>
                  <span className="text-sm font-medium text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">Cost: 2 Credits</span>
                </div>
                
                {creditError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                    {creditError}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmitApplication)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Bid Amount ($)</label>
                      <input 
                        type="number"
                        {...register('bid_amount', { required: 'Required', min: 1 })}
                        className="w-full bg-[#15171C] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50"
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Estimated Delivery (Days)</label>
                      <input 
                        type="number"
                        {...register('estimated_delivery_days', { required: 'Required', min: 1 })}
                        className="w-full bg-[#15171C] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50"
                        placeholder="e.g. 7"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Cover Letter</label>
                    <textarea 
                      {...register('proposal', { required: 'Required', minLength: 50 })}
                      className="w-full bg-[#15171C] border border-white/10 rounded-xl py-3 px-4 text-white h-40 resize-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="Why are you the best fit for this project?"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl transition-colors font-medium flex items-center justify-center disabled:opacity-50 shadow-lg shadow-purple-500/20"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                    Submit Proposal
                  </button>
                </form>
              </div>
            )}
            
            {hasApplied && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 mt-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Proposal Submitted</h3>
                <p className="text-gray-400 max-w-md">You have successfully applied for this project. The client will review your proposal and get back to you.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Project Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Budget</p>
                    <p className="text-white font-medium">
                      {project.budget_type === 'fixed' ? `$${project.budget_amount} Fixed` : `$${project.budget_amount}/hr`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Duration</p>
                    <p className="text-white font-medium">{project.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Experience Level</p>
                    <p className="text-white font-medium capitalize">{project.experience_level}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Deadline</p>
                    <p className="text-white font-medium">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">About the Client</h3>
              {clientProfile ? (
                <div>
                  <h4 className="text-white font-medium text-lg mb-1">{clientProfile.company_name}</h4>
                  <p className="text-gray-400 text-sm mb-4">{clientProfile.industry}</p>
                  <p className="text-gray-300 text-sm">{clientProfile.company_description}</p>
                </div>
              ) : (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/3"></div>
                  <div className="h-16 bg-white/10 rounded w-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
