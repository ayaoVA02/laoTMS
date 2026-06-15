// app/api/logout/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 🚨 จุดสำคัญ: บน Next.js ตัวแปร cookies() ต้องมีคำสั่ง await นำหน้าเสมอ
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // ใน Server Component/Route บางจังหวะการเขียนคุกกี้กลับอาจจะโดนปฏิเสธ 
              // ใส่ try-catch ครอบตรงนี้ไว้เพื่อไม่ให้ฟังก์ชันพังกลางคัน

              console.error('Error setting cookies in API route:', error)
            }
          },
        },
      }
    )

    // 1. สั่งยกเลิก Session บนระบบ Cloud ของ Supabase
    await supabase.auth.signOut()

    // 2. บังคับลบคุกกี้ตระกูล sb- (ตั๋วของ Supabase) ที่ค้างอยู่ในเบราว์เซอร์ทิ้งให้เกลี้ยง
    const allCookies = cookieStore.getAll()
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-')) {
        cookieStore.set(cookie.name, '', {
          path: '/',
          expires: new Date(0), // ตั้งเวลาหมดอายุเป็นอดีต เพื่อบังคับลบ
          maxAge: 0,
        })
      }
    })

    // คืนค่ากลับไปบอก Zustand ว่าลบสำเร็จแล้วนะ
    return NextResponse.json({ success: true })

  } catch (error: any) {
    // ถ้าโค้ดพัง จะพ่นสาเหตุออกมาดูในแท็บ Network แทนที่จะขึ้น 500 เปล่าๆ
    console.error('API Logout Error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}