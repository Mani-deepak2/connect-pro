import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
      <div className="w-16 h-16 bg-[#F7F6F3] rounded-2xl flex items-center justify-center mb-6 border border-[#ECEAE5]">
        <Icon className="w-8 h-8 text-[#8A8D96]" />
      </div>
      <h3 className="text-xl font-display font-bold text-[#15171C] mb-2">{title}</h3>
      <p className="text-[#5B5E68] mb-8 max-w-md">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-full transition-all shadow-lg shadow-black/10"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
