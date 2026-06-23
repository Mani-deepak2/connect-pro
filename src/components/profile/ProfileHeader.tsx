"use client"
import Link from 'next/link'
import { BadgeCheck, MapPin, Mail, PlayCircle, Star, Edit, Share2, Download, Eye } from 'lucide-react'

export function ProfileHeader({ profile, stats, isOwner = false }: { profile: any, stats: any, isOwner?: boolean }) {
  return (
    <div className="bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-3xl p-8 mb-6 shadow-sm transition-colors">
      {/* Top Banner Area with Verification & Credits */}
      <div className="flex justify-between items-center mb-6 border-b border-[#ECEAE5] dark:border-[#2A2B32] pb-4">
        <div className="flex items-center gap-2">
           <span className="bg-[#15171C] dark:bg-[#EEF3FF] text-white dark:text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full flex items-center">
             Connect Cost: 2 Credits
           </span>
           {profile.is_verified && (
             <span className="bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full flex items-center">
               <BadgeCheck className="w-4 h-4 mr-1" /> Verified Freelancer
             </span>
           )}
        </div>
        <div className="flex gap-3 items-center">
          {isOwner ? (
            <>
              <Link href="/freelancer/profile/edit" className="flex items-center gap-2 bg-[#F7F6F3] dark:bg-[#0A0A0A] hover:bg-[#ECEAE5] dark:hover:bg-[#2A2B32] text-[#15171C] dark:text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors border border-transparent dark:border-[#2A2B32]">
                <Edit className="w-4 h-4" /> Edit Profile
              </Link>
              <button className="flex items-center gap-2 bg-[#F7F6F3] dark:bg-[#0A0A0A] hover:bg-[#ECEAE5] dark:hover:bg-[#2A2B32] text-[#15171C] dark:text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors border border-transparent dark:border-[#2A2B32]">
                <Eye className="w-4 h-4" /> View Public
              </button>
              <button className="p-2 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] text-[#5B5E68] dark:text-[#8A8D96] transition-colors" title="Share Profile">
                <Share2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button className="p-2 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] text-[#5B5E68] dark:text-[#8A8D96] transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="p-2 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] text-[#5B5E68] dark:text-[#8A8D96] transition-colors"><Download className="w-5 h-5" /></button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image & Basic Info */}
        <div className="flex gap-6 w-full md:w-1/3">
          <div className="w-32 h-32 rounded-2xl bg-[#F7F6F3] dark:bg-[#0A0A0A] border border-[#ECEAE5] dark:border-[#2A2B32] flex-shrink-0 overflow-hidden shadow-sm">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#8A8D96] dark:text-[#5B5E68]">
                {profile.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[#15171C] dark:text-white mb-1">{profile.full_name}</h1>
            <p className="text-[#2563EB] dark:text-[#60A5FA] font-medium mb-3">{profile.title}</p>
            <div className="space-y-2 text-sm text-[#5B5E68] dark:text-[#8A8D96]">
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-[#8A8D96] dark:text-[#5B5E68]" /> {profile.location || 'Remote'}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4 md:pt-0">
          <div>
            <p className="text-sm font-semibold text-[#8A8D96] mb-1">Job Success</p>
            <div className="flex items-center text-[#15171C] font-bold text-lg">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400 mr-1" />
              {stats?.success_rate || 100}%
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8A8D96] mb-1">Total Earned</p>
            <p className="text-[#15171C] font-bold text-lg">${(stats?.total_earnings || 0).toLocaleString()}+</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8A8D96] mb-1">Hourly Rate</p>
            <p className="text-[#15171C] font-bold text-lg">${profile.hourly_rate || 0}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#8A8D96] mb-1">Hours Worked</p>
            <p className="text-[#15171C] font-bold text-lg">{stats?.total_hours_worked || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
