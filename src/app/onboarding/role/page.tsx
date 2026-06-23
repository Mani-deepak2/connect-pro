"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Briefcase, Building2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleContinue = async () => {
    if (!selectedRole) return
    setIsLoading(true)
    setError(null)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('users')
      .upsert({ 
        id: user.id, 
        email: user.email,
        role: selectedRole 
      }, { onConflict: 'id' })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    // Redirect to respective onboarding profile setup
    if (selectedRole === 'freelancer') {
      router.push('/onboarding/freelancer')
    } else {
      router.push('/onboarding/client')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-[#15171C] mb-4">How do you want to use ConnectPro?</h1>
          <p className="text-[#5B5E68] text-lg">Choose your primary role. Don't worry, you can always create another account later.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 text-sm p-4 rounded-xl mb-8 max-w-md mx-auto text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Freelancer Card */}
          <button 
            onClick={() => setSelectedRole('freelancer')}
            className={`text-left p-8 sm:p-10 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group bg-white ${
              selectedRole === 'freelancer' 
                ? 'border-[#2563EB] shadow-xl shadow-blue-500/10 scale-[1.02]' 
                : 'border-[#ECEAE5] hover:border-[#2563EB]/40 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              selectedRole === 'freelancer' ? 'bg-[#2563EB] text-white' : 'bg-[#EEF3FF] text-[#2563EB]'
            }`}>
              <Briefcase className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#15171C] mb-3">I'm a Freelancer</h2>
            <p className="text-[#5B5E68] leading-relaxed">Find projects and earn money by providing your professional skills to clients worldwide.</p>
          </button>

          {/* Client Card */}
          <button 
            onClick={() => setSelectedRole('client')}
            className={`text-left p-8 sm:p-10 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group bg-white ${
              selectedRole === 'client' 
                ? 'border-[#2563EB] shadow-xl shadow-blue-500/10 scale-[1.02]' 
                : 'border-[#ECEAE5] hover:border-[#2563EB]/40 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              selectedRole === 'client' ? 'bg-[#2563EB] text-white' : 'bg-[#EEF3FF] text-[#2563EB]'
            }`}>
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#15171C] mb-3">I'm a Client</h2>
            <p className="text-[#5B5E68] leading-relaxed">Hire professionals and manage projects to build out your ideas and grow your business.</p>
          </button>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="bg-[#15171C] hover:bg-[#2563EB] disabled:bg-[#15171C]/30 text-white font-semibold text-lg py-4 px-12 rounded-full transition-all flex items-center shadow-lg shadow-black/10"
          >
            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}
