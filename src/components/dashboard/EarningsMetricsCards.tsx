"use client";

import { DollarSign, Clock, CheckCircle2 } from "lucide-react";

interface MetricsProps {
  totalEarnings: number;
  pendingClearance: number;
  availableForWithdrawal: number;
}

export function EarningsMetricsCards({ totalEarnings, pendingClearance, availableForWithdrawal }: MetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Earnings Card */}
      <div className="rounded-2xl border border-[#ECEAE5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-semibold text-[#5B5E68] text-sm">Total Earnings</span>
        </div>
        <div className="font-display text-4xl font-bold text-[#15171C]">
          {formatCurrency(totalEarnings)}
        </div>
        <div className="mt-2 text-sm text-[#8A8D96]">Lifetime gross earnings</div>
      </div>

      {/* Pending Clearance Card */}
      <div className="rounded-2xl border border-[#ECEAE5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="font-semibold text-[#5B5E68] text-sm">Pending Clearance</span>
        </div>
        <div className="font-display text-4xl font-bold text-[#15171C]">
          {formatCurrency(pendingClearance)}
        </div>
        <div className="mt-2 text-sm text-[#8A8D96]">Funds in escrow or processing</div>
      </div>

      {/* Available for Withdrawal Card */}
      <div className="rounded-2xl border border-[#ECEAE5] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="font-semibold text-[#5B5E68] text-sm">Available for Withdrawal</span>
        </div>
        <div className="font-display text-4xl font-bold text-[#15171C]">
          {formatCurrency(availableForWithdrawal)}
        </div>
        <button className="mt-4 w-full py-2.5 rounded-full text-sm font-semibold text-white bg-[#15171C] hover:bg-[#2563EB] transition-colors">
          Withdraw Funds
        </button>
      </div>
    </div>
  );
}
