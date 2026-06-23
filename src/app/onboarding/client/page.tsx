"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, ChevronRight, ChevronLeft, Check, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

interface ClientFormData {
  company_name: string;
  industry: string;
  company_website: string;
  company_description: string;
}

export default function ClientOnboarding() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors }, trigger } = useForm<ClientFormData>()

  const nextStep = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['company_name'])
    if (step === 2) isValid = await trigger(['industry', 'company_website'])
    if (isValid) setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => s - 1)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCompanyLogo(url)
    }
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    setError(null)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[Client Onboarding] Auth User:', user?.id, 'Auth Error:', authError)
    
    if (!user) {
      router.push('/login')
      return
    }

    const profilePayload = {
      user_id: user.id,
      company_name: data.company_name,
      industry: data.industry || null,
      company_website: data.company_website || null,
      company_description: data.company_description,
      company_logo: companyLogo,
      logo: companyLogo,
    }

    console.log('[Client Onboarding] Saving profile payload:', profilePayload)

    const { data: savedProfile, error: insertError } = await supabase
      .from('client_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' })
      .select()
      .single()

    console.log('[Client Onboarding] Saved profile:', savedProfile, 'Error:', insertError)

    if (insertError) {
      console.error('[Client Onboarding] UPSERT FAILED:', insertError)
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    // Use replace so the user cannot press Back and return to onboarding
    router.replace('/client/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center py-12 px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-display font-bold text-[#15171C]">Company Profile</h1>
            <span className="text-[#5B5E68] font-semibold">Step {step} of 3</span>
          </div>
          <div className="w-full h-2 bg-[#ECEAE5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2563EB]"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
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
                  <div className="relative w-24 h-24 rounded-2xl bg-[#F7F6F3] border border-[#ECEAE5] flex items-center justify-center overflow-hidden mb-4">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-[#8A8D96]" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-[#F7F6F3] hover:bg-[#ECEAE5] text-[#15171C] font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-[#ECEAE5]">
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Company Name</label>
                  <input 
                    {...register('company_name', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="Acme Corp"
                  />
                  {errors.company_name && <span className="text-red-500 text-xs mt-1.5 block">{errors.company_name.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Industry</label>
                  <input 
                    {...register('industry', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="e.g. Technology, Healthcare, Finance"
                  />
                  {errors.industry && <span className="text-red-500 text-xs mt-1.5 block">{errors.industry.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Company Website</label>
                  <input 
                    {...register('company_website')}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                    placeholder="https://acmecorp.com"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#15171C] mb-2">Company Description</label>
                  <textarea 
                    {...register('company_description', { required: 'Required' })}
                    className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96] h-32 resize-none"
                    placeholder="Describe your company, mission, and the type of projects you post..."
                  />
                  {errors.company_description && <span className="text-red-500 text-xs mt-1.5 block">{errors.company_description.message}</span>}
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

              {step < 3 ? (
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
