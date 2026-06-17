"use client"
import { Briefcase } from 'lucide-react'

export function EmploymentTab({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center shadow-sm">
        <Briefcase className="w-12 h-12 text-[#8A8D96] mx-auto mb-4" />
        <p className="text-[#5B5E68]">No employment history added.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-display font-bold text-[#15171C] mb-8">Employment History</h2>
      
      <div className="relative border-l-2 border-[#ECEAE5] ml-4 md:ml-6 space-y-10 pb-4">
        {history.map((item, index) => (
          <div key={item.id} className="relative pl-8 md:pl-10">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#2563EB] ring-4 ring-white" />
            
            <div className="bg-[#F7F6F3] rounded-2xl p-6 border border-[#ECEAE5] hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-[#15171C]">{item.position}</h3>
                  <p className="text-[#2563EB] font-semibold">{item.company}</p>
                </div>
                <div className="text-sm font-medium text-[#8A8D96] bg-white px-3 py-1 rounded-full border border-[#ECEAE5] self-start">
                  {new Date(item.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} 
                  {' - '} 
                  {item.end_date ? new Date(item.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                </div>
              </div>
              
              {item.description && (
                <p className="text-[#5B5E68] text-sm mt-4 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
