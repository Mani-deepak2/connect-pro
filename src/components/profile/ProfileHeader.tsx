"use client"
import { BadgeCheck, MapPin, Mail, PlayCircle, Star, Edit, Share2, Download } from 'lucide-react'

export function ProfileHeader({ profile, stats }: { profile: any, stats: any }) {
  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 mb-6 shadow-sm">
      {/* Top Banner Area with Verification & Credits */}
      <div className="flex justify-between items-center mb-6 border-b border-[#ECEAE5] pb-4">
        <div className="flex items-center gap-2">
           <span className="bg-[#15171C] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
             Connect Cost: 2 Credits
           </span>
           {profile.is_verified && (
             <span className="bg-blue-50 text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full flex items-center">
               <BadgeCheck className="w-4 h-4 mr-1" /> Verified Freelancer
             </span>
           )}
        </div>
        <div className="flex gap-3">
          <button className="p-2 border border-[#ECEAE5] rounded-xl hover:bg-[#F7F6F3] text-[#5B5E68] transition-colors"><Share2 className="w-5 h-5" /></button>
          <button className="p-2 border border-[#ECEAE5] rounded-xl hover:bg-[#F7F6F3] text-[#5B5E68] transition-colors"><Download className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Image & Basic Info */}
        <div className="flex gap-6 w-full md:w-1/3">
          <div className="w-32 h-32 rounded-2xl bg-[#F7F6F3] border border-[#ECEAE5] flex-shrink-0 overflow-hidden shadow-sm">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#8A8D96]">
                {profile.full_name?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[#15171C] mb-1">{profile.full_name}</h1>
            <p className="text-[#2563EB] font-medium mb-3">{profile.title}</p>
            <div className="space-y-2 text-sm text-[#5B5E68]">
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-[#8A8D96]" /> {profile.location || 'Remote'}</div>
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
