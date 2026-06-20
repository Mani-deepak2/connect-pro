"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Loader2, Camera, Upload, Trash2, Code, Link as LinkIcon, Briefcase, MapPin, DollarSign, Globe, Award, FileText, User } from 'lucide-react'

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    location: '',
    bio: '',
    hourly_rate: 0,
    experience_level: 'Intermediate',
    portfolio_link: '',
    github_link: '',
    linkedin_link: '',
    availability_status: 'Available Now',
    profile_image: '',
    resume_url: '',
    certificate_url: ''
  })
  
  const [skills, setSkills] = useState<string>('') // Comma separated for simplicity in this UI
  const [languages, setLanguages] = useState<string>('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data: profile } = await supabase.from('freelancer_profiles').select('*').eq('user_id', user.id).single()
    
    if (profile) {
      setUsername(profile.username || profile.id)
      setFormData({
        full_name: profile.full_name || '',
        title: profile.title || '',
        location: profile.location || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate || 0,
        experience_level: profile.experience_level || 'Intermediate',
        portfolio_link: profile.portfolio_link || '',
        github_link: profile.github_link || '',
        linkedin_link: profile.linkedin_link || '',
        availability_status: profile.availability_status || 'Available Now',
        profile_image: profile.profile_image || '',
        resume_url: profile.resume_url || '',
        certificate_url: profile.certificate_url || ''
      })
      setSkills(Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '')
      setLanguages(Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages || '')
    }
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: string, field: string) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }))
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file.')
    }
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)

    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s)
    const languagesArray = languages.split(',').map(s => s.trim()).filter(s => s)

    const { error } = await supabase.from('freelancer_profiles').update({
      full_name: formData.full_name,
      title: formData.title,
      location: formData.location,
      bio: formData.bio,
      hourly_rate: Number(formData.hourly_rate),
      experience_level: formData.experience_level,
      portfolio_link: formData.portfolio_link,
      github_link: formData.github_link,
      linkedin_link: formData.linkedin_link,
      availability_status: formData.availability_status,
      profile_image: formData.profile_image,
      resume_url: formData.resume_url,
      certificate_url: formData.certificate_url,
      skills: skillsArray,
      languages: languagesArray
    }).eq('user_id', userId)

    setIsSaving(false)

    if (error) {
      alert('Error saving profile: ' + error.message)
    } else {
      router.push(`/profile/${username}`)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] dark:bg-[#0A0A0A] py-10 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <Link href={`/profile/${username}`} className="inline-flex items-center text-[#5B5E68] dark:text-[#8A8D96] hover:text-[#15171C] dark:hover:text-white mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#15171C] dark:text-white mb-2">Edit Public Profile</h1>
            <p className="text-[#5B5E68] dark:text-[#8A8D96]">Update your professional details to attract more clients.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/profile/${username}`} className="px-6 py-2.5 rounded-full border border-[#ECEAE5] dark:border-[#2A2B32] text-[#15171C] dark:text-white font-semibold hover:bg-white dark:hover:bg-[#15171C] transition-colors">
              Cancel
            </Link>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/20 transition-colors flex items-center"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white dark:bg-[#15171C] rounded-3xl border border-[#ECEAE5] dark:border-[#2A2B32] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#15171C] dark:text-white mb-6 flex items-center"><User className="w-5 h-5 mr-2 text-[#2563EB]" /> Basic Information</h2>
            
            <div className="flex items-start gap-8 mb-8 pb-8 border-b border-[#ECEAE5] dark:border-[#2A2B32]">
              <div className="w-32 h-32 rounded-2xl bg-[#F7F6F3] dark:bg-[#0A0A0A] border-2 border-dashed border-[#ECEAE5] dark:border-[#2A2B32] flex items-center justify-center relative overflow-hidden group">
                {formData.profile_image ? (
                  <>
                    <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer text-white flex flex-col items-center">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold">Change</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatars', 'profile_image')} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center text-[#8A8D96] hover:text-[#2563EB] transition-colors">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">Upload Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatars', 'profile_image')} />
                  </label>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Full Name</label>
                  <input name="full_name" value={formData.full_name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none dark:text-white" placeholder="e.g. Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Professional Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
                      <input name="title" value={formData.title} onChange={handleChange} type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white" placeholder="e.g. Senior Frontend Developer" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
                      <input name="location" value={formData.location} onChange={handleChange} type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white" placeholder="e.g. New York, USA" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Professional Information */}
            <h2 className="text-xl font-bold text-[#15171C] dark:text-white mb-6 flex items-center"><Award className="w-5 h-5 mr-2 text-[#2563EB]" /> Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#ECEAE5] dark:border-[#2A2B32]">
               <div className="col-span-2">
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Skills (Comma separated)</label>
                  <input value={skills} onChange={(e) => setSkills(e.target.value)} type="text" className="w-full px-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white" placeholder="React, Node.js, UI/UX, TypeScript" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Hourly Rate ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
                    <input name="hourly_rate" value={formData.hourly_rate} onChange={handleChange} type="number" min="0" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Experience Level</label>
                  <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white appearance-none">
                    <option value="Entry Level">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
               </div>
               <div className="col-span-2">
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Languages (Comma separated)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
                    <input value={languages} onChange={(e) => setLanguages(e.target.value)} type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white" placeholder="English (Native), Spanish (Fluent)" />
                  </div>
               </div>
            </div>

            {/* Section 3: About & Links */}
            <h2 className="text-xl font-bold text-[#15171C] dark:text-white mb-6 flex items-center"><FileText className="w-5 h-5 mr-2 text-[#2563EB]" /> About & Links</h2>
            <div className="space-y-6 mb-8 pb-8 border-b border-[#ECEAE5] dark:border-[#2A2B32]">
              <div>
                <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Bio / Summary</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white resize-none" placeholder="Describe your experience, expertise, and what makes you unique..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Personal Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
                    <input name="portfolio_link" value={formData.portfolio_link} onChange={handleChange} type="url" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white text-sm" placeholder="https://" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">GitHub Profile</label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
                    <input name="github_link" value={formData.github_link} onChange={handleChange} type="url" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white text-sm" placeholder="https://github.com/..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">LinkedIn Profile</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8D96]" />
                    <input name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} type="url" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white text-sm" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Availability & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-[#15171C] dark:text-white mb-6">Availability</h2>
                <label className="block text-sm font-semibold text-[#15171C] dark:text-white mb-2">Current Status</label>
                <select name="availability_status" value={formData.availability_status} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#ECEAE5] dark:border-[#2A2B32] bg-white dark:bg-[#15171C] focus:ring-2 focus:ring-[#2563EB] outline-none dark:text-white appearance-none">
                  <option value="Available Now">🟢 Available Now</option>
                  <option value="Busy">🟡 Busy (Limited Capacity)</option>
                  <option value="Unavailable">🔴 Unavailable</option>
                </select>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-[#15171C] dark:text-white mb-6">Documents</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl bg-[#F7F6F3] dark:bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-[#15171C] rounded-lg flex items-center justify-center border border-[#ECEAE5] dark:border-[#2A2B32]">
                        <FileText className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#15171C] dark:text-white text-sm">Resume / CV</p>
                        <p className="text-xs text-[#5B5E68]">{formData.resume_url ? 'Uploaded' : 'Not uploaded'}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] text-[#15171C] dark:text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3FF] dark:hover:bg-[#2563EB]/20 transition-colors">
                      {formData.resume_url ? 'Replace' : 'Upload'}
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, 'documents', 'resume_url')} />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-[#ECEAE5] dark:border-[#2A2B32] rounded-xl bg-[#F7F6F3] dark:bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-[#15171C] rounded-lg flex items-center justify-center border border-[#ECEAE5] dark:border-[#2A2B32]">
                        <Award className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#15171C] dark:text-white text-sm">Key Certificate</p>
                        <p className="text-xs text-[#5B5E68]">{formData.certificate_url ? 'Uploaded' : 'Not uploaded'}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-[#15171C] border border-[#ECEAE5] dark:border-[#2A2B32] text-[#15171C] dark:text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      {formData.certificate_url ? 'Replace' : 'Upload'}
                      <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => handleFileUpload(e, 'documents', 'certificate_url')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
