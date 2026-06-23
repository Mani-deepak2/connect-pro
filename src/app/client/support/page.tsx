"use client"
import { useState } from 'react'
import { HelpCircle, Search, MessageSquare, BookOpen, FileText, ChevronRight, X, Send, Bot } from 'lucide-react'

const FAQ_ITEMS = [
  { q: "How do I invite a freelancer to a project?", a: "Navigate to the 'Find Talent' tab, search for your ideal candidate, and click 'Invite'. You can select any of your open projects to invite them to." },
  { q: "What is the fee structure for clients?", a: "We charge a standard 3% payment processing fee on all funded milestones and hourly contracts." },
  { q: "How does the refund process work?", a: "If a milestone is not met or a contract is cancelled, the funds currently in escrow will be refunded to your original payment method within 3-5 business days." },
  { q: "Can I manage multiple companies?", a: "Yes, you can create multiple company profiles under one account by going to Settings > Account > Add Company." }
]

const TICKETS = [
  { id: 'TKT-1029', subject: 'Dispute over Milestone 2 Delivery', status: 'In Review', updated: '2 hours ago' },
  { id: 'TKT-1028', subject: 'Need help increasing account spending limit', status: 'Resolved', updated: 'Yesterday' }
]

export default function HelpSupport() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50 relative">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Help & Support</h1>
        <p className="text-gray-500">Find answers in our knowledge base or contact our support team.</p>
      </header>

      {/* Hero Search */}
      <div className="bg-teal-600 rounded-3xl p-8 md:p-12 text-center shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-full blur-3xl opacity-50 translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">How can we help you today?</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search for articles, guides, and FAQs..."
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl text-base shadow-sm focus:outline-none focus:ring-4 focus:ring-white/20 transition-all text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Links & Tickets */}
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Knowledge Base</h3>
              <p className="text-xs text-gray-500">Read detailed guides</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Billing Guides</h3>
              <p className="text-xs text-gray-500">Payments & invoices</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Your Support Tickets</h3>
              <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</button>
            </div>
            
            <div className="space-y-4">
              {TICKETS.map(ticket => (
                <div key={ticket.id} className="p-4 border border-gray-100 rounded-2xl hover:border-teal-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-teal-600">{ticket.subject}</h4>
                  <p className="text-xs text-gray-400">Updated {ticket.updated}</p>
                </div>
              ))}
              <button className="w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm">
                Open New Ticket
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: FAQs */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-full">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-5 h-5 text-teal-600 mr-2" />
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="p-5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 pr-8">{item.q}</h4>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-teal-900 mb-1">Still need help?</h4>
                <p className="text-sm text-teal-700">Our support team is available 24/7 to assist you.</p>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-500/20 whitespace-nowrap"
              >
                Chat with us
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating AI Chatbot Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl shadow-gray-900/20 flex items-center justify-center hover:scale-105 transition-transform z-40 ${isChatOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* AI Chatbot Window */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Connect AI Support</h3>
                <p className="text-[10px] text-gray-300">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-80 p-4 bg-[#f8fafc] overflow-y-auto flex flex-col gap-4">
            <div className="self-start max-w-[80%]">
              <div className="bg-white border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                Hello! I'm your AI assistant. How can I help you today?
              </div>
            </div>
            <div className="self-start max-w-[80%]">
              <div className="bg-white border border-gray-200 text-gray-900 text-sm px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-2">
                <p className="font-medium text-xs text-gray-500 uppercase">Suggested topics:</p>
                <button className="text-left text-teal-600 hover:text-teal-700 hover:underline">Billing issues</button>
                <button className="text-left text-teal-600 hover:text-teal-700 hover:underline">Contract disputes</button>
                <button className="text-left text-teal-600 hover:text-teal-700 hover:underline">Account limits</button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900"
            />
            <button className="w-9 h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
