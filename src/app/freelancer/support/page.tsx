"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, MessageCircle, HelpCircle, FileText, Send, ChevronRight } from 'lucide-react'

export default function SupportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Normal'
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setTickets(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !formData.subject || !formData.description) return

    setIsSubmitting(true)
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        status: 'Open'
      })

    setIsSubmitting(false)
    if (error) {
      alert("Failed to submit ticket")
    } else {
      setFormData({ subject: '', description: '', priority: 'Normal' })
      fetchTickets() // Refresh the list
    }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center bg-gray-50/50"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
  }

  const faqs = [
    { q: "How do I withdraw my earnings?", a: "You can withdraw your earnings via Settings > Payments. We support direct bank transfer, PayPal, and Payoneer." },
    { q: "How do I dispute a contract?", a: "Navigate to your contract details and click on 'File a Dispute'. Our mediation team will contact both parties within 24 hours." },
    { q: "Can I change my username?", a: "Usernames can be changed once every 30 days in Account Settings." }
  ]

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Help & Support</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Contact Support</h2>
              </div>
              <p className="text-gray-500 mb-6">Need help? Submit a ticket and our team will get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-sm"
                  >
                    <option value="Low">Low - General question</option>
                    <option value="Normal">Normal - Standard issue</option>
                    <option value="High">High - Urgent or critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide as much detail as possible..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition text-sm resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition shadow-sm flex items-center disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>

            {/* Previous Tickets */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Your Tickets</h2>
              {tickets.length === 0 ? (
                <p className="text-gray-500 italic text-sm text-center py-8 bg-gray-50 rounded-xl">No support tickets found.</p>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 border border-gray-100 rounded-2xl hover:border-teal-200 transition bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-1">{ticket.description}</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        <span>{ticket.priority} Priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-teal-600 rounded-3xl p-8 text-white shadow-sm">
              <HelpCircle className="w-8 h-8 mb-4 text-teal-200" />
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-teal-100 text-sm mb-6">Need immediate assistance? Our support team is online.</p>
              <button className="w-full py-3 bg-white text-teal-700 rounded-xl font-medium hover:bg-teal-50 transition shadow-sm">
                Start Chat
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold">Popular FAQs</h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="group">
                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-gray-800 hover:text-teal-600 transition">
                      {faq.q}
                      <span className="transition group-open:rotate-90">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </span>
                    </summary>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed pl-2 border-l-2 border-teal-100">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
