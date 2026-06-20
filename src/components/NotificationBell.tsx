"use client"
import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link?: string
  created_at: string
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const typeColor: Record<string, string> = {
    message: 'bg-blue-500',
    application: 'bg-cyan-500',
    system: 'bg-purple-500',
    contract: 'bg-emerald-500',
    payment: 'bg-amber-500',
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-lg hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] transition-colors"
      >
        <Bell className="w-5 h-5 text-[#5B5E68] dark:text-[#8A8D96]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-[#15171C]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[#ECEAE5] dark:border-[#2A2B32] flex items-center justify-between">
              <h3 className="font-bold text-[#15171C] dark:text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] text-[#2563EB] dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-[#ECEAE5] dark:text-[#2A2B32] mx-auto mb-2" />
                  <p className="text-[#8A8D96] text-xs">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`flex items-start gap-3 px-4 py-3 border-b border-[#ECEAE5] dark:border-[#2A2B32] last:border-0 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1B22] transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/40 dark:bg-cyan-500/5' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColor[n.type] || 'bg-[#8A8D96]'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-[#15171C] dark:text-white' : 'text-[#5B5E68] dark:text-[#8A8D96]'}`}>{n.title}</p>
                      <p className="text-[10px] text-[#8A8D96] mt-0.5 truncate">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-[#8A8D96] flex-shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
