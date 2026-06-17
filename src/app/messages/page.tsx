"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Loader2, User as UserIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function MessagesInbox() {
  const [conversations, setConversations] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Get user role
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role
    setUserRole(role)

    // Fetch conversations with joined data
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        project:projects(title),
        client:client_profiles(company_name),
        freelancer:freelancer_profiles(full_name, profile_image)
      `)
      .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (data) setConversations(data)
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Messages</h1>
          <p className="text-[#5B5E68]">Chat with your clients and freelancers.</p>
        </header>

        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const otherPerson = userRole === 'client'
                ? conv.freelancer?.full_name || 'Unknown Freelancer'
                : conv.client?.company_name || 'Unknown Client'
              const avatar = conv.freelancer?.profile_image

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-center gap-5 bg-white hover:bg-[#F7F6F3] border border-[#ECEAE5] hover:border-[#2563EB]/30 rounded-3xl p-5 transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EEF3FF] flex items-center justify-center shrink-0 overflow-hidden border border-[#ECEAE5]">
                    {avatar
                      ? <img src={avatar} alt="" className="w-full h-full object-cover" />
                      : <UserIcon className="w-6 h-6 text-[#2563EB]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#15171C] font-display font-bold truncate">{otherPerson}</p>
                    <p className="text-[#5B5E68] text-sm truncate">Re: {conv.project?.title || 'Project'}</p>
                  </div>
                  <span className="text-[#8A8D96] group-hover:text-[#5B5E68] text-sm font-medium shrink-0">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Messages appear here once a client hires a freelancer. Apply to projects or post a project to get started."
          />
        )}
      </div>
    </div>
  )
}
