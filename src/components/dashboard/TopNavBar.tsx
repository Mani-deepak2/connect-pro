"use client"
import { Bell, Search, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function TopNavBar() {
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications
  const notifications = [
    { id: 1, type: 'applicant', message: 'John Doe applied to your Senior React Developer project.', time: '2m ago' },
    { id: 2, type: 'message', message: 'Sarah Smith sent you a message.', time: '1h ago' },
    { id: 3, type: 'contract', message: 'Payment of $1,500 successfully processed.', time: '3h ago' },
  ]

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side (Search) */}
        <div className="flex-1 flex items-center max-w-md hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search projects, freelancers, or messages..." 
              className="w-full bg-gray-100/80 border-none rounded-full py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-shadow"
            />
          </div>
        </div>

        {/* Right side (Notifications & Profile) */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notification Center */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button className="text-xs text-teal-600 font-medium hover:text-teal-700">Mark all read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                      <span className="text-xs text-gray-400">{notif.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-gray-50 border-t border-gray-100">
                  <button className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200"></div>

          {/* Mini Profile */}
          <Link href="/client/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
