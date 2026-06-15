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
    <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
