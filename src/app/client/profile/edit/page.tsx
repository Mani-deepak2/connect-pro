"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Camera, Check, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

interface ClientFormData {
  company_name: string;
  industry: string;
  company_size: string;
  location: string;
  company_website: string;
  company_description: string;
  linkedin_url: string;
  twitter_url: string;
}

export default function EditCompanyProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyBanner, setCompanyBanner] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data && !error) {
      reset({
        company_name: data.company_name || '',
        industry: data.industry || '',
        company_size: data.company_size || '1-10',
        location: data.location || '',
        company_website: data.company_website || '',
        company_description: data.company_description || '',
        linkedin_url: data.linkedin_url || '',
        twitter_url: data.twitter_url || '',
      })
      if (data.company_logo) setCompanyLogo(data.company_logo)
      else if (data.logo) setCompanyLogo(data.logo)
      
      if (data.company_banner) setCompanyBanner(data.company_banner)
    }
    setIsLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setCompanyLogo(URL.createObjectURL(file))
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setCompanyBanner(URL.createObjectURL(file))
  }

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const profilePayload = {
      user_id: user.id,
      company_name: data.company_name,
      industry: data.industry || null,
      company_size: data.company_size || null,
      location: data.location || null,
      company_website: data.company_website || null,
      company_description: data.company_description,
      linkedin_url: data.linkedin_url || null,
      twitter_url: data.twitter_url || null,
      company_logo: companyLogo,
      logo: companyLogo,
      company_banner: companyBanner,
    }

    const { error: insertError } = await supabase
      .from('client_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.refresh()
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    }
    setIsSaving(false)
  }

  return (
    <div className="p-6 md:p-10 text-[#15171C] max-w-4xl mx-auto">
      <header className="mb-8">
        <Link href="/client/profile" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Company Profile</h1>
            <p className="text-gray-500">Update your company details and public presence.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/client/profile" className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 text-sm p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm p-4 rounded-xl mb-6">
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Visuals Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company Visuals</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Company Banner</label>
                <div className="relative w-full h-40 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group hover:border-teal-400 transition-colors">
                  {companyBanner ? (
                    <>
                      <img src={companyBanner} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm">
                          Change Banner
                          <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center text-gray-500 hover:text-teal-600 transition-colors">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Banner Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Company Logo</label>
                  <div className="relative w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden group">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors inline-block">
                    Change Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 256x256px</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name *</label>
                <input 
                  {...register('company_name', { required: 'Required' })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {errors.company_name && <span className="text-red-500 text-xs mt-1 block">{errors.company_name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Industry *</label>
                <input 
                  {...register('industry', { required: 'Required' })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {errors.industry && <span className="text-red-500 text-xs mt-1 block">{errors.industry.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Company Size</label>
                <select 
                  {...register('company_size')}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                <input 
                  {...register('location')}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Company Website</label>
              <input 
                {...register('company_website')}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">About Company *</label>
              <textarea 
                {...register('company_description', { required: 'Required' })}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all h-32 resize-none"
                placeholder="Describe your mission and what you're building..."
              />
              {errors.company_description && <span className="text-red-500 text-xs mt-1 block">{errors.company_description.message}</span>}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Social Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">LinkedIn URL</label>
                <input 
                  {...register('linkedin_url')}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Twitter/X URL</label>
                <input 
                  {...register('twitter_url')}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link 
              href="/client/profile"
              className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center shadow-md shadow-teal-500/20"
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
