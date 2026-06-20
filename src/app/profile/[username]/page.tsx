"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Import Components
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { BasicInfoTab } from '@/components/profile/tabs/BasicInfoTab'
import { SkillsTab } from '@/components/profile/tabs/SkillsTab'
import { PortfolioTab } from '@/components/profile/tabs/PortfolioTab'
import { EmploymentTab } from '@/components/profile/tabs/EmploymentTab'
import { ReviewsTab } from '@/components/profile/tabs/ReviewsTab'

export default function FreelancerProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [activeTab, setActiveTab] = useState('Basic Information')
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  
  // Data States
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [employment, setEmployment] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchProfileData()
  }, [username])

  const fetchProfileData = async () => {
    setIsLoading(true)
    
    // Get current logged in user to check ownership
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile by username (or fallback to id if username is a UUID)
    const { data: profileData, error } = await supabase
      .from('freelancer_profiles')
      .select('*')
      .or(`username.eq.${username},user_id.eq.${username}`)
      .single()

    if (profileData) {
      setProfile(profileData)
      const freelancerId = profileData.user_id

      if (user && user.id === freelancerId) {
        setIsOwner(true)
      }

      // Parallel fetch all other data
      const [
        { data: statsData },
        { data: skillsData },
        { data: portfolioData },
        { data: empData },
        { data: reviewsData }
      ] = await Promise.all([
        supabase.from('freelancer_stats').select('*').eq('freelancer_id', freelancerId).single(),
        supabase.from('freelancer_skills').select('*').eq('freelancer_id', freelancerId).order('rating', { ascending: false }),
        supabase.from('portfolio_projects').select('*').eq('freelancer_id', freelancerId).order('created_at', { ascending: false }),
        supabase.from('employment_history').select('*').eq('freelancer_id', freelancerId).order('start_date', { ascending: false }),
        supabase.from('reviews').select(`*, reviewer:client_profiles(company_name)`).eq('reviewee_id', freelancerId).order('created_at', { ascending: false })
      ])

      if (statsData) setStats(statsData)
      if (skillsData) setSkills(skillsData)
      if (portfolioData) setPortfolio(portfolioData)
      if (empData) setEmployment(empData)
      if (reviewsData) setReviews(reviewsData)
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" /></div>
  }

  if (!profile) {
    return <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-[#5B5E68]">Profile not found.</div>
  }

  const TABS = ['Basic Information', 'Skills', 'Portfolio', 'Employment History', 'Reviews']

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <ProfileHeader profile={profile} stats={stats} isOwner={isOwner} />

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content Area */}
          <div className="w-full lg:w-2/3">
            
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar mb-6 bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] rounded-2xl p-2 shadow-sm gap-2">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === tab 
                      ? 'bg-[#15171C] dark:bg-[#2563EB] text-white shadow-md' 
                      : 'text-[#5B5E68] dark:text-[#8A8D96] hover:bg-[#F7F6F3] dark:hover:bg-[#2A2B32] hover:text-[#15171C] dark:hover:text-[#ECEAE5]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content Rendering */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activeTab === 'Basic Information' && <BasicInfoTab profile={profile} />}
              {activeTab === 'Skills' && <SkillsTab skills={skills} />}
              {activeTab === 'Portfolio' && <PortfolioTab projects={portfolio} />}
              {activeTab === 'Employment History' && <EmploymentTab history={employment} />}
              {activeTab === 'Reviews' && <ReviewsTab reviews={reviews} />}
            </div>

          </div>

          {/* Right Sidebar Area */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-6">
              <ProfileSidebar profile={profile} stats={stats} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
