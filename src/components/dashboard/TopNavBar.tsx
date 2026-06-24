"use client"
import { Bell, Search, User, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { CreditBalance } from './CreditBalance'

export function TopNavBar({ userType = 'client' }: { userType?: 'client' | 'freelancer' | 'admin' }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channelName = `notifications_updates_${Math.random().toString(36).substring(7)}`
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    setupRealtime()

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read && !n.read).length)
    }
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications').update({ is_read: true, read: true }).eq('user_id', user.id)
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })))
  }

  const performSearch = async (query: string) => {
    setIsSearching(true)
    setShowSearchResults(true)

    // Search users by username (case-insensitive)
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        role,
        freelancer_profiles(full_name, title, profile_image),
        client_profiles(company_name, industry, company_logo)
      `)
      .ilike('username', `%${query}%`)
      .limit(5)

    if (data) {
      setSearchResults(data)
    }
    setIsSearching(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side (Search) */}
        <div className="flex-1 flex items-center max-w-md hidden md:flex relative" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if(searchQuery.length >= 2) setShowSearchResults(true) }}
              placeholder="Search by username..." 
              className="w-full bg-gray-100/80 border-none rounded-full py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-shadow"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm flex justify-center items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-teal-600" /> Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No users found for "@{searchQuery}"</div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.map((result) => {
                    const isClient = result.role === 'client'
                    const profileData = isClient ? result.client_profiles?.[0] : result.freelancer_profiles?.[0]
                    const displayName = isClient ? profileData?.company_name : profileData?.full_name
                    const displayImage = isClient ? profileData?.company_logo : profileData?.profile_image
                    const subtitle = isClient ? profileData?.industry : profileData?.title
                    
                    return (
                      <Link 
                        key={result.id} 
                        href={`/profile/${result.username}`}
                        onClick={() => setShowSearchResults(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {displayImage ? (
                            <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-teal-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{displayName || 'Anonymous User'}</p>
                          <p className="text-xs text-gray-500">@{result.username} • {subtitle || result.role}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side (Notifications & Profile) */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Credit Balance */}
          <CreditBalance />

          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-teal-600 font-medium hover:text-teal-700">Mark all read</button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                  ) : notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${(!notif.is_read && !notif.read) ? 'bg-teal-50/30' : ''}`}>
                      <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                      <span className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200"></div>

          {/* Mini Profile */}
          <Link href={`/${userType}/profile`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">My Account</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
