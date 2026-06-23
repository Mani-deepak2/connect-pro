"use client"
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (data: SignUpFormValues) => {
    setError(null)
    
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6 w-full relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white border border-[#ECEAE5] rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/5 text-center relative z-10"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-[#15171C] mb-2">Check your email</h2>
          <p className="text-[#5B5E68] mb-8 leading-relaxed">
            We've sent a verification link to your email address. Please verify your account to continue.
          </p>
          <Link 
            href="/login"
            className="inline-block w-full bg-[#15171C] hover:bg-[#2563EB] text-white font-semibold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-black/10"
          >
            Return to Login
          </Link>
        </motion.div>
      </div>
    )
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
          <h1 className="text-3xl font-display font-bold text-[#15171C] mb-2">Create an account</h1>
          <p className="text-[#5B5E68]">Join ConnectPro to start your journey</p>
        </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 text-sm p-4 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
            <input 
              {...register('fullName')}
              className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
            <input 
              {...register('email')}
              className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
            <input 
              type={showPassword ? "text" : "password"} 
              {...register('password')}
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
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#15171C] mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8D96]" />
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              {...register('confirmPassword')}
              className="w-full bg-white border border-[#ECEAE5] text-[#15171C] rounded-xl pl-11 pr-12 py-3.5 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#8A8D96]"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8D96] hover:text-[#15171C] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#15171C] hover:bg-[#2563EB] disabled:bg-[#15171C]/50 text-white font-semibold py-3.5 rounded-full mt-6 transition-all shadow-lg shadow-black/10 flex items-center justify-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
        </button>
      </form>

      <p className="mt-8 text-center text-[#5B5E68] text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-[#2563EB] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
      </motion.div>
    </div>
  )
}
