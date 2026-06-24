// // app/api/admin/users/route.ts
// import { createClient } from '@supabase/supabase-js'
// import { createSupabaseServerClient } from '@/lib/supabase-server'
// import { NextResponse } from 'next/server'

// // Initialize Supabase Admin client
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// // ✅ Service role client — server-side only, never exposed to browser
// const supabaseAdmin = serviceKey 
//   ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
//   : null;

//   console.log("In API")
// export async function GET() {
//   if (!supabaseAdmin) {
//     console.error("ADMIN_API: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.");
//     return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
//   }

//   // ── Guard: only ADMIN role can call this ──────────────────────────────────
//   try {
//     const serverClient = await createSupabaseServerClient();
//     const { data: { user: callerUser } } = await serverClient.auth.getUser()
    
//     if (!callerUser) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const callerRole = callerUser.user_metadata?.role;
//     if (callerRole !== 'ADMIN') {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }
//   } catch (err) {
//     console.error('ADMIN_API: Auth guard crash:', err);
//     return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 })
//   }

//   // ── Fetch all auth users ───────────────────────────────────────────────────
//   try {
//     // listUsers is paginated — fetch all pages
//     const allUsers: any[] = []
//     let page = 1
//     const perPage = 1000

//     while (true) {
//      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

//       if (error) {
//         console.error('ADMIN_API: Error listing users from auth.admin:', error);
//         throw error;
//       }
//       allUsers.push(...(data.users ?? []))
//       if ((data.users ?? []).length < perPage) break
//       page++
//     }
//     console.log(`ADMIN_API: Fetched ${allUsers.length} auth users.`);

//     // ── Fetch profile rows for extra fields (phone, profile_img, status) ─────
//     console.log("In API: Fetching profile data from role-specific tables.");
//     const [{ data: staffRows }, { data: entRows }, { data: touristRows }] =
//       await Promise.all([
//         supabaseAdmin.from('staffs').select('user_id, first_name, last_name, phone, profile_img, status, staff_code'),
//         supabaseAdmin.from('entrepreneurs').select('user_id, first_name, last_name, phone, profile_img, position'),
//         supabaseAdmin.from('tourists').select('user_id, first_name, last_name, phone, profile_img'),
//       ])

//     // Create lookup maps. We use user_id because that's the foreign key from auth.users
//     const staffMap = Object.fromEntries((staffRows ?? []).map(r => [r.user_id, r]))
//     const entMap   = Object.fromEntries((entRows   ?? []).map(r => [r.user_id, r]))
//     const touristMap = Object.fromEntries((touristRows ?? []).map(r => [r.user_id, r]))
//     // if (staffError) console.error('ADMIN_API: Error fetching staffs:', staffError);
//     // if (entError) console.error('ADMIN_API: Error fetching entrepreneurs:', entError);
//     // if (touristError) console.error('ADMIN_API: Error fetching tourists:', touristError);

//     const mapped = allUsers.map(u => {
//       const meta = u.user_metadata ?? {}
//       const role: string = meta.role ?? 'TOURIST'

//       const profile =
//         role === 'STAFF'        ? staffMap[u.id] :
//         role === 'ENTREPRENEUR' ? entMap[u.id]   :
//         role === 'ADMIN'        ? staffMap[u.id] : // admins also in staffs
//                                   touristMap[u.id]

//       const firstName = meta.first_name ?? (profile as any)?.first_name ?? ''
//       const lastName  = meta.last_name  ?? profile?.last_name  ?? ''
//       const name = meta.full_name ?? (`${firstName} ${lastName}`.trim() || u.email?.split('@')[0] || 'Unknown')
        

//       return {
//         id:          u.id,
//         email:       u.email ?? '',
//         name,
//         role,
//         avatar:      profile?.profile_img || meta.avatar_url || meta.picture || '',
//         phone:       profile?.phone ?? '',
//         isActive:    meta.is_active ?? true,
//         provider:    (u.app_metadata?.providers ?? [u.app_metadata?.provider ?? 'email']).join(', '),
//         createdAt:   u.created_at,
//         lastSignIn:  u.last_sign_in_at ?? null,
//         // extra per-role fields
//         staffCode:   role === 'STAFF' || role === 'ADMIN' ? (staffMap[u.id]?.staff_code ?? '') : '',
//         staffStatus: role === 'STAFF' || role === 'ADMIN' ? (staffMap[u.id]?.status ?? 'active') : null,
//         position:    role === 'ENTREPRENEUR' ? (entMap[u.id]?.position ?? '') : '',
//         hasProfile:  !!profile,
//       }
//     })
//     console.log(`ADMIN_API: Mapped ${mapped.length} users.`);

