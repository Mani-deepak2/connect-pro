"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function hireApplicant(applicationId: string, projectId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get current user (client)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // 2. Fetch application to ensure it exists and get freelancer_id and bid amount
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('freelancer_id, bid_amount')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    return { success: false, error: 'Application not found' }
  }

  // 3. Update application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (updateError) {
    return { success: false, error: 'Failed to update application status' }
  }

  // 4. Update project status to in_progress
  await supabase.from('projects').update({ status: 'in_progress' }).eq('id', projectId)

  // 5. Create Contract
  const { error: contractError } = await supabase
    .from('contracts')
    .insert({
      project_id: projectId,
      client_id: user.id,
      freelancer_id: application.freelancer_id,
      amount: application.bid_amount,
      status: 'active'
    })

  if (contractError) {
    console.error('Failed to create contract:', contractError)
    // Could manually rollback here, but for simplicity we log it
    return { success: false, error: 'Application accepted but contract creation failed' }
  }

  // 6. Create initial conversation (chat)
  await supabase.from('conversations').insert({
    project_id: projectId,
    client_id: user.id,
    freelancer_id: application.freelancer_id
  })

  revalidatePath(`/client/workspace/${projectId}`)

  return { success: true }
}
