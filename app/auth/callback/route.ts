// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Use env var instead of origin from request
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      const userRole = user?.user_metadata?.role?.toUpperCase()
      const bypassRoles = ['ADMIN', 'STAFF', 'TOURIST', 'ENTREPRENEUR']
      const hasBypassRole = !!userRole && bypassRoles.includes(userRole)
      const onboardingCompleted =
        user?.user_metadata?.onboarding_completed === true || hasBypassRole

      const redirectUrl = onboardingCompleted
        ? `${siteUrl}/dashboard`
        : `${siteUrl}/onboarding`

    return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?error=oauth_failed`)
}