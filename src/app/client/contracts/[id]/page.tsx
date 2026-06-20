"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, ExternalLink, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { ReviewModal } from '@/components/contracts/ReviewModal'

export default function ClientContractDetails({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Action states
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContractDetails()
  }, [])

  const fetchContractDetails = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: contractData } = await supabase
      .from('contracts')
      .select(`
        *,
        project:projects(title, description),
        freelancer:freelancer_profiles(full_name, profile_image)
      `)
      .eq('id', params.id)
      .eq('client_id', user.id)
      .single()

    if (contractData) {
      setContract(contractData)
      const { data: subs } = await supabase
        .from('work_submissions')
        .select('*')
        .eq('contract_id', params.id)
        .order('created_at', { ascending: false })
      
      if (subs) setSubmissions(subs)
    }
    
    setIsLoading(false)
  }

  const handleRequestRevision = async (submissionId: string) => {
    if (!feedback) return alert('Please provide feedback for the revision.')
    setIsProcessing(true)
    
    await supabase
      .from('work_submissions')
      .update({ status: 'revision_requested', client_feedback: feedback })
      .eq('id', submissionId)

    setFeedback('')
    setActiveSubmissionId(null)
    fetchContractDetails()
    setIsProcessing(false)
  }

  const handleDispute = async (submissionId: string) => {
    if (!confirm('Are you sure you want to open a dispute? An admin will review the case.')) return
    setIsProcessing(true)
    
    await supabase
      .from('work_submissions')
      .update({ status: 'disputed' })
      .eq('id', submissionId)

    await supabase.from('contracts').update({ status: 'disputed' }).eq('id', contract.id)

    fetchContractDetails()
    setIsProcessing(false)
  }

  const handleApproveAndPay = async (submissionId: string) => {
    if (!confirm('Are you sure you want to approve this work and release payment? This cannot be undone.')) return
    
    setIsProcessing(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Mark submission as approved
    await supabase.from('work_submissions').update({ status: 'approved' }).eq('id', submissionId)
    
    // 2. Calculate fees (10% platform fee)
    const totalAmount = contract.amount
    const platformFee = totalAmount * 0.10
    const freelancerPayout = totalAmount - platformFee

    // 3. Create payment record
    await supabase.from('payments').insert({
      contract_id: contract.id,
      client_id: user?.id,
      freelancer_id: contract.freelancer_id,
      amount: totalAmount,
      platform_fee: platformFee,
      freelancer_payout: freelancerPayout,
      status: 'completed'
    })

    // 4. Update contract status
    await supabase.from('contracts').update({ status: 'completed' }).eq('id', contract.id)

    fetchContractDetails()
    setIsProcessing(false)
    setShowReviewModal(true) // Open review modal immediately after payment
  }

  if (isLoading) return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" /></div>
  if (!contract) return <div className="min-h-screen bg-[#F7F6F3] py-10 px-6 text-center">Contract not found</div>

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/client/contracts" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Contracts
        </Link>
        
        {/* Contract Header */}
        <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">{contract.project?.title}</h1>
              <p className="text-[#5B5E68] font-medium flex items-center gap-2">
                Freelancer: <span className="text-[#15171C] font-bold">{contract.freelancer?.full_name}</span>
              </p>
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
              <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-[#15171C]">${contract.amount}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-1">Started</p>
              <p className="text-lg font-semibold text-[#15171C]">{new Date(contract.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Work Submissions */}
        <h2 className="text-xl font-display font-bold text-[#15171C] mb-4">Work Submissions</h2>
        {submissions.length === 0 ? (
          <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 text-center shadow-sm">
             <AlertCircle className="w-8 h-8 mx-auto mb-3 text-[#8A8D96]" />
             <p className="text-[#5B5E68]">Waiting for the freelancer to submit their work...</p>
          </div>
        ) : (
          <div className="space-y-6">
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
                    'bg-blue-50 text-[#2563EB] border border-[#2563EB]/20'
                  }`}>
                    {sub.status === 'pending' ? 'NEEDS REVIEW' : sub.status.toUpperCase()}
                  </span>
                </div>
                
                <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-[#F7F6F3] rounded-lg text-[#2563EB] hover:bg-[#ECEAE5] transition-colors font-medium mb-6 border border-[#ECEAE5]">
                  View Submitted Work <ExternalLink className="w-4 h-4 ml-2" />
                </a>

                {sub.notes && (
                  <div className="mb-6">
                    <p className="text-sm font-bold text-[#8A8D96] uppercase tracking-wider mb-2">Freelancer Notes</p>
                    <p className="text-[#15171C] text-sm bg-[#F7F6F3] p-4 rounded-2xl border border-[#ECEAE5]">{sub.notes}</p>
                  </div>
                )}

                {/* Actions for Pending Submissions */}
                {sub.status === 'pending' && contract.status === 'active' && (
                  <div className="border-t border-[#ECEAE5] pt-6">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleDispute(sub.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-white border-2 border-red-500 text-red-500 font-bold py-3 px-4 rounded-full hover:bg-red-50 transition-colors"
                      >
                        Open Dispute
                      </button>
                      <button 
                        onClick={() => setActiveSubmissionId(activeSubmissionId === sub.id ? null : sub.id)}
                        className="flex-1 bg-white border-2 border-[#15171C] text-[#15171C] font-bold py-3 px-4 rounded-full hover:bg-[#F7F6F3] transition-colors"
                      >
                        Request Revision
                      </button>
                      <button 
                        onClick={() => handleApproveAndPay(sub.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center shadow-lg shadow-emerald-500/20"
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><DollarSign className="w-5 h-5 mr-1" /> Approve & Release Payment</>}
                      </button>
                    </div>

                    {/* Revision Feedback Form */}
                    {activeSubmissionId === sub.id && (
                      <div className="mt-4 bg-[#F7F6F3] p-4 rounded-2xl border border-[#ECEAE5]">
                        <label className="block text-sm font-semibold text-[#15171C] mb-2">What needs to be changed?</label>
                        <textarea 
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          className="w-full bg-white border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] mb-3 h-24 resize-none"
                          placeholder="Please adjust the header layout to..."
                        />
                        <button 
                          onClick={() => handleRequestRevision(sub.id)}
                          disabled={isProcessing || !feedback}
                          className="w-full bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
                        >
                          Submit Revision Request
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {sub.client_feedback && sub.status === 'revision_requested' && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mt-4">
                    <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Your Feedback</p>
                    <p className="text-orange-900 text-sm">{sub.client_feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal 
          contractId={contract.id} 
          revieweeId={contract.freelancer_id} 
          onClose={() => setShowReviewModal(false)} 
        />
      )}
    </div>
  )
}
