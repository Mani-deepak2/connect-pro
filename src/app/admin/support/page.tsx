"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { HeadphonesIcon, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react'

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('support_tickets')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setTickets(data)
    setIsLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    fetchTickets()
  }

  const priorityBadge: Record<string, string> = {
    Low: 'text-[#6B7A90] bg-[#131720]',
    Normal: 'text-cyan-400 bg-cyan-500/10',
    High: 'text-amber-400 bg-amber-500/10',
    Critical: 'text-red-400 bg-red-500/10',
  }

  const statusIcon: Record<string, any> = {
    Open: <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />,
    Pending: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    Resolved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    Closed: <CheckCircle2 className="w-3.5 h-3.5 text-[#3D4A5C]" />,
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-[#6B7A90] text-sm mt-1">AI-escalated and user-submitted support requests.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: tickets.filter(t => t.status === 'Open').length, color: 'cyan' },
          { label: 'Pending', count: tickets.filter(t => t.status === 'Pending').length, color: 'amber' },
          { label: 'Resolved', count: tickets.filter(t => t.status === 'Resolved').length, color: 'emerald' },
          { label: 'Closed', count: tickets.filter(t => t.status === 'Closed').length, color: 'gray' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#1B2232] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold text-${s.color}-400`}>{s.count}</p>
            <p className="text-[#6B7A90] text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <HeadphonesIcon className="w-12 h-12 text-[#1B2232] mx-auto mb-3" />
            <p className="text-[#6B7A90] text-sm">No support tickets yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#3D4A5C] text-[10px] uppercase tracking-widest border-b border-[#1B2232]">
                  <th className="text-left px-5 py-3.5 font-semibold">Ticket</th>
                  <th className="text-left px-5 py-3.5 font-semibold">User</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Priority</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[#1B2232]/50 hover:bg-[#131720] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-xs font-medium truncate max-w-[200px]">{ticket.issue}</p>
                      <p className="text-[#3D4A5C] text-[10px] font-mono mt-0.5">{ticket.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-5 py-4 text-[#6B7A90] text-xs">{ticket.users?.email || 'Unknown'}</td>
                    <td className="px-5 py-4 text-[#6B7A90] text-xs">{ticket.category}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityBadge[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        {statusIcon[ticket.status]}
                        <span className="text-[#C8CFD8]">{ticket.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select 
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="bg-[#131720] border border-[#1B2232] text-[#C8CFD8] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/40"
                      >
                        <option value="Open">Open</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
