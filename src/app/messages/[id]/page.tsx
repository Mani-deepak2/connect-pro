"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, User as UserIcon } from 'lucide-react'

export default function ChatRoom() {
  const params = useParams()
  const convId = params?.id as string
  const router = useRouter()
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (convId) initChat()
  }, [convId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    // Fetch conversation
    const { data: convData } = await supabase
      .from('conversations')
      .select(`
        *,
        project:projects(title),
        client:client_profiles(company_name),
        freelancer:freelancer_profiles(full_name, profile_image)
      `)
      .eq('id', convId)
      .single()

    if (!convData) { router.push('/messages'); return }
    setConversation(convData)

    // Fetch messages
    const { data: msgsData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (msgsData) setMessages(msgsData)
    setIsLoading(false)

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', convId)
      .neq('sender_id', user.id)

    // Subscribe to new messages (realtime)
    const channel = supabase
      .channel(`conv-${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !currentUser) return
    setIsSending(true)
    const msg = newMessage.trim()
    setNewMessage('')

    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: currentUser.id,
      message: msg
    })
    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    </div>
  }

  const isClient = conversation?.client_id === currentUser?.id
  const otherPersonName = isClient
    ? conversation?.freelancer?.full_name || 'Freelancer'
    : conversation?.client?.company_name || 'Client'
  const otherPersonAvatar = conversation?.freelancer?.profile_image

  return (
    <div className="h-screen bg-[#0f1115] flex flex-col">
      {/* Header */}
      <header className="bg-[#15171c] border-b border-white/5 px-6 py-4 flex items-center gap-4 shrink-0">
        <Link href="/messages" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
          {otherPersonAvatar
            ? <img src={otherPersonAvatar} alt="" className="w-full h-full object-cover" />
            : <UserIcon className="w-5 h-5 text-purple-400" />
          }
        </div>
        <div>
          <p className="text-white font-semibold">{otherPersonName}</p>
          <p className="text-gray-500 text-xs">Re: {conversation?.project?.title}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUser?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                isOwn
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-white/10 text-gray-200 rounded-bl-sm'
              }`}>
                <p>{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-purple-300' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-[#15171c] border-t border-white/5 px-6 py-4 shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none max-h-32 overflow-y-auto"
            style={{ height: 'auto' }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white p-3 rounded-xl transition-colors shrink-0"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}