//     return NextResponse.json({ users: mapped, total: mapped.length })
//   } catch (err: any) {
//     console.error('ADMIN_API: Data fetch error:', err)
//     return NextResponse.json({ error: err.message ?? 'Internal error during data fetch' }, { status: 500 })
//   }
// }

// // ── PATCH — update user active status ─────────────────────────────────────────
// export async function PATCH(request: Request) {
//   console.log("In API: PATCH request received.");
//   try {
//     if (!supabaseAdmin) throw new Error("Missing admin client");
    
//     const serverClient = await createSupabaseServerClient();
//     const { data: { user: callerUser }, error: authError } = await serverClient.auth.getUser()
//     if (authError) {
//       console.error('ADMIN_API: Error getting caller user for PATCH:', authError);
//       return NextResponse.json({ error: 'Authentication failed for PATCH: Could not retrieve user.' }, { status: 500 });
//     }
    
//     if (!callerUser || callerUser.user_metadata?.role !== 'ADMIN') {
//       console.warn(`ADMIN_API: Forbidden PATCH access attempt - user ${callerUser?.id} has role ${callerUser?.user_metadata?.role}.`);
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }
//   } catch (err) {
//     console.error('ADMIN_API: PATCH auth guard crash:', err);
//     return NextResponse.json({ error: `Authentication failed for PATCH: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
//   }

//   const { userId, isActive } = await request.json()
//   if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

//   const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
//     user_metadata: { is_active: isActive },
//   })
//   if (error) {
//     console.error(`ADMIN_API: Error updating user ${userId} status:`, error);
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
//   return NextResponse.json({ success: true })
// }

// // ── DELETE — delete user from auth ────────────────────────────────────────────
// export async function DELETE(request: Request) {
//   console.log("In API: DELETE request received.");
//   try {
//     if (!supabaseAdmin) throw new Error("Missing admin client");

//     const serverClient = await createSupabaseServerClient();
//     const { data: { user: callerUser }, error: authError } = await serverClient.auth.getUser()
//     if (authError) {
//       console.error('ADMIN_API: Error getting caller user for DELETE:', authError);
//       return NextResponse.json({ error: 'Authentication failed for DELETE: Could not retrieve user.' }, { status: 500 });
//     }
//     if (!callerUser || callerUser.user_metadata?.role !== 'ADMIN') {
//       console.warn(`ADMIN_API: Forbidden DELETE access attempt - user ${callerUser?.id} has role ${callerUser?.user_metadata?.role}.`);
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }
//   } catch (err) {
//     console.error('ADMIN_API: DELETE auth guard crash:', err);
//     return NextResponse.json({ error: `Authentication failed for DELETE: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
//   }

//   const { userId } = await request.json()
//   if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

//   // Deleting from auth.users cascades to profile tables (you have ON DELETE CASCADE)
//   const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
//   if (error) {
//     console.error(`ADMIN_API: Error deleting user ${userId}:`, error);
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
//   return NextResponse.json({ success: true })
// }



// import { createClient } from "@supabase/supabase-js";
// import { NextRequest, NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabase-server";

// // Initialize Supabase Admin client securely with Service Role Key
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// const supabaseAdmin = serviceKey
//   ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
//   : null;

// // Helper guard function to protect routes from non-admin accounts
// async function checkAdminGuard() {
//   const serverClient = await createSupabaseServerClient();
//   const { data: { user: callerUser } } = await serverClient.auth.getUser();

//   if (!callerUser) {
//     return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
//   }

//   const callerRole = callerUser.user_metadata?.role;
//   if (callerRole !== "ADMIN") {
//     return { authorized: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
//   }

//   return { authorized: true as const, callerId: callerUser.id };
// }

