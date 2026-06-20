"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Edit3, Eye, ShieldCheck, MapPin, Globe, Users, Briefcase, Mail, Phone, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ClientFormData {
  company_name: string;
  industry: string;
  company_website: string;
  company_description: string;
}

export default function ClientProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    projectsPosted: 0,
    freelancersHired: 0,
    successRate: '100%',
    totalSpending: '$12,450'
  })
  
  const supabase = createClient()
  


  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data && !error) {
      setProfile(data)
    }

    // Mock stats fetching
    const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', user.id)
    const { count: contractsCount } = await supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('client_id', user.id)
    
    setStats({
      projectsPosted: projectsCount || 12,
      freelancersHired: contractsCount || 8,
      successRate: '98%',
      totalSpending: '$15,200'
    })

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50">
      
      {/* Banner Section */}
      <div className="relative w-full h-48 md:h-64 bg-slate-800">
        {profile?.company_banner ? (
          <img src={profile.company_banner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-90"></div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center border border-white/20">
            <Eye className="w-4 h-4 mr-2" />
            Preview Public View
          </button>
          <Link href="/client/profile/edit" className="bg-white text-gray-900 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center shadow-lg">
            <Edit3 className="w-4 h-4 mr-2 text-teal-600" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 -mt-16 md:-mt-20 relative z-10">
        
        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            
            {/* Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
              {profile?.company_logo || profile?.logo ? (
                <img src={profile?.company_logo || profile?.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-teal-50 flex items-center justify-center text-teal-600 text-4xl font-bold">
                  {(profile?.company_name || 'C').charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profile?.company_name || 'Setup Your Company'}</h1>
                <ShieldCheck className="w-6 h-6 text-teal-500" />
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 mb-6">
                {profile?.industry && (
                  <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" /> {profile.industry}</div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {profile.location}</div>
                )}
                {profile?.company_size && (
                  <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> {profile.company_size} Employees</div>
                )}
                {profile?.company_website && (
                  <div className="flex items-center gap-1.5 hover:text-teal-600 transition-colors">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={profile.company_website} target="_blank" rel="noopener noreferrer">{profile.company_website.replace('https://', '')}</a>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Payment Verified
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Identity Verified
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Enterprise Client
                </span>
              </div>
            </div>

            {/* Profile Completion Widget */}
            <div className="w-full md:w-64 bg-gray-50 rounded-2xl p-5 border border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-900">Profile Completion</span>
                <span className="text-sm font-bold text-teal-600">85%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Complete your profile to attract top-tier freelancers.</p>
              <Link href="/client/profile/edit" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center">
                Complete Profile <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Company</h2>
              {profile?.company_description ? (
                <div className="prose prose-gray max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.company_description}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No description provided yet.</p>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Company Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Projects Posted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.projectsPosted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Freelancers Hired</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.freelancersHired}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Hire Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.successRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Spending</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalSpending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-8">
            
            {/* Verifications */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Verifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Email Address</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Phone Number</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Payment Method</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Social Presence</h3>
              <div className="space-y-3">
                {profile?.linkedin_url ? (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all group">
                    <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">LinkedIn Profile</span>
                    <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-teal-600" />
                  </a>
                ) : null}
                
                {profile?.twitter_url ? (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-all group">
                    <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700">Twitter (X) Profile</span>
                    <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-teal-600" />
                  </a>
                ) : null}

                {!profile?.linkedin_url && !profile?.twitter_url && (
                  <p className="text-sm text-gray-500 italic">No social links added yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
