import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') || 
                      request.nextUrl.pathname.startsWith('/forgot-password')
  
  // Protect all routes except home '/' and auth routes
  if (!user && !isAuthRoute && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // If accessing an auth route while logged in, redirect based on role
    if (isAuthRoute) {
       const url = request.nextUrl.clone()
       const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
       
       if (userData?.role === 'freelancer') {
         url.pathname = '/freelancer/dashboard'
       } else if (userData?.role === 'client') {
         url.pathname = '/client/dashboard'
       } else {
         url.pathname = '/onboarding/role'
       }
       return NextResponse.redirect(url)
    }

    // Protect client dashboard from non-clients
    if (request.nextUrl.pathname.startsWith('/client/')) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'client') {
            const url = request.nextUrl.clone()
            url.pathname = userData?.role === 'freelancer' ? '/freelancer/dashboard' : '/onboarding/role'
            return NextResponse.redirect(url)
        }
    }

    // Protect freelancer dashboard from non-freelancers
    if (request.nextUrl.pathname.startsWith('/freelancer/')) {
        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (userData?.role !== 'freelancer') {
            const url = request.nextUrl.clone()
            url.pathname = userData?.role === 'client' ? '/client/dashboard' : '/onboarding/role'
            return NextResponse.redirect(url)
        }
    }
  }

  return supabaseResponse
}
