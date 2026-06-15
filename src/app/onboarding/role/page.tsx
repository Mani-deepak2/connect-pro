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
      .update({ role: selectedRole })
      .eq('id', user.id)

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
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">How do you want to use ConnectPro?</h1>
          <p className="text-gray-400 text-lg">Choose your primary role. Don't worry, you can always create another account later.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl mb-8 max-w-md mx-auto text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Freelancer Card */}
          <button 
            onClick={() => setSelectedRole('freelancer')}
            className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              selectedRole === 'freelancer' 
                ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${
              selectedRole === 'freelancer' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 group-hover:text-white'
            }`}>
              <Briefcase className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">I'm a Freelancer</h2>
            <p className="text-gray-400 leading-relaxed">Find projects and earn money by providing your professional skills to clients worldwide.</p>
          </button>

          {/* Client Card */}
          <button 
            onClick={() => setSelectedRole('client')}
            className={`text-left p-8 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
              selectedRole === 'client' 
                ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' 
                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${
              selectedRole === 'client' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 group-hover:text-white'
            }`}>
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">I'm a Client</h2>
            <p className="text-gray-400 leading-relaxed">Hire professionals and manage projects to build out your ideas and grow your business.</p>
          </button>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="bg-white text-black hover:bg-gray-200 disabled:bg-white/20 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-lg py-4 px-12 rounded-full transition-all flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  )
}
