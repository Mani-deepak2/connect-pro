"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Search, MoreVertical, Shield, ShieldOff, CheckCircle2, User, Loader2, XCircle, Ban, CreditCard, ArrowUpDown } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [managingCreditsFor, setManagingCreditsFor] = useState<string | null>(null)
  const [creditAmount, setCreditAmount] = useState<number>(50)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*, credits(balance)')
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (data) setUsers(data)
    setIsLoading(false)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    setSelectedUser(null)
    fetchUsers()
  }

  const handleGrantCredits = async () => {
    if (!managingCreditsFor) return
    const userId = managingCreditsFor
    
    // Fetch current
    const { data: current } = await supabase.from('credits').select('balance').eq('user_id', userId).single()
    const newBalance = (current?.balance || 0) + creditAmount
    
    await supabase.from('credits').upsert({ user_id: userId, balance: newBalance })
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: creditAmount,
      type: 'purchase',
      reason: 'Admin Granted Credits'
    })
    
    setManagingCreditsFor(null)
    fetchUsers()
  }

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.role?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const roleBadge: Record<string, string> = {
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    freelancer: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    client: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-[#6B7A90] text-sm mt-1">View and manage all registered users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4A5C]" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 pl-9 pr-4 py-2 bg-[#0D1117] border border-[#1B2232] rounded-lg text-sm text-[#C8CFD8] placeholder-[#3D4A5C] focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
          <span className="text-xs text-[#6B7A90] bg-[#0D1117] border border-[#1B2232] rounded-lg px-3 py-2 font-mono">
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      <div className="bg-[#0D1117] border border-[#1B2232] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#3D4A5C] text-[10px] uppercase tracking-widest border-b border-[#1B2232]">
                  <th className="text-left px-5 py-3.5 font-semibold">User</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Role</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Joined</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Credits</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#1B2232]/50 hover:bg-[#131720] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-[#1B2232] flex items-center justify-center">
                          <span className="text-cyan-400 text-xs font-bold">{(user.email || '?').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{user.email}</div>
                          <div className="text-[#3D4A5C] text-[10px] font-mono">{user.id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${roleBadge[user.role] || 'text-[#6B7A90] bg-[#131720] border-[#1B2232]'}`}>
                        {user.role || 'unset'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B7A90] text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-yellow-500 font-mono font-bold bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                        {user.credits?.[0]?.balance || user.credits?.balance || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Active
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button 
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg hover:bg-[#1B2232] transition-colors text-[#6B7A90] hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {selectedUser === user.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-[#131720] border border-[#1B2232] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                            {user.role !== 'admin' && (
                              <button 
                                onClick={() => handleUpdateRole(user.id, 'admin')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[#1B2232] flex items-center gap-2 text-purple-400"
                              >
                                <Shield className="w-3.5 h-3.5" /> Make Admin
                              </button>
                            )}
                            {user.role !== 'freelancer' && (
                              <button 
                                onClick={() => handleUpdateRole(user.id, 'freelancer')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[#1B2232] flex items-center gap-2 text-cyan-400"
                              >
                                <User className="w-3.5 h-3.5" /> Set Freelancer
                              </button>
                            )}
                            {user.role !== 'client' && (
                              <button 
                                onClick={() => handleUpdateRole(user.id, 'client')}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-[#1B2232] flex items-center gap-2 text-emerald-400"
                              >
                                <User className="w-3.5 h-3.5" /> Set Client
                              </button>
                            )}
                            <div className="border-t border-[#1B2232] my-1"></div>
                            <button 
                              onClick={() => { setSelectedUser(null); setManagingCreditsFor(user.id); }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-[#1B2232] flex items-center gap-2 text-yellow-400"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Manage Credits
                            </button>
                            <div className="border-t border-[#1B2232] my-1"></div>
                            <button className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 flex items-center gap-2 text-red-400">
                              <Ban className="w-3.5 h-3.5" /> Suspend User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {managingCreditsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0D1117] border border-[#1B2232] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Grant Credits</h3>
            <p className="text-sm text-[#6B7A90] mb-4">Add credits to the user's account manually.</p>
            
            <label className="block text-xs font-medium text-[#6B7A90] mb-2 uppercase tracking-wider">Amount</label>
            <input 
              type="number" 
              value={creditAmount}
              onChange={(e) => setCreditAmount(Number(e.target.value))}
              className="w-full bg-[#131720] border border-[#1B2232] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 mb-6"
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setManagingCreditsFor(null)}
                className="flex-1 py-3 px-4 bg-[#131720] hover:bg-[#1B2232] text-white rounded-xl transition-colors font-medium border border-[#1B2232]"
              >
                Cancel
              </button>
              <button 
                onClick={handleGrantCredits}
                className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 rounded-xl transition-colors font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]"
              >
                Grant Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