// // Check if user is banned using real future timestamps or string rules
// function isUserBanned(bannedUntil: string | null | undefined): boolean {
//   if (!bannedUntil || bannedUntil === "none") return false;
//   const until = new Date(bannedUntil).getTime();
//   return Number.isFinite(until) && until > Date.now();
// }

// export async function GET(req: NextRequest) {
//   try {
//     if (!supabaseAdmin) {
//       console.error("ADMIN_API: SUPABASE_SERVICE_ROLE_KEY is missing.");
//       return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
//     }

//     // 1. Authorization Guard
//     const guard = await checkAdminGuard();
//     if (!guard.authorized) return guard.response!;

//     // 2. Fetch all Auth users (with pagination handling)
//     const allUsers: any[] = [];
//     let page = 1;
//     const perPage = 1000;

//     try {
//       while (true) {
//         const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
//         if (authError) {
//           console.error("ADMIN_API: Auth service error listing users:", authError);
//           return NextResponse.json({ 
//             error: `Auth service rejected your API key. If using the new 'sb_secret_' format, switch to your 'Legacy service_role' key in your Supabase API settings. Internal: ${authError.message}` 
//           }, { status: 401 });
//         }

//         allUsers.push(...(data.users ?? []));
//         if ((data.users ?? []).length < perPage) break;
//         page++;
//       }
//     } catch (authException: any) {
//       console.error("ADMIN_API: Unhandled Auth loop exception:", authException);
//       return NextResponse.json({ error: `Auth API breakdown: ${authException.message}` }, { status: 500 });
//     }

//     // 3. Fetch from role-specific tables with defensive error handling to prevent 500 crashes
//     const [staffRes, entRes, touristRes] = await Promise.all([
//       supabaseAdmin.from("staffs").select("user_id, first_name, last_name, phone, profile_img, status, staff_code"),
//       supabaseAdmin.from("entrepreneurs").select("user_id, first_name, last_name, phone, profile_img, position"),
//       supabaseAdmin.from("tourists").select("user_id, first_name, last_name, phone, profile_img"),
//     ]);

//     // Handle structural database validation issues explicitly
//     if (staffRes.error) {
//       console.error("ADMIN_API: staffs table failure:", staffRes.error);
//       return NextResponse.json({ error: `Database setup problem: staffs table missing or inaccessible. (${staffRes.error.message})` }, { status: 500 });
//     }
//     if (entRes.error) {
//       console.error("ADMIN_API: entrepreneurs table failure:", entRes.error);
//       return NextResponse.json({ error: `Database setup problem: entrepreneurs table missing or inaccessible. (${entRes.error.message})` }, { status: 500 });
//     }
//     if (touristRes.error) {
//       console.error("ADMIN_API: tourists table failure:", touristRes.error);
//       return NextResponse.json({ error: `Database setup problem: tourists table missing or inaccessible. (${touristRes.error.message})` }, { status: 500 });
//     }

//     const staffRows = staffRes.data ?? [];
//     const entRows = entRes.data ?? [];
//     const touristRows = touristRes.data ?? [];

//     // Create rapid key/value map lookups using user_id safely
//     const staffMap = Object.fromEntries(staffRows.map(r => [r.user_id, r]));
//     const entMap = Object.fromEntries(entRows.map(r => [r.user_id, r]));
//     const touristMap = Object.fromEntries(touristRows.map(r => [r.user_id, r]));

//     // 4. Transform data structure to seamlessly match frontend types
//     const formattedUsers = allUsers.map((u) => {
//       const meta = u.user_metadata ?? {};
//       const role: string = (meta.role ?? "TOURIST").toUpperCase();

//       const profile =
//         role === "STAFF" ? staffMap[u.id] :
//         role === "ENTREPRENEUR" ? entMap[u.id] :
//         role === "ADMIN" ? staffMap[u.id] :
//         touristMap[u.id];

//       const firstName = meta.first_name ?? profile?.first_name ?? "";
//       const lastName = meta.last_name ?? profile?.last_name ?? "";
//       const name = meta.full_name || `${firstName} ${lastName}`.trim() || u.email?.split("@")[0] || "Unknown User";
//       const isActive = typeof meta.is_active === "boolean" ? meta.is_active : !isUserBanned(u.banned_until);

