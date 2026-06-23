"use client"
import { useState, useEffect } from 'react'
import { User, Shield, Bell, Moon, Globe, Lock, Save, LogOut, Trash2, Key, Smartphone, Download, Check } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')
  const [isSaving, setIsSaving] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ]

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and configurations.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl space-y-6">
          
          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input type="text" defaultValue="Alex Manager" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                    <input type="email" defaultValue="alex@company.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
                    </div>
                  </div>
                  <button className="mt-4 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Update Password</button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Two-Factor Authentication (2FA)</h2>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex gap-4">
                    <Smartphone className="w-6 h-6 text-teal-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Authenticator App</p>
                      <p className="text-sm text-gray-500">Use an app like Google Authenticator to secure your account.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors">Enable</button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily summaries and critical alerts.' },
                  { title: 'Push Notifications', desc: 'Get real-time updates in your browser.' },
                  { title: 'SMS Alerts', desc: 'Receive texts for security events and urgent messages.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Theme Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mounted && [
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'system', label: 'System' }
                ].map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => setTheme(t.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${theme === t.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20' : 'border-gray-200 hover:border-teal-300'}`}
                  >
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 overflow-hidden border border-gray-200 relative">
                      <div className="w-full h-4 bg-gray-200"></div>
                      <div className="p-2 space-y-1"><div className="w-3/4 h-2 bg-gray-300 rounded"></div><div className="w-1/2 h-2 bg-gray-300 rounded"></div></div>
                      {t.id === 'dark' && <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply pointer-events-none" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{t.label}</span>
                      {theme === t.id && <Check className="w-4 h-4 text-teal-600" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGE TAB */}
          {activeTab === 'language' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Language & Region</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Display Language</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                    <option>Tamil</option>
                    <option>Kannada</option>
                    <option>Malayalam</option>
                    <option>Bengali</option>
                    <option>Marathi</option>
                    <option>Gujarati</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Currency</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                      <option>USD ($)</option>
                      <option>INR (₹)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Time Zone</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
                      <option>(GMT-05:00) Eastern Time</option>
                      <option>(GMT+05:30) India Standard Time</option>
                      <option>(GMT+00:00) UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Data & Privacy</h2>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <Download className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Export Account Data</p>
                        <p className="text-sm text-gray-500">Download a copy of your data including history and invoices.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-red-200 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50/50 gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Deactivate Account</p>
                      <p className="text-sm text-gray-500">Temporarily hide your profile and active job postings.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors">Deactivate</button>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50 gap-4">
                    <div>
                      <p className="font-semibold text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
                    </div>
                    <button className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center shadow-sm">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GLOBAL SAVE ACTION (Only show for certain tabs) */}
          {['account', 'language'].includes(activeTab) && (
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center shadow-md shadow-teal-500/20"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
