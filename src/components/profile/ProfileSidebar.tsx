"use client"
import { Clock, MessageSquare, Briefcase, Zap, CheckCircle2 } from 'lucide-react'

export function ProfileSidebar({ profile, stats }: { profile: any, stats: any }) {
  return (
    <div className="space-y-6">
      
      {/* Contact / Action Widget */}
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-display font-bold text-[#15171C] mb-4">Work with {profile.full_name?.split(' ')[0]}</h3>
        <button className="w-full bg-[#15171C] hover:bg-[#2563EB] text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-black/10 mb-3 flex items-center justify-center">
          <Briefcase className="w-5 h-5 mr-2" /> Hire Freelancer
        </button>
        <button className="w-full bg-white border-2 border-[#ECEAE5] hover:border-[#15171C] text-[#15171C] font-bold py-3 px-6 rounded-full transition-colors flex items-center justify-center">
          <MessageSquare className="w-5 h-5 mr-2" /> Send Message
        </button>
      </div>

      {/* Availability Widget */}
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display font-bold text-[#15171C]">Current Status</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            profile.availability_status === 'Available Now' ? 'bg-emerald-50 text-emerald-600' :
            profile.availability_status === 'Busy' ? 'bg-orange-50 text-orange-600' :
            'bg-[#F7F6F3] text-[#5B5E68]'
          }`}>
            {profile.availability_status}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Zap className="w-4 h-4 text-[#2563EB]" /></div>
            <div>
              <p className="text-sm font-semibold text-[#15171C]">Response Time</p>
              <p className="text-xs text-[#5B5E68]">Usually responds in 2 hours</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
            <div>
              <p className="text-sm font-semibold text-[#15171C]">Last Active</p>
              <p className="text-xs text-[#5B5E68]">Available Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Widget */}
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
        <h3 className="font-display font-bold text-[#15171C] mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#ECEAE5] pb-3">
            <span className="text-[#5B5E68] text-sm">Projects Completed</span>
            <span className="font-bold text-[#15171C]">{stats?.projects_completed || 0}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#ECEAE5] pb-3">
            <span className="text-[#5B5E68] text-sm">Total Reviews</span>
            <span className="font-bold text-[#15171C]">{stats?.total_reviews || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5B5E68] text-sm">Average Rating</span>
            <span className="font-bold text-[#15171C]">{stats?.average_rating || '0.00'}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
