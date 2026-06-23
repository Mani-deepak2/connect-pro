"use client"
import { useState } from 'react'
import { Search, Filter, MapPin, Star, Clock, CheckCircle, MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

const MOCK_FREELANCERS = [
  { id: 1, name: 'Alex Rivera', title: 'Senior Full Stack Developer', skills: ['React', 'Node.js', 'PostgreSQL'], location: 'United States', rate: '$65/hr', rating: 4.9, jobs: 42, success: '98%', img: 'A', bg: 'bg-blue-100', text: 'text-blue-700' },
  { id: 2, name: 'Emily Chen', title: 'UX/UI Designer & Researcher', skills: ['Figma', 'Prototyping', 'User Testing'], location: 'Canada', rate: '$50/hr', rating: 5.0, jobs: 89, success: '100%', img: 'E', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: 3, name: 'David Kim', title: 'DevOps Engineer', skills: ['AWS', 'Docker', 'Kubernetes'], location: 'South Korea', rate: '$85/hr', rating: 4.8, jobs: 24, success: '95%', img: 'D', bg: 'bg-purple-100', text: 'text-purple-700' },
  { id: 4, name: 'Sarah Smith', title: 'Mobile App Developer', skills: ['React Native', 'Swift', 'Kotlin'], location: 'United Kingdom', rate: '$55/hr', rating: 4.9, jobs: 56, success: '99%', img: 'S', bg: 'bg-orange-100', text: 'text-orange-700' },
  { id: 5, name: 'Michael Johnson', title: 'Backend Systems Expert', skills: ['Python', 'Django', 'Redis'], location: 'Australia', rate: '$70/hr', rating: 4.7, jobs: 112, success: '94%', img: 'M', bg: 'bg-teal-100', text: 'text-teal-700' },
]

export default function FindFreelancers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <div className="p-6 md:p-10 text-gray-900 h-full overflow-y-auto">
      
      {/* Header & Search */}
      <header className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Find Talent</h1>
        <p className="text-gray-500 mb-8 text-lg">Connect with top-rated professionals for your next project.</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, skills, or job title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all text-gray-900"
            />
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-medium flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>
      </header>

      {/* Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {['All', 'Development', 'Design', 'Marketing', 'Writing', 'Video', 'Admin'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              activeFilter === filter 
                ? 'bg-teal-50 border-teal-200 text-teal-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">{MOCK_FREELANCERS.length} results found</h2>
            <select className="bg-transparent text-sm text-gray-600 border-none outline-none font-medium cursor-pointer">
              <option>Sort by: Recommended</option>
              <option>Highest Rated</option>
              <option>Lowest Hourly Rate</option>
              <option>Most Jobs Completed</option>
            </select>
          </div>

          {MOCK_FREELANCERS.map(freelancer => (
            <div key={freelancer.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Avatar & Rate */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className={`w-20 h-20 rounded-full ${freelancer.bg} ${freelancer.text} flex items-center justify-center text-2xl font-bold`}>
                    {freelancer.img}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{freelancer.rate}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-teal-600 cursor-pointer transition-colors">{freelancer.name}</h3>
                      <p className="text-gray-600 font-medium">{freelancer.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2 rounded-xl transition-colors text-sm shadow-sm">
                        Invite
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {freelancer.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-600 font-medium">
                      <Star className="w-4 h-4 fill-current" /> {freelancer.rating} ({freelancer.jobs} jobs)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> {freelancer.success} Job Success
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    Expert {freelancer.title.toLowerCase()} with over 5 years of experience delivering high-quality solutions for enterprise clients globally. Highly communicative and dedicated to meeting project deadlines.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-6 flex justify-center">
            <button className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              Load More Talent
            </button>
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Hourly Rate</h3>
            <div className="space-y-3">
              {['Any Rate', '$10 - $30/hr', '$30 - $60/hr', '$60 & Above'].map(rate => (
                <label key={rate} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border border-gray-300 group-hover:border-teal-500 flex items-center justify-center">
                    {rate === 'Any Rate' && <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>}
                  </div>
                  <span className="text-gray-600 text-sm">{rate}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Job Success</h3>
            <div className="space-y-3">
              {['Any Success Rate', '90% & Up', '80% & Up'].map(success => (
                <label key={success} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded border border-gray-300 group-hover:border-teal-500 flex items-center justify-center">
                    {success === 'Any Success Rate' && <div className="w-3 h-3 bg-teal-500 rounded-sm"></div>}
                  </div>
                  <span className="text-gray-600 text-sm">{success}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
