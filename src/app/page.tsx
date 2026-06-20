import { createClient } from '@/utils/supabase/server'
import ConnectProSite from '@/components/ConnectProSite'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    
    if (userData?.role === 'admin') {
      redirect('/admin')
    } else if (userData?.role === 'freelancer') {
      redirect('/freelancer/dashboard')
    } else if (userData?.role === 'client') {
      redirect('/client/dashboard')
    } else {
      redirect('/onboarding/role')
    }
  }

  return <ConnectProSite />
}
