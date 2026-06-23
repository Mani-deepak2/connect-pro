import { Clock, DollarSign, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/types'

interface ProjectCardProps {
  project: Project;
  href: string;
  applicationCount?: number;
}

export function ProjectCard({ project, href, applicationCount = 0 }: ProjectCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6 transition-all hover:border-[#2563EB] hover:shadow-lg hover:shadow-blue-500/10 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-[#15171C] mb-2 group-hover:text-[#2563EB] transition-colors">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center text-sm text-[#5B5E68] gap-4">
              <span className="flex items-center font-medium"><Briefcase className="w-4 h-4 mr-1 text-[#8A8D96]"/> {project.category}</span>
              <span className="flex items-center font-medium"><Clock className="w-4 h-4 mr-1 text-[#8A8D96]"/> {project.duration}</span>
              <span className="flex items-center font-bold text-[#15171C]"><DollarSign className="w-4 h-4 mr-1 text-emerald-500"/> 
                {project.budget_type === 'fixed' ? `$${project.budget_amount} Fixed` : `$${project.budget_amount}/hr`}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            project.status === 'open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
            project.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
            project.status === 'completed' ? 'bg-[#F7F6F3] text-[#5B5E68] border border-[#ECEAE5]' :
            'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {project.status.toUpperCase()}
          </span>
        </div>
        
        <p className="text-[#5B5E68] text-sm mb-6 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-[#ECEAE5]">
          <div className="flex flex-wrap gap-2">
            {project.required_skills.slice(0, 3).map(skill => (
              <span key={skill} className="px-3 py-1 bg-[#F7F6F3] text-[#15171C] font-medium rounded-lg text-xs border border-[#ECEAE5]">
                {skill}
              </span>
            ))}
            {project.required_skills.length > 3 && (
              <span className="px-3 py-1 bg-[#F7F6F3] text-[#5B5E68] font-medium rounded-lg text-xs border border-[#ECEAE5]">
                +{project.required_skills.length - 3} more
              </span>
            )}
          </div>
          <div className="flex items-center text-sm font-medium text-[#8A8D96]">
            <Users className="w-4 h-4 mr-1" />
            {applicationCount} Applicants
          </div>
        </div>
      </div>
    </Link>
  )
}
