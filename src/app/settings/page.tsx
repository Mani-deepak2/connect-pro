"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  ArrowLeft, User, Bell, Shield, Palette, CreditCard, Lock, Loader2, LogOut, Globe
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Account')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  
  // Settings State
  const [settings, setSettings] = useState({
    notifications: {
      new_project_alerts: true,
      application_updates: true,
      messages: true,
      contract_updates: true,
      email_notifications: false
    },
    privacy: {
      public_profile_visibility: true,
      show_hourly_rate: true,
      show_location: true,
      show_earnings: true
    },
    theme: 'system'
  })

  // Basic Account info state
  const [accountInfo, setAccountInfo] = useState({
    full_name: '',
    username: '',
    email: ''
  })
  
  // Credits state
  const [credits, setCredits] = useState(0)

  const { theme, setTheme, systemTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Fetch user role to determine where "Back to Dashboard" goes
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData) setRole(userData.role)

    // Fetch settings
    const { data: settingsData } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    if (settingsData) {
      setSettings({
        notifications: settingsData.notifications || settings.notifications,
        privacy: settingsData.privacy || settings.privacy,
        theme: settingsData.theme || 'system'
      })
      if (settingsData.theme) setTheme(settingsData.theme)
    }

    // Fetch account info from correct profile based on role
    if (userData?.role === 'freelancer') {
      const { data: profile } = await supabase.from('freelancer_profiles').select('full_name, username').eq('user_id', user.id).single()
      if (profile) setAccountInfo({ full_name: profile.full_name, username: profile.username || '', email: user.email || '' })
    } else if (userData?.role === 'client') {
      const { data: profile } = await supabase.from('client_profiles').select('full_name').eq('user_id', user.id).single()
      if (profile) setAccountInfo({ full_name: profile.full_name, username: '', email: user.email || '' })
    }

    // Fetch credits
    const { data: creditsData } = await supabase.from('credits').select('balance').eq('user_id', user.id).single()
    if (creditsData) setCredits(creditsData.balance)

    setIsLoading(false)
  }

  const saveSettings = async (newSettings: any) => {
    setSettings(newSettings)
    if (!user) return
    
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      notifications: newSettings.notifications,
      privacy: newSettings.privacy,
      theme: newSettings.theme
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const TABS = [
    { id: 'Account', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Privacy', icon: Shield },
    { id: 'Appearance', icon: Palette },
    { id: 'Credits & Billing', icon: CreditCard },
    { id: 'Security', icon: Lock }
  ]

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" /></div>
  }

  const dashboardUrl = role === 'freelancer' ? '/freelancer/dashboard' : role === 'client' ? '/client/dashboard' : '/'

  return (
    <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#0A0A0A] py-10 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href={dashboardUrl} className="inline-flex items-center text-[#5B5E68] dark:text-[#8A8D96] hover:text-[#15171C] dark:hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-display font-bold text-[#15171C] dark:text-white">Settings</h1>
          <p className="text-[#5B5E68] dark:text-[#8A8D96]">Manage your account preferences and configurations.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    activeTab === tab.id 
                      ? 'bg-[#15171C] text-white dark:bg-[#EEF3FF] dark:text-[#2563EB] font-semibold' 
                      : 'text-[#5B5E68] dark:text-[#8A8D96] hover:bg-white dark:hover:bg-[#15171C] font-medium'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.id}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-8 shadow-sm">
            
            {activeTab === 'Account' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Account Settings</h2>
                
                {/* Personal Information Card */}
                <div className="bg-[#F7F6F3] dark:bg-[#0A0A0A] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-[#15171C] dark:text-white mb-6 border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-4">Personal Information</h3>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#15171C] border-2 border-[#ECEAE5] dark:border-[#2A2B32] flex items-center justify-center flex-shrink-0">
                      <User className="w-10 h-10 text-[#8A8D96]" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#8A8D96] mb-1">Full Name</label>
                          <p className="text-[#15171C] dark:text-white font-medium">{accountInfo.full_name || 'Not set'}</p>
                        </div>
                        {role === 'freelancer' && (
                          <div>
                            <label className="block text-sm font-semibold text-[#8A8D96] mb-1">Username</label>
                            <p className="text-[#15171C] dark:text-white font-medium">@{accountInfo.username || 'unknown'}</p>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-[#8A8D96] mb-1">Email Address</label>
                          <p className="text-[#15171C] dark:text-white font-medium">{accountInfo.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Account Statistics Widget */}
                  <div className="bg-[#F7F6F3] dark:bg-[#0A0A0A] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-[#15171C] dark:text-white mb-6 border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-4">Account Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm font-medium">Account Type</span>
                        <span className="text-[#15171C] dark:text-white font-bold capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs">{role}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm font-medium">Member Since</span>
                        <span className="text-[#15171C] dark:text-white font-semibold">June 2026</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm font-medium">Connect Credits</span>
                        <span className="text-[#15171C] dark:text-white font-bold">{credits}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#5B5E68] dark:text-[#8A8D96] text-sm font-medium">Profile Completion</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">85%</span>
                        </div>
                        <div className="w-full bg-[#ECEAE5] dark:bg-[#2A2B32] rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Summary Widget */}
                  <div className="bg-[#F7F6F3] dark:bg-[#0A0A0A] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-[#15171C] dark:text-white mb-6 border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-4">Security Summary</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#15171C] dark:text-white">Password Secure</p>
                          <p className="text-xs text-[#5B5E68] dark:text-[#8A8D96]">Last changed 3 months ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#15171C] dark:text-white">Active Sessions</p>
                          <p className="text-xs text-[#5B5E68] dark:text-[#8A8D96]">1 device currently logged in</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('Security')} className="mt-6 w-full text-center text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] dark:text-blue-400 transition-colors">
                      Manage Security Settings &rarr;
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-bold text-[#15171C] dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {role === 'freelancer' && (
                    <Link href="/freelancer/profile/edit" className="flex flex-col items-center justify-center p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#0A0A0A] transition-colors group">
                      <User className="w-6 h-6 text-[#8A8D96] group-hover:text-[#2563EB] mb-2 transition-colors" />
                      <span className="text-sm font-semibold text-[#15171C] dark:text-white">Edit Profile</span>
                    </Link>
                  )}
                  {role === 'freelancer' && (
                    <Link href={`/profile/${accountInfo.username}`} className="flex flex-col items-center justify-center p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#0A0A0A] transition-colors group">
                      <Globe className="w-6 h-6 text-[#8A8D96] group-hover:text-[#2563EB] mb-2 transition-colors" />
                      <span className="text-sm font-semibold text-[#15171C] dark:text-white">View Public</span>
                    </Link>
                  )}
                  <button onClick={() => setActiveTab('Appearance')} className="flex flex-col items-center justify-center p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#0A0A0A] transition-colors group">
                    <Palette className="w-6 h-6 text-[#8A8D96] group-hover:text-[#2563EB] mb-2 transition-colors" />
                    <span className="text-sm font-semibold text-[#15171C] dark:text-white">Appearance</span>
                  </button>
                  <button onClick={handleSignOut} className="flex flex-col items-center justify-center p-4 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                    <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-600 mb-2 transition-colors" />
                    <span className="text-sm font-semibold text-red-600">Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-[#ECEAE5] dark:border-[#2A2B32] last:border-0">
                      <div>
                        <p className="font-semibold text-[#15171C] dark:text-white capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-[#5B5E68] dark:text-[#8A8D96]">Receive updates about {key.replace(/_/g, ' ')}.</p>
                      </div>
                      <button 
                        onClick={() => saveSettings({...settings, notifications: {...settings.notifications, [key]: !value}})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#2563EB]' : 'bg-[#E5E7EB] dark:bg-[#2A2B32]'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Privacy' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Privacy Settings</h2>
                <div className="space-y-6">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-[#ECEAE5] dark:border-[#2A2B32] last:border-0">
                      <div>
                        <p className="font-semibold text-[#15171C] dark:text-white capitalize">{key.replace(/_/g, ' ')}</p>
                      </div>
                      <button 
                        onClick={() => saveSettings({...settings, privacy: {...settings.privacy, [key]: !value}})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#2563EB]' : 'bg-[#E5E7EB] dark:bg-[#2A2B32]'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Appearance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t)
                        saveSettings({...settings, theme: t})
                      }}
                      className={`p-6 rounded-2xl border-2 transition-all text-center ${settings.theme === t ? 'border-[#2563EB] bg-[#EEF3FF] dark:bg-[#2563EB]/10' : 'border-[#ECEAE5] dark:border-[#2A2B32] hover:border-[#8A8D96]'}`}
                    >
                      <span className="block font-semibold text-[#15171C] dark:text-white capitalize mb-2">{t} Mode</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Credits & Billing' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Credits & Billing</h2>
                <div className="bg-[#F7F6F3] dark:bg-[#0A0A0A] rounded-2xl p-6 border border-[#ECEAE5] dark:border-[#2A2B32] mb-8">
                  <p className="text-[#5B5E68] dark:text-[#8A8D96] font-medium mb-2">Available Connect Credits</p>
                  <div className="flex items-end gap-4">
                    <span className="text-5xl font-display font-bold text-[#15171C] dark:text-white">{credits}</span>
                    <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-xl font-semibold transition-colors mb-1">
                      Buy More Credits
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-[#15171C] dark:text-white mb-4">Transaction History</h3>
                <p className="text-[#5B5E68] dark:text-[#8A8D96]">No recent transactions.</p>
              </div>
            )}

            {activeTab === 'Security' && (
              <div>
                <h2 className="text-2xl font-bold text-[#15171C] dark:text-white mb-6">Security</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-bold text-[#15171C] dark:text-white mb-2">Change Password</h3>
                    <p className="text-sm text-[#5B5E68] dark:text-[#8A8D96] mb-4">You will receive an email with a secure link to change your password.</p>
                    <button className="bg-[#F7F6F3] dark:bg-[#2A2B32] hover:bg-[#ECEAE5] dark:hover:bg-[#3A3B42] text-[#15171C] dark:text-white px-6 py-2 rounded-xl font-semibold transition-colors">
                      Send Reset Link
                    </button>
                  </div>
                  <div className="pt-8 border-t border-[#ECEAE5] dark:border-[#2A2B32]">
                    <h3 className="font-bold text-[#15171C] dark:text-white mb-2">Device Management</h3>
                    <button onClick={handleSignOut} className="flex items-center text-red-600 hover:text-red-700 font-semibold px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl transition-colors">
                      <LogOut className="w-4 h-4 mr-2" /> Sign out of all devices
                    </button>
                  </div>
                  <div className="pt-8 border-t border-[#ECEAE5] dark:border-[#2A2B32]">
                    <h3 className="font-bold text-red-600 mb-2">Delete Account</h3>
                    <p className="text-sm text-[#5B5E68] dark:text-[#8A8D96] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2 rounded-xl font-semibold transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
