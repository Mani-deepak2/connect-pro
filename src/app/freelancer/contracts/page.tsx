"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, ArrowLeft, Loader2, DollarSign, FileText } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function FreelancerContracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('contracts')
      .select(`
        *,
        project:projects(title),
        client:client_profiles(company_name)
      `)
      .eq('freelancer_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setContracts(data)
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/freelancer/dashboard" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">My Contracts</h1>
          <p className="text-[#5B5E68]">Manage your active and completed contracts.</p>
        </header>

        {contracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <div key={contract.id} className="bg-white border border-[#ECEAE5] rounded-3xl p-6 flex flex-col h-full shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-display font-bold text-[#15171C] leading-tight">{contract.project?.title || 'Unknown Project'}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    contract.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    contract.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {contract.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center text-[#5B5E68] text-sm">
                    <FileText className="w-4 h-4 mr-2 text-[#8A8D96]" />
                    Client: <span className="text-[#15171C] ml-1 font-medium">{contract.client?.company_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center text-[#5B5E68] text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                    Amount: <span className="text-[#15171C] ml-1 font-bold">${contract.amount}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECEAE5] mt-auto flex justify-end gap-4">
                   <Link href="/messages" className="text-sm font-semibold text-[#5B5E68] hover:text-[#15171C] transition-colors flex items-center">
                     Message
                   </Link>
                   <Link href={`/freelancer/contracts/${contract.id}`} className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center">
                     Manage Contract &rarr;
                   </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Briefcase}
            title="No contracts found"
            description="You don't have any active contracts yet. Start applying to projects to land a contract."
            actionLabel="Find Work"
            actionHref="/freelancer/projects"
          />
        )}
      </div>
    </div>
  )
}
