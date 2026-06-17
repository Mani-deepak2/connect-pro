"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Briefcase, FileText, Send, Wallet, User as UserIcon, Settings, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function GlobalFreelancerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const mainLinks = [
    { name: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard },
    { name: 'Find Work', href: '/freelancer/projects', icon: Briefcase },
    { name: 'My Proposals', href: '/freelancer/applications', icon: Send },
    { name: 'Contracts', href: '/freelancer/contracts', icon: FileText },
    { name: 'Earnings', href: '/freelancer/earnings', icon: Wallet },
  ]

  const bottomLinks = [
    { name: 'My Profile', href: '/freelancer/profile', icon: UserIcon },
    { name: 'Settings', href: '/freelancer/settings', icon: Settings },
    { name: 'Help Center', href: '/freelancer/support', icon: HelpCircle },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isRouteActive = (route: string) => pathname === route || pathname.startsWith(route + '/')

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-all duration-300 hidden md:flex">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Connect<span className="text-teal-600">Pro</span></span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Freelancer</p>
        
        {mainLinks.map((link) => {
          const isActive = isRouteActive(link.href)
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center px-3 py-2.5 rounded-xl font-medium transition-all group ${
                isActive 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <link.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {link.name}
              
              {link.name === 'My Proposals' && (
                <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
        {bottomLinks.map((link) => {
          const isActive = isRouteActive(link.href)
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center px-3 py-2.5 rounded-xl font-medium transition-all group ${
                isActive 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <link.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {link.name}
            </Link>
          )
        })}
        
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group mt-2"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
          Log Out
        </button>
      </div>

    </aside>
  )
}
