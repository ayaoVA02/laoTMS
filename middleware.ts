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

  // Define roles that bypass onboarding.
  // We treat setup as "completed" if the user has an assigned role or the flag is true.
  const userRole = user?.user_metadata?.role?.toUpperCase()
  const bypassRoles = ['ADMIN', 'STAFF', 'TOURIST', 'ENTREPRENEUR']
  const hasBypassRole = !!userRole && bypassRoles.includes(userRole)
  const onboardingCompleted = user?.user_metadata?.onboarding_completed === true || hasBypassRole

  const isRoot = pathname === '/'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname.startsWith('/auth')
  const isProfileSetup = pathname.startsWith('/onboarding')
  const hasOAuthCode = request.nextUrl.searchParams.has('code')

  // Handle Authenticated Users
  if (isAuth) {
    if (onboardingCompleted) {
      // If setup is complete (or bypassed by role),
      // redirect away from Auth pages, Onboarding page, or the OAuth callback URL to Dashboard.
      // Allow access to root ('/') and dashboard ('/dashboard') if onboarding is complete.
      if (isAuthPage || isProfileSetup || hasOAuthCode) {
        const res = NextResponse.redirect(new URL('/dashboard', request.url))
        supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c))
        return res
      }
    } else {
      // If onboarding is NOT complete, force them to the onboarding page
      // from any other page (root, dashboard, auth pages, or OAuth callback),
      // unless they are already on the onboarding page.
      if ((isRoot || isAuthPage || isDashboard || hasOAuthCode) && !isProfileSetup) {
        const res = NextResponse.redirect(new URL('/onboarding', request.url))
        supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c))
        return res
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}