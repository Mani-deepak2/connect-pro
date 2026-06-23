"use client"
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, Folder, Users, CreditCard, Building2, HelpCircle, LogOut, Search, ChevronDown, ChevronRight, Menu, X, FileSignature, MessageSquare, Settings, BarChart, Calendar, Compass, Star
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function GlobalClientSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const [projectId, setProjectId] = useState<string | null>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Determine a project ID to link to if we are inside a workspace,
    // otherwise fallback to fetching the most recent project or redirecting to a project list.
    const pathParts = pathname.split('/')
    if (pathParts.includes('workspace') && pathParts.length >= 4) {
      setProjectId(pathParts[3])
    }
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Use the extracted projectId for My Project links, or default to a generic project listing if null
  const projectBaseUrl = projectId ? `/client/workspace/${projectId}` : `/client/dashboard`;

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-gray-200 shadow-sm rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
      </button>

      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 pb-2">
          <Link href="/client/dashboard" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">H</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">hireus</span>
          </Link>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-gray-100/80 border-none rounded-full py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mb-2 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</span>
          </div>
          
          <nav className="space-y-1">
            <Link 
              href="/client/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/dashboard' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <LayoutDashboard className={`w-4 h-4 ${pathname === '/client/dashboard' ? 'text-teal-600' : 'text-gray-400'}`} />
              Dashboard
            </Link>

            <Link 
              href="/client/freelancers" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/freelancers' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Compass className={`w-4 h-4 ${pathname === '/client/freelancers' ? 'text-teal-600' : 'text-gray-400'}`} />
              Find Freelancers
            </Link>

            <Link 
              href="/client/profile" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/client/profile') ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Building2 className={`w-4 h-4 ${pathname.includes('/client/profile') ? 'text-teal-600' : 'text-gray-400'}`} />
              Company Profile
            </Link>

            <div>
              <button 
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.includes('/workspace') ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder className={`w-4 h-4 ${pathname.includes('/workspace') ? 'text-teal-600' : 'text-gray-400'}`} />
                  My Projects
                </div>
                {isProjectsOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </button>
              
              {isProjectsOpen && (
                <div className="mt-1 ml-9 space-y-1 relative before:content-[''] before:absolute before:left-[-11px] before:top-0 before:bottom-2 before:w-px before:bg-gray-200">
                  {[
                    { label: 'Active', status: 'active' },
                    { label: 'Closed', status: 'closed' },
                    { label: 'Draft', status: 'draft' },
                  ].map((sub) => {
                    const href = `${projectBaseUrl}?status=${sub.status}`;
                    const isActive = searchParams.get('status') === sub.status;
                    return (
                      <Link 
                        key={sub.label} 
                        href={href}
                        className={`flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-md transition-colors relative ${isActive ? 'text-teal-700 bg-teal-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          {isActive && <span className="absolute -left-[14px] w-2 h-2 rounded-full bg-teal-500 ring-4 ring-white" />}
                          {sub.label}
                        </div>
                        {sub.label === 'Active' && isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <Link 
              href="/client/team" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/team' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Users className={`w-4 h-4 ${pathname === '/client/team' ? 'text-teal-600' : 'text-gray-400'}`} />
              Applicants
            </Link>

            <Link 
              href="/client/contracts" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/contracts' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <FileSignature className={`w-4 h-4 ${pathname === '/client/contracts' ? 'text-teal-600' : 'text-gray-400'}`} />
              Contracts
            </Link>

            <Link 
              href="/client/messages" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/messages' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <MessageSquare className={`w-4 h-4 ${pathname === '/client/messages' ? 'text-teal-600' : 'text-gray-400'}`} />
              Messages
            </Link>

            <Link 
              href="/client/payments" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/payments' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <CreditCard className={`w-4 h-4 ${pathname === '/client/payments' ? 'text-teal-600' : 'text-gray-400'}`} />
              Payments
            </Link>

            <Link 
              href="/client/analytics" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/analytics' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <BarChart className={`w-4 h-4 ${pathname === '/client/analytics' ? 'text-teal-600' : 'text-gray-400'}`} />
              Analytics
            </Link>

            <Link 
              href="/client/reviews" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/reviews' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Star className={`w-4 h-4 ${pathname === '/client/reviews' ? 'text-teal-600' : 'text-gray-400'}`} />
              Reviews
            </Link>

            <Link 
              href="/client/interviews" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/interviews' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Calendar className={`w-4 h-4 ${pathname === '/client/interviews' ? 'text-teal-600' : 'text-gray-400'}`} />
              Interviews
            </Link>

            <Link 
              href="/client/settings" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/client/settings' ? 'text-teal-700 bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Settings className={`w-4 h-4 ${pathname === '/client/settings' ? 'text-teal-600' : 'text-gray-400'}`} />
              Settings
            </Link>
          </nav>

          <div className="mt-8 mb-2 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Other</span>
          </div>
          
          <nav className="space-y-1 pb-6">
            <Link 
              href="/client/support" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              Help & Support
            </Link>
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Logout
            </button>
          </nav>
        </div>
      </aside>
    </>
  )
}