//       return {
//         id: u.id,
//         email: u.email ?? "",
//         name,
//         role,
//         avatar: profile?.profile_img || meta.avatar_url || meta.picture || "",
//         phone: u.phone || profile?.phone || "",
//         isActive,
//         provider: (u.app_metadata?.providers ?? [u.app_metadata?.provider ?? "email"]).join(", "),
//         createdAt: u.created_at,
//         lastSignIn: u.last_sign_in_at || null,
//         hasProfile: !!profile,
//         staffCode: role === "STAFF" || role === "ADMIN" ? (staffMap[u.id]?.staff_code ?? "") : undefined,
//         staffStatus: role === "STAFF" || role === "ADMIN" ? (staffMap[u.id]?.status ?? "active") : null,
//         position: role === "ENTREPRENEUR" ? (entMap[u.id]?.position ?? "") : undefined,
//       };
//     });

//     return NextResponse.json({ users: formattedUsers });
//   } catch (error: any) {
//     console.error("ADMIN_API GET Catch Fatal Error:", error);
//     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function PATCH(req: NextRequest) {
//   try {
//     if (!supabaseAdmin) throw new Error("Missing admin client configuration");

//     const guard = await checkAdminGuard();
//     if (!guard.authorized) return guard.response!;

//     const { userId, isActive } = await req.json();
//     if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
//     if (typeof isActive !== "boolean") {
//       return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
//     }

//     if (guard.callerId === userId && !isActive) {
//       return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
//     }

//     const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
//     if (fetchError) throw fetchError;
//     if (!existing?.user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     const banDuration = isActive ? "none" : "876000h";

//     const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
//       ban_duration: banDuration,
//       user_metadata: {
//         ...existing.user.user_metadata,
//         is_active: isActive,
//       },
//     });

//     if (error) throw error;
//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("ADMIN_API PATCH Error:", error);
//     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     if (!supabaseAdmin) throw new Error("Missing admin client configuration");

//     const guard = await checkAdminGuard();
//     if (!guard.authorized) return guard.response!;

//     const { userId } = await req.json();
//     if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

//     if (guard.callerId === userId) {
//       return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
//     }

//     const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
//     if (error) throw error;

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("ADMIN_API DELETE Error:", error);
//     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }









