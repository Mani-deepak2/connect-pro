"use client"
import { Users, DollarSign, Globe, Briefcase } from 'lucide-react'

export function BasicInfoTab({ profile }: { profile: any }) {
  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold text-[#15171C]">Additional overview</h2>
        <span className="text-[#2563EB] text-sm font-semibold cursor-pointer hover:underline">Info</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Team Members:</span>
            <div className="flex -space-x-2 w-2/3">
               <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white z-20 flex items-center justify-center text-xs font-bold text-blue-600">You</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Background:</span>
            <span className="text-[#15171C] font-semibold w-2/3">{profile.bio ? 'Filled' : 'Not filled'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Desired Salary:</span>
            <span className="text-[#15171C] font-semibold w-2/3">{profile.desired_salary || 'Negotiable'}</span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Links:</span>
            <div className="flex gap-2 w-2/3">
              {profile.portfolio_link ? (
                <a href={profile.portfolio_link} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#15171C] text-white flex items-center justify-center text-sm font-bold">W</a>
              ) : <span className="text-[#8A8D96] text-sm">None</span>}
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Languages:</span>
            <span className="text-[#15171C] font-semibold w-2/3 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-emerald-500" />
              {profile.languages?.join(', ') || 'English'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#ECEAE5] pb-3">
            <span className="text-[#8A8D96] font-medium w-1/3">Remote Friendly:</span>
            <span className="text-emerald-600 font-bold w-2/3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              {profile.remote_friendly !== false ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        
      </div>
      
      <div className="mt-10">
        <h3 className="text-lg font-display font-bold text-[#15171C] mb-4">Professional Bio</h3>
        <p className="text-[#5B5E68] leading-relaxed">
          {profile.bio || "This freelancer hasn't provided a professional bio yet."}
        </p>
      </div>
    </div>
  )
}
