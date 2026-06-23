"use client"
import { Star } from 'lucide-react'

export function SkillsTab({ skills }: { skills: any[] }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center shadow-sm">
        <p className="text-[#5B5E68]">No skills listed yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-display font-bold text-[#15171C]">Post-interview skills assessment</h2>
        <span className="text-[#2563EB] text-sm font-semibold cursor-pointer hover:underline">View full feedback</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {skills.map((skill) => (
          <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ECEAE5] pb-4">
            <span className="font-semibold text-[#15171C] mb-2 sm:mb-0">{skill.skill_name}</span>
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= skill.rating ? 'fill-amber-400 text-amber-400' : 'fill-[#ECEAE5] text-[#ECEAE5]'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-[#5B5E68] font-medium">{skill.rating} out of 5 stars</span>
            </div>
            {skill.years_experience && (
              <span className="text-xs bg-[#F7F6F3] text-[#5B5E68] px-2 py-1 rounded-md hidden sm:block">
                {skill.years_experience} yrs
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
