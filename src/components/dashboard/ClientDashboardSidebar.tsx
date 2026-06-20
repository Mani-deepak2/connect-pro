"use client"
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  Building2, Users, FileText, MessageSquare, 
  Settings, LogOut, PlusCircle, BarChart3, Briefcase, Menu, X
} from 'lucide-react'
import { useState } from 'react'

export function ClientDashboardSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/client/dashboard' },
    { icon: Building2, label: 'Company Profile', href: '/client/profile' },
    { icon: PlusCircle, label: 'Post Project', href: '/client/projects/new' },
    { icon: FileText, label: 'My Projects', href: '/client/dashboard' },
    { icon: Users, label: 'Applications', href: '/client/dashboard' },
    { icon: Briefcase, label: 'Contracts', href: '/client/contracts' },
    { icon: MessageSquare, label: 'Messages', href: '/client/messages' },
    { icon: Settings, label: 'Settings', href: '/client/settings' },
  ]

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-[#ECEAE5] shadow-sm rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#ECEAE5] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl leading-none mb-8">
            <span className="text-[#15171C]">Connect</span>
            <span className="text-[#2563EB]">Pro</span>
          </Link>
          <nav className="space-y-2">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href
              return (
                <Link key={i} href={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#EEF3FF] text-[#2563EB] font-semibold' : 'text-[#5B5E68] hover:bg-[#F7F6F3] hover:text-[#15171C] font-medium'}`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-[#ECEAE5]">
          <button onClick={handleSignOut} className="flex items-center space-x-3 text-[#5B5E68] hover:text-red-600 font-medium transition-colors w-full px-4 py-2">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
