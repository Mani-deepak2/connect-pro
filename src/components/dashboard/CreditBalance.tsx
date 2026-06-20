"use client"

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { getUserCredits } from '@/app/actions/credits'
import { createClient } from '@/utils/supabase/client'

export function CreditBalance() {
  const [balance, setBalance] = useState<number | null>(null)
  const supabase = createClient()

  const fetchCredits = async () => {
    try {
      const credits = await getUserCredits()
      setBalance(credits)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchCredits()

    // Optionally set up a realtime subscription if credits update frequently
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('public:credits')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setBalance(payload.new.balance)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [])

  if (balance === null) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 shadow-sm cursor-pointer hover:bg-yellow-100 transition-colors" title="Your Credits">
      <Coins className="w-4 h-4 text-yellow-600" />
      <span className="text-sm font-bold">{balance}</span>
    </div>
  )
}
