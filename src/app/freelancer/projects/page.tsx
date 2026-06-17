"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Search, Filter, ArrowLeft, Loader2 } from 'lucide-react'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectCardSkeleton } from '@/components/ui/LoadingSkeleton'
import { Project } from '@/types'

const CATEGORIES = [
  "All Categories", "Video Editing", "Web Development", "AI Development", "Data Analysis", 
  "Graphic Design", "Content Writing", "Mobile Development", 
  "Digital Marketing", "UI/UX Design", "Other"
]

export default function FindProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data as Project[])
    }
    setIsLoading(false)
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/freelancer/dashboard" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Find Work</h1>
            <p className="text-[#5B5E68]">Discover and apply to the latest projects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-[#ECEAE5] rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-display font-bold text-[#15171C] mb-4 flex items-center"><Filter className="w-4 h-4 mr-2"/> Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#15171C] block mb-2">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8A8D96] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Keywords..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-2 pl-10 pr-4 text-[#15171C] text-sm focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#15171C] block mb-2">Category</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="category"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(cat)}
                          className="w-4 h-4 rounded border-[#ECEAE5] text-[#2563EB] focus:ring-[#2563EB]/50 focus:ring-offset-0"
                        />
                        <span className={`text-sm ${selectedCategory === cat ? 'text-[#15171C] font-semibold' : 'text-[#5B5E68] group-hover:text-[#15171C]'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project List */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <ProjectCardSkeleton key={i} />)}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    href={`/freelancer/projects/${project.id}`} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Search}
                title="No projects found"
                description="We couldn't find any open projects matching your current filters. Try adjusting your search criteria."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
