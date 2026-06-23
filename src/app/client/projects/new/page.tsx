"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  required_skills: string;
  budget_type: 'fixed' | 'hourly';
  budget_amount: number;
  duration: string;
  experience_level: string;
  deadline: string;
}

const CATEGORIES = [
  "Video Editing", "Web Development", "AI Development", "Data Analysis", 
  "Graphic Design", "Content Writing", "Mobile Development", 
  "Digital Marketing", "UI/UX Design", "Other"
]

export default function PostProject() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      budget_type: 'fixed',
      experience_level: 'intermediate',
      duration: '1-4 weeks'
    }
  })

  const budgetType = watch('budget_type')

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase
      .from('projects')
      .insert({
        client_id: user.id,
        title: data.title,
        category: data.category,
        description: data.description,
        required_skills: data.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        budget_type: data.budget_type,
        budget_amount: data.budget_amount,
        duration: data.duration,
        experience_level: data.experience_level,
        deadline: data.deadline,
        status: 'open'
      })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push('/client/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/client/dashboard" className="inline-flex items-center text-[#5B5E68] hover:text-[#15171C] mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-display font-bold text-[#15171C] mb-8">Post a New Project</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#15171C]">Project Title</label>
              <input 
                {...register('title', { required: 'Required' })}
                className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                placeholder="e.g. Need a modern landing page designed"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Category</label>
                <select 
                  {...register('category', { required: 'Required' })}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Required Skills (comma separated)</label>
                <input 
                  {...register('required_skills', { required: 'Required' })}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  placeholder="React, Figma, Tailwind"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#15171C]">Project Description</label>
              <textarea 
                {...register('description', { required: 'Required', minLength: 50 })}
                className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] h-32 resize-none focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                placeholder="Describe your project requirements in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Budget Type</label>
                <select 
                  {...register('budget_type')}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">
                  {budgetType === 'fixed' ? 'Total Budget ($)' : 'Hourly Rate ($/hr)'}
                </label>
                <input 
                  type="number"
                  {...register('budget_amount', { required: 'Required', min: 1 })}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                  placeholder={budgetType === 'fixed' ? "1000" : "50"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Duration</label>
                <select 
                  {...register('duration')}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                >
                  <option value="< 1 week">Less than 1 week</option>
                  <option value="1-4 weeks">1 to 4 weeks</option>
                  <option value="1-3 months">1 to 3 months</option>
                  <option value="3-6 months">3 to 6 months</option>
                  <option value="6+ months">More than 6 months</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Experience Level</label>
                <select 
                  {...register('experience_level')}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#15171C]">Deadline</label>
                <input 
                  type="date"
                  {...register('deadline', { required: 'Required' })}
                  className="w-full bg-[#F7F6F3] border border-[#ECEAE5] rounded-xl py-3 px-4 text-[#15171C] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-[#ECEAE5]">
              <Link 
                href="/client/dashboard"
                className="bg-[#F7F6F3] hover:bg-[#ECEAE5] text-[#15171C] font-semibold py-3 px-6 rounded-full transition-colors border border-[#ECEAE5]"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Post Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
