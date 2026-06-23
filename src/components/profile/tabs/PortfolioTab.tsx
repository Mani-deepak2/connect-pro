"use client"
import { ExternalLink, Code2, Folder } from 'lucide-react'

export function PortfolioTab({ projects }: { projects: any[] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-[#ECEAE5] rounded-3xl p-12 text-center shadow-sm">
        <Folder className="w-12 h-12 text-[#8A8D96] mx-auto mb-4" />
        <p className="text-[#5B5E68]">No portfolio projects uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white border border-[#ECEAE5] rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          {/* Image Thumbnail */}
          <div className="h-48 bg-[#F7F6F3] border-b border-[#ECEAE5] overflow-hidden relative">
            {project.image_url ? (
              <img 
                src={project.image_url} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Folder className="w-10 h-10 text-[#8A8D96]" />
              </div>
            )}
            {project.category && (
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#15171C] text-xs font-bold px-3 py-1 rounded-full">
                {project.category}
              </span>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-display font-bold text-[#15171C] mb-2 line-clamp-1">{project.title}</h3>
            <p className="text-sm text-[#5B5E68] line-clamp-2 mb-4">{project.description}</p>
            
            {/* Tech Stack */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.slice(0, 3).map((tech: string, i: number) => (
                  <span key={i} className="text-xs font-semibold bg-[#F7F6F3] text-[#5B5E68] px-2 py-1 rounded-md">
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className="text-xs font-semibold bg-[#F7F6F3] text-[#5B5E68] px-2 py-1 rounded-md">
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#ECEAE5]">
              {project.project_link && (
                <a 
                  href={project.project_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-[#15171C] hover:bg-[#2563EB] text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
                >
                  View Project <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}
              {project.github_link && (
                <a 
                  href={project.github_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 border-2 border-[#ECEAE5] hover:border-[#15171C] text-[#15171C] rounded-xl transition-colors flex-shrink-0"
                  title="Source Code"
                >
                  <Code2 className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
