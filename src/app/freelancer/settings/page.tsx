"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Bell, Shield, Moon, Monitor, Eye } from 'lucide-react'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    privacy_mode: false,
    theme: 'light'
  })

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setSettings({
        notifications_enabled: data.notifications_enabled,
        email_notifications: data.email_notifications,
        privacy_mode: data.privacy_mode,
        theme: data.theme
      })
    }
    setIsLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsSaving(true)
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })

    setIsSaving(false)
    if (error) {
      alert("Failed to save settings")
    } else {
      alert("Settings saved successfully!")
    }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center bg-gray-50/50"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Account Settings</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts for messages and job invites</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications_enabled} 
                  onChange={(e) => setSettings({...settings, notifications_enabled: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" 
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive a daily digest and important alerts via email</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.email_notifications} 
                  onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" 
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Privacy & Security</h2>
            </div>

            <label className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition">
              <div>
                <h3 className="font-medium text-gray-900">Incognito Mode</h3>
                <p className="text-sm text-gray-500">Hide your profile from public searches (Only visible to invited clients)</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.privacy_mode} 
                onChange={(e) => setSettings({...settings, privacy_mode: e.target.checked})}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" 
              />
            </label>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Monitor className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setSettings({...settings, theme: 'light'})}
                className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition ${settings.theme === 'light' ? 'border-teal-500 bg-teal-50/50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Monitor className="w-6 h-6" />
                <span className="font-medium">Light</span>
              </button>
              <button 
                type="button"
                onClick={() => setSettings({...settings, theme: 'dark'})}
                className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition ${settings.theme === 'dark' ? 'border-teal-500 bg-teal-50/50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Moon className="w-6 h-6" />
                <span className="font-medium">Dark</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition shadow-sm flex items-center disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
