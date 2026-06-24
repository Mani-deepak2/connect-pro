"use client"
import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Star, Clock, CheckCircle, MessageSquare, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function FindFreelancers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [freelancers, setFreelancers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFreelancers()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFreelancers(searchTerm)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const fetchFreelancers = async (search = '') => {
    setIsLoading(true)
    let query = supabase
      .from('freelancer_profiles')
      .select('*, users!inner(username, role)')

    if (search.trim()) {
      // Use logical OR properly constructed for Supabase
      query = query.or(`full_name.ilike.%${search}%,title.ilike.%${search}%,skills.cs.{${search}}`)
    }

    const { data, error } = await query.limit(20)

    if (error) {
      console.error(error)
    } else if (data) {
      setFreelancers(data)
    }
    setIsLoading(false)
  }

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
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
              filter === 'All' 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-500 hover:text-teal-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Freelancer Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No freelancers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {freelancers.map(freelancer => (
            <Link href={`/profile/${freelancer.users?.username}`} key={freelancer.user_id} className="block group">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {freelancer.profile_image ? (
                        <img src={freelancer.profile_image} alt={freelancer.full_name} className="w-16 h-16 rounded-full object-cover shadow-sm border border-gray-100" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold border border-teal-200">
                          {(freelancer.full_name || freelancer.users?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-600 transition-colors">
                        {freelancer.full_name} <span className="text-sm font-normal text-gray-500">@{freelancer.users?.username}</span>
                      </h3>
                      <p className="text-teal-600 font-medium">{freelancer.title || 'Freelancer'}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {freelancer.location && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {freelancer.location}</span>}
                        <span className="flex items-center text-amber-500 font-medium"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> 5.0</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {freelancer.bio || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {freelancer.skills && freelancer.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills && freelancer.skills.length > 4 && (
                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
                      +{freelancer.skills.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Rate</p>
                      <p className="font-bold text-gray-900">${freelancer.hourly_rate || 0}<span className="text-sm font-normal text-gray-500">/hr</span></p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Experience</p>
                      <p className="font-bold text-gray-900">{freelancer.experience_level || 'Entry'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-teal-50 text-teal-700 font-medium rounded-xl hover:bg-teal-100 transition-colors text-sm">
                      Message
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors text-sm">
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
