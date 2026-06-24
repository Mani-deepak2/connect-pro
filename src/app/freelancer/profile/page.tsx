"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Edit3, Eye, ShieldCheck, MapPin, Globe, Users, Briefcase, Mail, Phone, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FreelancerProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    projectsCompleted: 0,
    successRate: '100%',
    totalEarnings: '$0'
  })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('freelancer_profiles')
      .select('*, users!inner(username, email)')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error(error)
    } else if (data) {
      setProfile(data)
    }
    
    // In a real app we'd fetch stats from the db, for now use defaults or simple logic
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center bg-gray-50/50"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50/50 p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find your profile data. Please complete onboarding.</p>
        <Link href="/onboarding/freelancer" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition">Complete Profile</Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto bg-gray-50/50">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <div className="flex gap-3">
          <Link href={`/profile/${profile.users?.username}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center">
            <Eye className="w-4 h-4 mr-2" /> View Public
          </Link>
          <Link href="/freelancer/profile/edit" className="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition shadow-sm flex items-center">
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              {profile.profile_image ? (
                <img src={profile.profile_image} alt={profile.full_name} className="w-32 h-32 rounded-full object-cover shadow-sm border border-gray-100" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-4xl font-bold border border-teal-200">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.full_name}</h2>
            <p className="text-teal-600 font-medium mb-1">{profile.title}</p>
            <p className="text-gray-500 text-sm mb-4">@{profile.users?.username}</p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 py-2 rounded-lg mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Identity Verified</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Hourly Rate</p>
                <p className="font-bold text-gray-900">${profile.hourly_rate}<span className="text-sm font-normal text-gray-500">/hr</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Experience</p>
                <p className="font-bold text-gray-900">{profile.experience_level}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Contact Info</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{profile.users?.email}</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.portfolio_link && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a href={profile.portfolio_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline break-all">{profile.portfolio_link}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
            <div className="prose prose-teal max-w-none text-gray-600">
              <p className="whitespace-pre-wrap">{profile.bio || "No biography provided."}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Skills & Expertise</h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-medium border border-teal-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills listed yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
