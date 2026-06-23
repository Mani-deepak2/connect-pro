import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EarningsMetricsCards } from '@/components/dashboard/EarningsMetricsCards'
import { EarningsHistoryTable } from '@/components/dashboard/EarningsHistoryTable'
import { Wallet } from 'lucide-react'

export const metadata = {
  title: 'Earnings | ConnectPro',
}

export default async function FreelancerEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all payments for this freelancer
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching payments:", error)
  }

  // Calculate metrics
  let totalEarnings = 0;
  let pendingClearance = 0;
  let availableForWithdrawal = 0;

  if (payments && payments.length > 0) {
    payments.forEach(payment => {
      // In this system, freelancer_payout is their cut
      if (payment.status === 'completed') {
        totalEarnings += Number(payment.freelancer_payout);
        availableForWithdrawal += Number(payment.freelancer_payout);
      } else if (payment.status === 'pending') {
        pendingClearance += Number(payment.freelancer_payout);
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#15171C] flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#2563EB]" />
            Earnings
          </h1>
          <p className="text-[#5B5E68] mt-1">
            Track your payments, pending clearance, and transaction history.
          </p>
        </div>
        
        <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#15171C] border border-[#ECEAE5] bg-white hover:bg-[#F7F6F3] transition-colors shadow-sm">
          Download Statement
        </button>
      </div>

      {/* Metrics Section */}
      <EarningsMetricsCards 
        totalEarnings={totalEarnings} 
        pendingClearance={pendingClearance} 
        availableForWithdrawal={availableForWithdrawal} 
      />

      {/* History Table */}
      <EarningsHistoryTable payments={payments || []} />
    </div>
  )
}
