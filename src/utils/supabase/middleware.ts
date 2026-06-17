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

  const pathname = request.nextUrl.pathname

  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/signup') || 
                      pathname.startsWith('/forgot-password')
  
  // 1. If not logged in, redirect to login for all protected routes
  if (!user && !isAuthRoute && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Fetch role ONCE to avoid multiple DB round-trips
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = userData?.role

    console.log(`[Middleware] Path: ${pathname}, User: ${user.id}, Role: ${role}`)

    // 2. If accessing auth routes while logged in, redirect to the right place
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      if (role === 'freelancer') url.pathname = '/freelancer/dashboard'
      else if (role === 'client') url.pathname = '/client/dashboard'
      else url.pathname = '/onboarding/role'
      return NextResponse.redirect(url)
    }

    // 3. Block access to ALL onboarding pages if user already has a role + completed profile
    if (pathname.startsWith('/onboarding/')) {
      
      // Always allow /onboarding/role if no role yet
      if (pathname === '/onboarding/role' && !role) {
        return supabaseResponse // let them through
      }

      // If user has role=freelancer and tries to visit /onboarding/freelancer,
      // check if they already have a profile. If yes, redirect to dashboard.
      if (role === 'freelancer') {
        if (pathname === '/onboarding/role') {
          const url = request.nextUrl.clone()
          url.pathname = '/freelancer/dashboard'
          return NextResponse.redirect(url)
        }
        if (pathname === '/onboarding/freelancer') {
          const { data: profileData } = await supabase
            .from('freelancer_profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()
          
          console.log(`[Middleware] Freelancer profile check:`, profileData)
          
          if (profileData) {
            // Profile already exists — send them to dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/freelancer/dashboard'
            return NextResponse.redirect(url)
          }
          // No profile yet — let them proceed with onboarding
          return supabaseResponse
        }
      }

      if (role === 'client') {
        if (pathname === '/onboarding/role') {
          const url = request.nextUrl.clone()
          url.pathname = '/client/dashboard'
          return NextResponse.redirect(url)
        }
        if (pathname === '/onboarding/client') {
          const { data: profileData } = await supabase
            .from('client_profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle()

          console.log(`[Middleware] Client profile check:`, profileData)
          
          if (profileData) {
            const url = request.nextUrl.clone()
            url.pathname = '/client/dashboard'
            return NextResponse.redirect(url)
          }
          return supabaseResponse
        }
      }
    }

    // 4. Protect client dashboard from non-clients
    if (pathname.startsWith('/client/')) {
      if (role !== 'client') {
        const url = request.nextUrl.clone()
        url.pathname = role === 'freelancer' ? '/freelancer/dashboard' : '/onboarding/role'
        return NextResponse.redirect(url)
      }
    }

    // 5. Protect freelancer dashboard from non-freelancers
    if (pathname.startsWith('/freelancer/')) {
      if (role !== 'freelancer') {
        const url = request.nextUrl.clone()
        url.pathname = role === 'client' ? '/client/dashboard' : '/onboarding/role'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
