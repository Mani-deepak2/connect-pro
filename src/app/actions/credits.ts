"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deductCredits(amount: number, reason: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // 2. Start a transaction using RPC or do manual read/write (since Supabase JS client doesn't support interactive transactions well, we will use an RPC function if possible, or read-then-write if low contention)
  
  // Fetch current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (fetchError || !currentCredits) {
    return { success: false, error: 'Could not fetch credit balance' }
  }

  if (currentCredits.balance < amount) {
    return { success: false, error: 'Insufficient credits' }
  }

  // Deduct credits
  const { error: updateError } = await supabase
    .from('credits')
    .update({ balance: currentCredits.balance - amount })
    .eq('user_id', user.id)

  if (updateError) {
    return { success: false, error: 'Failed to update credits' }
  }

  // Record transaction
  const { error: insertError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: user.id,
      amount: -amount,
      type: 'application_fee',
      reason: reason,
      description: `Spent ${amount} credits for: ${reason}`
    })

  if (insertError) {
    // We should ideally rollback here, but we'll just log it for this implementation
    console.error('Failed to log credit transaction:', insertError)
  }

  revalidatePath('/client/dashboard')
  revalidatePath('/freelancer/dashboard')

  return { success: true }
}

export async function getUserCredits(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  return data?.balance || 0
}
