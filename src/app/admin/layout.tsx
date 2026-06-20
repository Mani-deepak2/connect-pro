"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, Users, Briefcase, FileText, CreditCard, 
  BarChart3, ShieldAlert, HeadphonesIcon, LogOut, Menu, X, 
  ChevronDown, Search, Bell, Settings, Zap
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'admin') {
      router.push('/')
      return
    }

    setAdminEmail(user.email || 'Admin')
    setIsAdmin(true)
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-cyan-400/60 text-sm font-mono">Initializing Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Contracts', href: '/admin/contracts', icon: FileText },
    { name: 'Finances', href: '/admin/finances', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
    { name: 'Support', href: '/admin/support', icon: HeadphonesIcon },
  ]

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#C8CFD8] flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-[#131720] border border-[#1E2736] rounded-lg shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-[260px] bg-[#0D1117] border-r border-[#1B2232] transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="p-5 border-b border-[#1B2232]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">ConnectPro</span>
              <span className="block text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D4A5C]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 bg-[#131720] border border-[#1B2232] rounded-lg text-sm text-[#8892A4] placeholder-[#3D4A5C] focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#3D4A5C]">Main</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm shadow-cyan-500/5' 
                    : 'text-[#6B7A90] hover:bg-[#131720] hover:text-[#C8CFD8] font-medium'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-cyan-400' : ''}`} />
                <span>{item.name}</span>
                {item.name === 'Support' && (
                  <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1B2232]">
          {/* Admin info */}
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{adminEmail}</p>
              <p className="text-[10px] text-cyan-400/60 font-mono">Administrator</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Link href="/settings" className="flex-1 flex items-center justify-center gap-1.5 text-[#6B7A90] hover:text-[#C8CFD8] font-medium transition-colors text-xs py-2 rounded-lg hover:bg-[#131720]">
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <button onClick={handleSignOut} className="flex-1 flex items-center justify-center gap-1.5 text-[#6B7A90] hover:text-red-400 font-medium transition-colors text-xs py-2 rounded-lg hover:bg-red-500/5">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#1B2232] bg-[#0D1117]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#3D4A5C]">Admin</span>
            <span className="text-[#3D4A5C]">/</span>
            <span className="text-cyan-400 font-medium capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[#131720] transition-colors">
              <Bell className="w-4.5 h-4.5 text-[#6B7A90]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-[#1B2232]"></div>
            <div className="flex items-center gap-2 text-xs text-[#6B7A90]">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              System Online
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
