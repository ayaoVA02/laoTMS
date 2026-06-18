// app/api/admin/users/route.ts
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ Service role client — server-side only, never exposed to browser
const supabaseAdmin = serviceKey 
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

  console.log("In API")
export async function GET() {
  if (!supabaseAdmin) {
    console.error("ADMIN_API: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // ── Guard: only ADMIN role can call this ──────────────────────────────────
  try {
    const serverClient = await createSupabaseServerClient();
    const { data: { user: callerUser } } = await serverClient.auth.getUser()
    
    if (!callerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const callerRole = callerUser.user_metadata?.role;
    if (callerRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch (err) {
    console.error('ADMIN_API: Auth guard crash:', err);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 })
  }

  // ── Fetch all auth users ───────────────────────────────────────────────────
  try {
    // listUsers is paginated — fetch all pages
    const allUsers: any[] = []
    let page = 1
    const perPage = 1000

    while (true) {
     const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

      if (error) {
        console.error('ADMIN_API: Error listing users from auth.admin:', error);
        throw error;
      }
      allUsers.push(...(data.users ?? []))
      if ((data.users ?? []).length < perPage) break
      page++
    }
    console.log(`ADMIN_API: Fetched ${allUsers.length} auth users.`);

    // ── Fetch profile rows for extra fields (phone, profile_img, status) ─────
    console.log("In API: Fetching profile data from role-specific tables.");
    const [{ data: staffRows }, { data: entRows }, { data: touristRows }] =
      await Promise.all([
        supabaseAdmin.from('staffs').select('user_id, first_name, last_name, phone, profile_img, status, staff_code'),
        supabaseAdmin.from('entrepreneurs').select('user_id, first_name, last_name, phone, profile_img, position'),
        supabaseAdmin.from('tourists').select('user_id, first_name, last_name, phone, profile_img'),
      ])

    // Create lookup maps. We use user_id because that's the foreign key from auth.users
    const staffMap = Object.fromEntries((staffRows ?? []).map(r => [r.user_id, r]))
    const entMap   = Object.fromEntries((entRows   ?? []).map(r => [r.user_id, r]))
    const touristMap = Object.fromEntries((touristRows ?? []).map(r => [r.user_id, r]))
    // if (staffError) console.error('ADMIN_API: Error fetching staffs:', staffError);
    // if (entError) console.error('ADMIN_API: Error fetching entrepreneurs:', entError);
    // if (touristError) console.error('ADMIN_API: Error fetching tourists:', touristError);

    const mapped = allUsers.map(u => {
      const meta = u.user_metadata ?? {}
      const role: string = meta.role ?? 'TOURIST'

      const profile =
        role === 'STAFF'        ? staffMap[u.id] :
        role === 'ENTREPRENEUR' ? entMap[u.id]   :
        role === 'ADMIN'        ? staffMap[u.id] : // admins also in staffs
                                  touristMap[u.id]

      const firstName = meta.first_name ?? (profile as any)?.first_name ?? ''
      const lastName  = meta.last_name  ?? profile?.last_name  ?? ''
      const name = meta.full_name ?? (`${firstName} ${lastName}`.trim() || u.email?.split('@')[0] || 'Unknown')
        

      return {
        id:          u.id,
        email:       u.email ?? '',
        name,
        role,
        avatar:      profile?.profile_img || meta.avatar_url || meta.picture || '',
        phone:       profile?.phone ?? '',
        isActive:    meta.is_active ?? true,
        provider:    (u.app_metadata?.providers ?? [u.app_metadata?.provider ?? 'email']).join(', '),
        createdAt:   u.created_at,
        lastSignIn:  u.last_sign_in_at ?? null,
        // extra per-role fields
        staffCode:   role === 'STAFF' || role === 'ADMIN' ? (staffMap[u.id]?.staff_code ?? '') : '',
        staffStatus: role === 'STAFF' || role === 'ADMIN' ? (staffMap[u.id]?.status ?? 'active') : null,
        position:    role === 'ENTREPRENEUR' ? (entMap[u.id]?.position ?? '') : '',
        hasProfile:  !!profile,
      }
    })
    console.log(`ADMIN_API: Mapped ${mapped.length} users.`);

    return NextResponse.json({ users: mapped, total: mapped.length })
  } catch (err: any) {
    console.error('ADMIN_API: Data fetch error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error during data fetch' }, { status: 500 })
  }
}

// ── PATCH — update user active status ─────────────────────────────────────────
export async function PATCH(request: Request) {
  console.log("In API: PATCH request received.");
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client");
    
    const serverClient = await createSupabaseServerClient();
    const { data: { user: callerUser }, error: authError } = await serverClient.auth.getUser()
    if (authError) {
      console.error('ADMIN_API: Error getting caller user for PATCH:', authError);
      return NextResponse.json({ error: 'Authentication failed for PATCH: Could not retrieve user.' }, { status: 500 });
    }
    
    if (!callerUser || callerUser.user_metadata?.role !== 'ADMIN') {
      console.warn(`ADMIN_API: Forbidden PATCH access attempt - user ${callerUser?.id} has role ${callerUser?.user_metadata?.role}.`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch (err) {
    console.error('ADMIN_API: PATCH auth guard crash:', err);
    return NextResponse.json({ error: `Authentication failed for PATCH: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }

  const { userId, isActive } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_active: isActive },
  })
  if (error) {
    console.error(`ADMIN_API: Error updating user ${userId} status:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

// ── DELETE — delete user from auth ────────────────────────────────────────────
export async function DELETE(request: Request) {
  console.log("In API: DELETE request received.");
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client");

    const serverClient = await createSupabaseServerClient();
    const { data: { user: callerUser }, error: authError } = await serverClient.auth.getUser()
    if (authError) {
      console.error('ADMIN_API: Error getting caller user for DELETE:', authError);
      return NextResponse.json({ error: 'Authentication failed for DELETE: Could not retrieve user.' }, { status: 500 });
    }
    if (!callerUser || callerUser.user_metadata?.role !== 'ADMIN') {
      console.warn(`ADMIN_API: Forbidden DELETE access attempt - user ${callerUser?.id} has role ${callerUser?.user_metadata?.role}.`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch (err) {
    console.error('ADMIN_API: DELETE auth guard crash:', err);
    return NextResponse.json({ error: `Authentication failed for DELETE: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Deleting from auth.users cascades to profile tables (you have ON DELETE CASCADE)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error(`ADMIN_API: Error deleting user ${userId}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}