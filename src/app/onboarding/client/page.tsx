"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, ChevronRight, ChevronLeft, Check } from 'lucide-react'
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
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase
      .from('client_profiles')
      .upsert({
        user_id: user.id,
        company_name: data.company_name,
        industry: data.industry,
        company_website: data.company_website,
        company_description: data.company_description,
        company_logo: companyLogo,
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/client/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Company Profile</h1>
            <span className="text-gray-400">Step {step} of 3</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500"
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
                  <div className="relative w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden mb-4">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Company Name</label>
                  <input 
                    {...register('company_name', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Acme Corp"
                  />
                  {errors.company_name && <span className="text-red-400 text-xs">{errors.company_name.message}</span>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Industry</label>
                  <input 
                    {...register('industry', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="e.g. Technology, Healthcare, Finance"
                  />
                  {errors.industry && <span className="text-red-400 text-xs">{errors.industry.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Company Website</label>
                  <input 
                    {...register('company_website')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="https://acmecorp.com"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Company Description</label>
                  <textarea 
                    {...register('company_description', { required: 'Required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 resize-none"
                    placeholder="Describe your company, mission, and the type of projects you post..."
                  />
                  {errors.company_description && <span className="text-red-400 text-xs">{errors.company_description.message}</span>}
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
                  className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-xl transition-colors flex items-center"
                >
                  Next <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white py-3 px-8 rounded-xl transition-colors flex items-center disabled:opacity-50"
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
