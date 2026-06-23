"use client";

import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  freelancer_payout: number;
  platform_fee: number;
  status: string;
  client_id: string;
}

export function EarningsHistoryTable({ payments }: { payments: Payment[] }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ECEAE5] bg-white p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-[#8A8D96]" />
        </div>
        <h3 className="text-lg font-semibold text-[#15171C] mb-2">No transactions yet</h3>
        <p className="text-[#5B5E68] max-w-sm mx-auto">
          Once you complete projects and receive payments, your transaction history will appear here.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="rounded-2xl border border-[#ECEAE5] bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-[#ECEAE5]">
        <h3 className="font-bold text-[#15171C] text-lg">Transaction History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F6F3] text-sm text-[#5B5E68]">
              <th className="px-6 py-3 font-semibold w-1/4">Date</th>
              <th className="px-6 py-3 font-semibold w-1/3">Description</th>
              <th className="px-6 py-3 font-semibold w-1/6">Status</th>
              <th className="px-6 py-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECEAE5]">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-[#F9F9F8] transition-colors">
                <td className="px-6 py-4 text-sm text-[#3A3D45]">
                  {formatDate(payment.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#15171C]">Project Payment</div>
                  <div className="text-xs text-[#8A8D96] mt-0.5">
                    Platform fee: {formatCurrency(payment.platform_fee)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {payment.status === 'completed' ? 'Cleared' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    {formatCurrency(payment.freelancer_payout)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
