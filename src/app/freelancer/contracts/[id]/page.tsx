"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Upload, ExternalLink, CheckCircle } from 'lucide-react'

export default function FreelancerContractDetails({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Submit Work form state
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContractDetails()
  }, [])

  const fetchContractDetails = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Fetch contract
    const { data: contractData } = await supabase
      .from('contracts')
      .select(`
        *,
        project:projects(title, description),
        client:client_profiles(company_name, logo)
      `)
      .eq('id', params.id)
      .eq('freelancer_id', user.id)
      .single()

    if (contractData) {
      setContract(contractData)
      // Fetch submissions for this contract
      const { data: subs } = await supabase
        .from('work_submissions')
        .select('*')
        .eq('contract_id', params.id)
        .order('created_at', { ascending: false })
      
      if (subs) setSubmissions(subs)
    }
    
    setIsLoading(false)
  }

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase
      .from('work_submissions')
      .insert({
        contract_id: contract.id,
        freelancer_id: user.id,
        submission_url: submissionUrl,
        notes: notes
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSubmissionUrl('')
      setNotes('')
      fetchContractDetails()
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
    </div>
  }

  if (!contract) {
    return <div className="min-h-screen bg-[#F7F6F3] py-10 px-6 text-center">Contract not found</div>
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/freelancer/contracts" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contracts
        </Link>
        
        <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">{contract.project?.title}</h1>
              <p className="text-[#5B5E68] font-medium">Client: {contract.client?.company_name}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold shrink-0 ${
              contract.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
              contract.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
              'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {contract.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-6 p-6 bg-[#F7F6F3] rounded-2xl border border-[#ECEAE5]">
            <div>
              <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-1">Amount</p>
              <p className="text-2xl font-bold text-[#15171C]">${contract.amount}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-1">Started</p>
              <p className="text-lg font-semibold text-[#15171C]">{new Date(contract.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Submit Work Section */}
        {contract.status === 'active' && (
          <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 mb-8 shadow-sm">
            <h2 className="text-xl font-display font-bold text-[#15171C] mb-6 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-[#2563EB]" /> Submit Work
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#15171C] mb-2">Work URL (Google Drive, Figma, GitHub, etc.)</label>
                <input 
                  type="url"
                  required
                  value={submissionUrl}
                  onChange={e => setSubmissionUrl(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#15171C] mb-2">Notes for Client</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all h-24 resize-none"
                  placeholder="Explain what you have completed..."
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center disabled:opacity-50 shadow-md"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Work
              </button>
            </form>
          </div>
        )}

        {/* Previous Submissions */}
        {submissions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-[#15171C] mb-4">Submission History</h2>
            {submissions.map((sub, i) => (
              <div key={sub.id} className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#15171C]">Submission #{submissions.length - i}</span>
                    <span className="text-sm font-medium text-[#8A8D96]">{new Date(sub.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    sub.status === 'revision_requested' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    'bg-[#F7F6F3] text-[#5B5E68] border border-[#ECEAE5]'
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>
                
                <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#2563EB] hover:underline font-medium mb-4">
                  View Submitted Work <ExternalLink className="w-4 h-4 ml-1" />
                </a>

                {sub.notes && (
                  <div className="bg-[#F7F6F3] p-4 rounded-2xl border border-[#ECEAE5] mb-4">
                    <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-1">Your Notes</p>
                    <p className="text-[#15171C] text-sm">{sub.notes}</p>
                  </div>
                )}

                {sub.client_feedback && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Client Feedback</p>
                    <p className="text-orange-900 text-sm">{sub.client_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {contract.status === 'completed' && submissions.length === 0 && (
           <div className="bg-emerald-50 text-emerald-700 p-6 rounded-3xl border border-emerald-100 flex items-center shadow-sm">
             <CheckCircle className="w-6 h-6 mr-3 text-emerald-500" />
             <div>
               <h3 className="font-bold">Project Completed</h3>
               <p className="text-sm mt-1">Payment has been released and the contract is closed.</p>
             </div>
           </div>
        )}

      </div>
    </div>
  )
}
