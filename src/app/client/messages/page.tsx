"use client"
import { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Phone, Video, Paperclip, Send, Image as ImageIcon, Smile, Check, CheckCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchConversations()

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const channel = supabase.channel('messages_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          if (activeChat && payload.new.conversation_id === activeChat.id) {
            setMessages(prev => [...prev, payload.new])
            scrollToBottom()
          }
          fetchConversations() // Update last message & unread count
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
          if (activeChat && payload.new.conversation_id === activeChat.id) {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m))
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    setupRealtime()
  }, [activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Note: in a real complex app you'd fetch the latest message per conversation via a view/RPC.
    // We'll fetch conversations and messages separately.
    const { data: convs } = await supabase
      .from('conversations')
      .select('*, freelancer:users!conversations_freelancer_id_fkey(full_name, username), project:projects(title), messages(id, message, is_read, sender_id, created_at)')
      .eq('client_id', user.id)
      .order('updated_at', { ascending: false })

    if (convs) {
      const mappedConvs = convs.map((c: any) => {
        // Sort messages to get the latest
        const sortedMsgs = c.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []
        const latestMessage = sortedMsgs.length > 0 ? sortedMsgs[0] : null
        const unreadCount = sortedMsgs.filter((m: any) => !m.is_read && m.sender_id !== user.id).length

        return {
          id: c.id,
          name: c.freelancer?.full_name || c.freelancer?.username || 'Unknown Freelancer',
          role: 'Freelancer',
          project: c.project?.title || 'General Connection',
          lastMessage: latestMessage ? latestMessage.message : 'No messages yet...',
          time: latestMessage ? new Date(latestMessage.created_at).toLocaleDateString() : new Date(c.updated_at).toLocaleDateString(),
          unread: unreadCount,
          online: false,
          img: (c.freelancer?.full_name || c.freelancer?.username || 'U').charAt(0).toUpperCase(),
          bg: 'bg-teal-100',
          text: 'text-teal-700'
        }
      })
      setConversations(mappedConvs)
      
      if (!activeChat && mappedConvs.length > 0) {
        handleChatClick(mappedConvs[0])
      }
    }
    setIsLoading(false)
  }

  const fetchMessages = async (chatId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })

    if (msgs) {
      setMessages(msgs)
      scrollToBottom()

      // Mark as read
      const unreadIds = msgs.filter(m => !m.is_read && m.sender_id !== user.id).map(m => m.id)
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds)
        setConversations(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c))
      }
    }
  }

  const handleChatClick = (chat: any) => {
    setActiveChat(chat)
    fetchMessages(chat.id)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !activeChat || !userId) return
    
    setIsSending(true)
    const text = messageText
    setMessageText('')

    // Optimistic UI update
    const optimisticMsg = {
      id: Math.random().toString(),
      conversation_id: activeChat.id,
      sender_id: userId,
      message: text,
      is_read: false,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])
    scrollToBottom()

    const { error } = await supabase.from('messages').insert({
      conversation_id: activeChat.id,
      sender_id: userId,
      message: text
    })

    if (error) {
      console.error('Error sending message:', error)
      // Revert optimistic if error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setMessageText(text)
    } else {
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', activeChat.id)
      fetchConversations()
    }
    setIsSending(false)
  }

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full bg-white overflow-hidden">
      
      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/30 shrink-0">
        
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-gray-900"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No conversations found.</div>
          ) : filteredConversations.map((chat) => (
            <button 
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className={`w-full text-left p-4 flex gap-4 transition-colors border-b border-gray-50 ${
                activeChat?.id === chat.id ? 'bg-teal-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full ${chat.bg} ${chat.text} flex items-center justify-center font-bold text-lg`}>
                  {chat.img}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900 truncate pr-2">{chat.name}</h3>
                  <span className={`text-xs whitespace-nowrap ${chat.unread > 0 ? 'text-teal-600 font-bold' : 'text-gray-400'}`}>
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs text-teal-600 font-medium truncate mb-1">{chat.project}</p>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="hidden md:flex flex-1 flex-col h-full bg-white relative">
        
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${activeChat.bg} ${activeChat.text} flex items-center justify-center font-bold`}>
                  {activeChat.img}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                  <p className="text-xs text-gray-500">{activeChat.project}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500 text-sm">
                  Send a message to start the conversation!
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === userId
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                          <div className={`p-4 rounded-2xl ${
                            isMe 
                              ? 'bg-teal-600 text-white rounded-tr-sm shadow-sm shadow-teal-500/10' 
                              : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm shadow-sm'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-teal-500" /> : <Check className="w-3.5 h-3.5 text-gray-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <form onSubmit={sendMessage} className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                <button type="button" className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-xl hover:bg-white">
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea 
                  rows={1}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none max-h-32"
                  style={{ minHeight: '40px' }}
                />
                <button type="button" className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-xl hover:bg-white hidden sm:block">
                  <Smile className="w-5 h-5" />
                </button>
                <button 
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 text-gray-400">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <Send className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-600">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
