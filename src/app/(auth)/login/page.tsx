"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/onboarding/role')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6 relative overflow-hidden w-full">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-[#ECEAE5] rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl leading-none mb-8">
            <span className="text-[#15171C]">Connect</span>
            <span className="text-[#2563EB]">Pro</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Welcome back</h1>
          <p className="text-[#5B5E68]">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#15171C] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-[#15171C]">Password</label>
              <Link href="/forgot-password" className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8D96] hover:text-[#15171C] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#15171C] hover:bg-[#2563EB] disabled:bg-[#15171C]/50 text-white font-semibold py-3.5 rounded-full transition-all flex items-center justify-center shadow-lg shadow-black/10 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#5B5E68] mt-8 text-sm">
          Don't have an account? <Link href="/signup" className="text-[#2563EB] font-semibold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  )
}