import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// Initialize Supabase Admin client securely with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Helper guard function to protect routes from non-admin accounts
async function checkAdminGuard() {
  const serverClient = await createSupabaseServerClient();
  const { data: { user: callerUser } } = await serverClient.auth.getUser();

  if (!callerUser) {
    return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const callerRole = callerUser.user_metadata?.role;
  if (callerRole !== "ADMIN") {
    return { authorized: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authorized: true as const, callerId: callerUser.id };
}

// Check if user is banned using real future timestamps or string rules
function isUserBanned(bannedUntil: string | null | undefined): boolean {
  if (!bannedUntil || bannedUntil === "none") return false;
  const until = new Date(bannedUntil).getTime();
  return Number.isFinite(until) && until > Date.now();
}

// ── GET — Fetch all users and aggregate profiles ─────────────────────────────
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error("ADMIN_API: SUPABASE_SERVICE_ROLE_KEY is missing.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const guard = await checkAdminGuard();
    if (!guard.authorized) return guard.response!;

    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;

    try {
      while (true) {
        const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (authError) {
          console.error("ADMIN_API: Auth service error listing users:", authError);
          return NextResponse.json({ 
            error: `Auth service rejected API key. ${authError.message}` 
          }, { status: 401 });
        }

        allUsers.push(...(data.users ?? []));
        if ((data.users ?? []).length < perPage) break;
        page++;
      }
    } catch (authException: any) {
      console.error("ADMIN_API: Unhandled Auth loop exception:", authException);
      return NextResponse.json({ error: `Auth API breakdown: ${authException.message}` }, { status: 500 });
    }

    const [staffRes, entRes, touristRes] = await Promise.all([
      supabaseAdmin.from("staffs").select("user_id, first_name, last_name, phone, profile_img, status, staff_code"),
      supabaseAdmin.from("entrepreneurs").select("user_id, first_name, last_name, phone, profile_img, position"),
      supabaseAdmin.from("tourists").select("user_id, first_name, last_name, phone, profile_img"),
    ]);

    if (staffRes.error || entRes.error || touristRes.error) {
      return NextResponse.json({ error: "Database profile tables setup configuration crash." }, { status: 500 });
    }

    const staffMap = Object.fromEntries((staffRes.data ?? []).map(r => [r.user_id, r]));
    const entMap = Object.fromEntries((entRes.data ?? []).map(r => [r.user_id, r]));
    const touristMap = Object.fromEntries((touristRes.data ?? []).map(r => [r.user_id, r]));

    const formattedUsers = allUsers.map((u) => {
      const meta = u.user_metadata ?? {};
      const role: string = (meta.role ?? "TOURIST").toUpperCase();

      const profile =
        role === "STAFF" ? staffMap[u.id] :
        role === "ENTREPRENEUR" ? entMap[u.id] :
        role === "ADMIN" ? staffMap[u.id] :
        touristMap[u.id];

      const firstName = meta.first_name ?? profile?.first_name ?? "";
      const lastName = meta.last_name ?? profile?.last_name ?? "";
      const name = meta.full_name || `${firstName} ${lastName}`.trim() || u.email?.split("@")[0] || "Unknown User";
      const isActive = typeof meta.is_active === "boolean" ? meta.is_active : !isUserBanned(u.banned_until);

      return {
        id: u.id,
        email: u.email ?? "",
        name,
        role,
        avatar: profile?.profile_img || meta.avatar_url || meta.picture || "",
        phone: u.phone || profile?.phone || "",
        isActive,
        provider: (u.app_metadata?.providers ?? [u.app_metadata?.provider ?? "email"]).join(", "),
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at || null,
        hasProfile: !!profile,
        staffCode: role === "STAFF" || role === "ADMIN" ? (staffMap[u.id]?.staff_code ?? "") : undefined,
        staffStatus: role === "STAFF" || role === "ADMIN" ? (staffMap[u.id]?.status ?? "active") : null,
        position: role === "ENTREPRENEUR" ? (entMap[u.id]?.position ?? "") : undefined,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── POST — Check email, assign STAFF role, and write to staffs table ──────────
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client configuration");

    // 1. Authorization Guard
    const guard = await checkAdminGuard();
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { email, name, staffCode, position } = body;

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // 2. Iterate or target filter to locate if user already exists in Auth
    let existingUser: any = null;
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      const found = data?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (found) {
        existingUser = found;
        break;
      }
      if (!data?.users || data.users.length < perPage) break;
      page++;
    }

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      userId = existingUser.id;

      // Update existing account's Auth Metadata parameters to STAFF role
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { 
          ...existingUser.user_metadata, 
          role: "STAFF" 
        }
      });
      if (updateError) throw updateError;
    } else {
      isNewUser = true;
      // Setup structural configuration for passwordless provisioning 
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: name || email.split("@")[0], role: "STAFF" },
        // Creates account with password bypass options
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Parse separate structural name tokens contextually
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || email.split("@")[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // 3. Upsert seamlessly into your `staffs` destination table without duplicating IDs
    const { error: dbError } = await supabaseAdmin
      .from("staffs")
      .upsert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        staff_code: staffCode || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "active",
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("ADMIN_API POST: Database sync failure into staffs table:", dbError);
      throw new Error(`Database record failed: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: isNewUser 
        ? "New staff user record completely deployed." 
        : "Existing email found! Successfully elevated user profile role to STAFF status."
    });

  } catch (error: any) {
    console.error("ADMIN_API POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH — update user active status ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client configuration");

    const guard = await checkAdminGuard();
    if (!guard.authorized) return guard.response!;

    const { userId, isActive } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive must be a boolean" }, { status: 400 });
    }

    if (guard.callerId === userId && !isActive) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;
    if (!existing?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const banDuration = isActive ? "none" : "876000h";

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
      user_metadata: {
        ...existing.user.user_metadata,
        is_active: isActive,
      },
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ADMIN_API PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE — delete user from auth ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client configuration");

    const guard = await checkAdminGuard();
    if (!guard.authorized) return guard.response!;

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    if (guard.callerId === userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ADMIN_API DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}