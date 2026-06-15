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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-blue-500/30 hover:bg-white/10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center text-sm text-gray-400 gap-4">
              <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1"/> {project.category}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {project.duration}</span>
              <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1"/> 
                {project.budget_type === 'fixed' ? `$${project.budget_amount} Fixed` : `$${project.budget_amount}/hr`}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            project.status === 'open' ? 'bg-green-500/10 text-green-500' :
            project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
            project.status === 'completed' ? 'bg-gray-500/10 text-gray-400' :
            'bg-red-500/10 text-red-500'
          }`}>
            {project.status.toUpperCase()}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
          {project.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {project.required_skills.slice(0, 3).map(skill => (
              <span key={skill} className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-xs">
                {skill}
              </span>
            ))}
            {project.required_skills.length > 3 && (
              <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-xs">
                +{project.required_skills.length - 3} more
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            {applicationCount} Applicants
          </div>
        </div>
      </div>
    </Link>
  )
}
