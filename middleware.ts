import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ IMPORTANT: must call getUser() to refresh session cookies
  // This also handles the OAuth code exchange automatically
  const { data: { user } } = await supabase.auth.getUser()
  const isAuth = !!user
  const pathname = request.nextUrl.pathname
  // Check if onboarding is completed via metadata flag
  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true

  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname.startsWith('/auth')
  const isProfileSetup = pathname.startsWith('/onboarding')

  // 1. If authenticated but onboarding is NOT completed, force them to onboarding ONLY IF trying to access dashboard
  // This allows users to browse public pages (Home, Attractions, etc.) even if they haven't finished setup.
  if (isAuth && !onboardingCompleted && isDashboard && !isProfileSetup) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  console.log("-------------------start--------------------------")
  console.log("isAUTH:", isAuth)
  console.log("onboardingCompleted:", onboardingCompleted)
  console.log("isDashboard:", isDashboard)
  console.log("isAuthPage:", isAuthPage)
    console.log("------------------end---------------------------")


  if (!isAuth && isDashboard) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 2. If authenticated and onboarding IS completed, don't let them go back to login or onboarding
  if (isAuth && onboardingCompleted && (isAuthPage || isProfileSetup)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // ✅ Must return supabaseResponse (not NextResponse.next())
  // so the refreshed session cookies are passed to the browser
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}