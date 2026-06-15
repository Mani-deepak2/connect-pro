"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

interface FreelancerFormData {
  full_name: string;
  professional_title: string;
  skills: string;
  experience_level: string;
  hourly_rate: number;
  bio: string;
  portfolio_link: string;
}

export default function FreelancerOnboarding() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FreelancerFormData>({
    defaultValues: {
      experience_level: 'intermediate'
    }
  })

  const nextStep = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['full_name', 'professional_title'])
    if (step === 2) isValid = await trigger(['skills', 'hourly_rate', 'experience_level'])
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
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase
      .from('freelancer_profiles')
      .upsert({
        user_id: user.id,
        full_name: data.full_name,
        professional_title: data.professional_title,
        skills: data.skills.split(',').map(s => s.trim()),
        bio: data.bio,
        hourly_rate: data.hourly_rate,
        experience_level: data.experience_level,
        portfolio_link: data.portfolio_link,
        profile_image: profileImage,
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/freelancer/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Complete your profile</h1>
            <span className="text-gray-400">Step {step} of 3</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden mb-4">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <input 
                    {...register('full_name', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="John Doe"
                  />
                  {errors.full_name && <span className="text-red-400 text-xs">{errors.full_name.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Professional Title</label>
                  <input 
                    {...register('professional_title', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="e.g. Senior Full Stack Developer"
                  />
                  {errors.professional_title && <span className="text-red-400 text-xs">{errors.professional_title.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Skills (comma separated)</label>
                  <input 
                    {...register('skills', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="React, Node.js, UI/UX Design"
                  />
                  {errors.skills && <span className="text-red-400 text-xs">{errors.skills.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Experience Level</label>
                  <select 
                    {...register('experience_level')}
                    className="w-full bg-[#15171C] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Hourly Rate ($)</label>
                  <input 
                    type="number"
                    {...register('hourly_rate', { required: 'Required', min: 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="50"
                  />
                  {errors.hourly_rate && <span className="text-red-400 text-xs">{errors.hourly_rate.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Professional Bio</label>
                  <textarea 
                    {...register('bio', { required: 'Required', minLength: 50 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                    placeholder="Tell clients about yourself, your background, and why they should hire you..."
                  />
                  {errors.bio && <span className="text-red-400 text-xs">Bio is required (min 50 chars)</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Portfolio Link</label>
                  <input 
                    {...register('portfolio_link')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="bg-white/5 hover:bg-white/10 text-white py-3 px-6 rounded-xl transition-colors flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> Back
                </button>
              ) : <div></div>}

              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-xl transition-colors flex items-center"
                >
                  Next <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-xl transition-colors flex items-center disabled:opacity-50"
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
