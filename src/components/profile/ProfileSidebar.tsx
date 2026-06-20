"use client"
import { useState, useEffect } from 'react'
import { Clock, MessageSquare, Briefcase, Zap, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function ProfileSidebar({ profile, stats }: { profile: any, stats: any }) {
  const [hasActiveContract, setHasActiveContract] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [checkingContract, setCheckingContract] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkContractAndOwnership()
  }, [profile])

  const checkContractAndOwnership = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !profile?.user_id) {
      setCheckingContract(false)
      return
    }

    // Check if viewer is the owner
    if (user.id === profile.user_id) {
      setIsOwner(true)
      setHasActiveContract(true) // Owners see their own contacts
      setCheckingContract(false)
      return
    }

    // Check if an active contract exists between the viewer (client) and the freelancer
    try {
      const { data: contract } = await supabase
        .from('contracts')
        .select('id')
        .eq('client_id', user.id)
        .eq('freelancer_id', profile.user_id)
        .in('status', ['active', 'completed'])
        .maybeSingle()

      setHasActiveContract(!!contract)
    } catch {}
    setCheckingContract(false)
  }

  // Contact info visible only with active contract
  const hasContacts = profile.github_link || profile.linkedin_link || profile.portfolio_link

  return (
    <div className="space-y-6">
      
      {/* Contact / Action Widget */}
      <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-display font-bold text-[#15171C] dark:text-white mb-4">
          Work with {profile.full_name?.split(' ')[0]}
        </h3>
        <button className="w-full bg-[#15171C] dark:bg-[#2563EB] hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-black/10 mb-3 flex items-center justify-center">
          <Briefcase className="w-5 h-5 mr-2" /> Hire Freelancer
        </button>
        <button className="w-full bg-white dark:bg-[#0A0A0A] border-2 border-[#ECEAE5] dark:border-[#2A2B32] hover:border-[#15171C] dark:hover:border-[#5B5E68] text-[#15171C] dark:text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center">
          <MessageSquare className="w-5 h-5 mr-2" /> Send Message
        </button>
      </div>

      {/* Contact Info Widget - Protected */}
      {hasContacts && (
        <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-[#15171C] dark:text-white">Contact Info</h3>
            {hasActiveContract 
              ? <Eye className="w-4 h-4 text-emerald-500" /> 
              : <Lock className="w-4 h-4 text-[#8A8D96]" />
            }
          </div>

          {!checkingContract && !hasActiveContract && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Contact details are visible only after a contract is accepted to prevent off-platform work.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {profile.portfolio_link && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8A8D96] w-20 flex-shrink-0">Website</span>
                {hasActiveContract
                  ? <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] dark:text-cyan-400 text-xs hover:underline truncate">{profile.portfolio_link.replace(/https?:\/\//, '')}</a>
                  : <span className="text-xs text-[#8A8D96] font-mono tracking-wider">••••••••••••</span>
                }
              </div>
            )}
            {profile.github_link && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8A8D96] w-20 flex-shrink-0">GitHub</span>
                {hasActiveContract
                  ? <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] dark:text-cyan-400 text-xs hover:underline truncate">{profile.github_link.replace(/https?:\/\//, '')}</a>
                  : <span className="text-xs text-[#8A8D96] font-mono tracking-wider">••••••••••••</span>
                }
              </div>
            )}
            {profile.linkedin_link && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8A8D96] w-20 flex-shrink-0">LinkedIn</span>
                {hasActiveContract
                  ? <a href={profile.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] dark:text-cyan-400 text-xs hover:underline truncate">{profile.linkedin_link.replace(/https?:\/\//, '')}</a>
                  : <span className="text-xs text-[#8A8D96] font-mono tracking-wider">••••••••••••</span>
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability Widget */}
      <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-[#15171C] dark:text-white">Current Status</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            profile.availability_status === 'Available Now' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
            profile.availability_status === 'Busy' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
            'bg-[#F7F6F3] dark:bg-[#2A2B32] text-[#5B5E68] dark:text-[#8A8D96]'
          }`}>
            {profile.availability_status || 'Open to Work'}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Zap className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /></div>
            <div>
              <p className="text-sm font-semibold text-[#15171C] dark:text-white">Response Time</p>
              <p className="text-xs text-[#5B5E68] dark:text-[#8A8D96]">Usually responds in 2 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
            <div>
              <p className="text-sm font-semibold text-[#15171C] dark:text-white">Last Active</p>
              <p className="text-xs text-[#5B5E68] dark:text-[#8A8D96]">Available Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Widget */}
      <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-[#15171C] dark:text-white mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-3">
            <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm">Projects Completed</span>
            <span className="font-bold text-[#15171C] dark:text-white">{stats?.projects_completed || 0}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-3">
            <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm">Total Reviews</span>
            <span className="font-bold text-[#15171C] dark:text-white">{stats?.total_reviews || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm">Average Rating</span>
            <span className="font-bold text-[#15171C] dark:text-white">{stats?.average_rating || '0.00'}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
