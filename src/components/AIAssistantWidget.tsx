"use client"
import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, User, HeadphonesIcon, FileText } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

type Message = { id: string; role: 'user' | 'assistant'; content: string; options?: string[] }

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Hi! I am the ConnectPro AI Assistant. How can I help you today?',
      options: ['How do I apply for projects?', 'How do credits work?', 'How do I withdraw money?', 'Contact Human Support']
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate network delay
    setTimeout(async () => {
      const response = await processAIResponse(text)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1000)
  }

  // Very basic rule-based engine (to be replaced with OpenAI later)
  const processAIResponse = async (text: string): Promise<Message> => {
    const lower = text.toLowerCase()
    
    if (lower.includes('apply') || lower.includes('project')) {
      return {
        id: Date.now().toString(), role: 'assistant',
        content: 'To apply for a project, go to the "Projects" tab, find a project you like, and click "Submit Proposal". You will need Connect Credits to apply.'
      }
    }
    
    if (lower.includes('credit')) {
      return {
        id: Date.now().toString(), role: 'assistant',
        content: 'Credits are used to apply for jobs. Free users get a daily allowance. Pro users get more. You can also buy credits in Settings > Credits & Billing.'
      }
    }
    
    if (lower.includes('withdraw') || lower.includes('money') || lower.includes('pay')) {
      return {
        id: Date.now().toString(), role: 'assistant',
        content: 'You can withdraw funds from your Dashboard once a client releases the escrow payment. Payments are processed within 3-5 business days.'
      }
    }

    if (lower.includes('contact') || lower.includes('human') || lower.includes('support ticket')) {
      // Create a support ticket!
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('support_tickets').insert({
          user_id: user.id,
          category: 'General Inquiry',
          issue: 'User requested human support via AI Assistant.',
          priority: 'Normal'
        })
        return {
          id: Date.now().toString(), role: 'assistant',
          content: 'I have created a support ticket for you. Our human team will review it and get back to you shortly!'
        }
      } else {
        return {
          id: Date.now().toString(), role: 'assistant',
          content: 'You need to be logged in to create a support ticket.'
        }
      }
    }

    // Default fallback
    return {
      id: Date.now().toString(), role: 'assistant',
      content: 'I am not entirely sure about that. Would you like me to create a support ticket for our human team?',
      options: ['Create Support Ticket']
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white dark:bg-[#15171C] rounded-2xl shadow-2xl border border-[#ECEAE5] dark:border-[#2A2B32] overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-[#2563EB] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">ConnectPro Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F6F3] dark:bg-[#0A0A0A]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#2563EB] text-white rounded-br-none' 
                      : 'bg-white dark:bg-[#2A2B32] text-[#15171C] dark:text-white border border-[#ECEAE5] dark:border-transparent rounded-bl-none shadow-sm'
                  }`}>
                    <p>{msg.content}</p>
                    {msg.options && (
                      <div className="mt-3 flex flex-col gap-2">
                        {msg.options.map((opt) => (
                          <button 
                            key={opt}
                            onClick={() => handleSend(opt)}
                            className="text-xs bg-[#EEF3FF] dark:bg-[#15171C] text-[#2563EB] dark:text-blue-400 p-2 rounded-lg font-medium hover:bg-[#DDE7FF] transition-colors text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-[#2A2B32] border border-[#ECEAE5] dark:border-transparent rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#8A8D96] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#8A8D96] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#8A8D96] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-[#15171C] border-t border-[#ECEAE5] dark:border-[#2A2B32]">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(input) }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-[#F7F6F3] dark:bg-[#0A0A0A] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#2563EB] dark:text-white"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-[#2563EB] text-white p-2 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
