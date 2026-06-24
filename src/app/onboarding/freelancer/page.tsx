"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, ChevronRight, ChevronLeft, Check, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

interface FreelancerFormData {
  username: string;
  professional_title: string;
  skills: string;
  experience_level: string;
  hourly_rate: number;
  portfolio_url: string;
  bio: string;
}

export default function FreelancerOnboarding() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FreelancerFormData>()

  const nextStep = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['username', 'professional_title'])
    if (step === 2) isValid = await trigger(['skills', 'experience_level'])
    if (step === 3) isValid = await trigger(['hourly_rate', 'portfolio_url'])
    if (isValid) setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => s - 1)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfileImage(url)
    }
  }

  const onSubmit = async (data: FreelancerFormData) => {
    setIsLoading(true)
    setError(null)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[Freelancer Onboarding] Auth User:', user?.id, 'Auth Error:', authError)
    
    if (!user) {
      router.push('/login')
      return
    }

    // Check username uniqueness
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      setError('Username is already taken. Please choose another.')
      setIsLoading(false)
      return
    }

    // Update username in public.users
    await supabase.from('users').update({ username: data.username }).eq('id', user.id)

    const profilePayload = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      username: data.username,
      title: data.professional_title,
      skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      bio: data.bio,
      hourly_rate: Number(data.hourly_rate),
      experience_level: data.experience_level,
      portfolio_link: data.portfolio_url || null,
      profile_image: profileImage,
    }

    console.log('[Freelancer Onboarding] Saving profile payload:', profilePayload)

    const { data: savedProfile, error: insertError } = await supabase
      .from('freelancer_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' })
      .select()
      .single()

    console.log('[Freelancer Onboarding] Saved profile:', savedProfile, 'Error:', insertError)

    if (insertError) {
      console.error('[Freelancer Onboarding] UPSERT FAILED:', insertError)
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    // Verify the record was actually written
    const { data: verifyData, error: verifyError } = await supabase
      .from('freelancer_profiles')
      .select('user_id, title, full_name')
      .eq('user_id', user.id)
      .single()

    console.log('[Freelancer Onboarding] Verification read:', verifyData, 'Error:', verifyError)

    if (verifyError || !verifyData) {
      setError('Profile was saved but could not be verified. Please try again.')
      setIsLoading(false)
      return
    }

    // Use replace so the user cannot press Back and return to onboarding
    router.replace('/freelancer/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center py-12 px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-display font-bold text-[#15171C]">Professional Profile</h1>
            <span className="text-[#5B5E68] font-semibold">Step {step} of 4</span>
          </div>
          <div className="w-full h-2 bg-[#ECEAE5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2563EB]"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 rounded-full bg-[#F7F6F3] border border-[#ECEAE5] flex items-center justify-center overflow-hidden mb-4">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-[#8A8D96]" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-[#F7F6F3] hover:bg-[#ECEAE5] text-[#15171C] font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-[#ECEAE5]">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  </div>
  
                  <div>
                    <label className="block text-sm font-semibold text-[#15171C] mb-2">Username</label>
                    <input 
                      {...register('username', { required: 'Username is required', pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' } })}
                      placeholder="e.g. johndoe" 
                      className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl px-4 py-3 text-[#15171C] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all" 
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#15171C] mb-2">Professional Title</label>
                    <input 
                    {...register('professional_title', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                  {errors.professional_title && <span className="text-red-500 text-xs mt-1.5 block">{errors.professional_title.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Skills (comma separated)</label>
                  <input 
                    {...register('skills', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="React, Node.js, UI/UX Design"
                  />
                  {errors.skills && <span className="text-red-500 text-xs mt-1.5 block">{errors.skills.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Experience Level</label>
                  <select 
                    {...register('experience_level')}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Hourly Rate ($)</label>
                  <input 
                    type="number"
                    {...register('hourly_rate', { required: 'Required', min: 1 })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="50"
                  />
                  {errors.hourly_rate && <span className="text-red-500 text-xs mt-1.5 block">{errors.hourly_rate.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Portfolio Website</label>
                  <input 
                    {...register('portfolio_url')}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="https://myportfolio.com"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Professional Bio</label>
                  <textarea 
                    {...register('bio', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96] h-32 resize-none"
                    placeholder="Tell clients about your expertise, experience, and what you can deliver..."
                  />
                  {errors.bio && <span className="text-red-500 text-xs mt-1.5 block">{errors.bio.message}</span>}
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-[#ECEAE5]">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="bg-[#F7F6F3] hover:bg-[#ECEAE5] text-[#15171C] font-semibold py-3 px-6 rounded-full transition-colors flex items-center border border-[#ECEAE5]"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center shadow-lg shadow-black/10"
                >
                  Next <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/50 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
