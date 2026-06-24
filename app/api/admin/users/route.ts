
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

// ── POST — Create, Elevate, Update, or Reassign User Roles ───────────────────
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) throw new Error("Missing admin client configuration");

    // 1. Authorization Guard
    const guard = await checkAdminGuard();
    if (!guard.authorized) return guard.response!;

    const body = await req.json();
    const { 
      userId: existingUserId, 
      email, 
      name, 
      staffCode, 
      phone, 
      nationality, 
      province, 
      district, 
      village, 
      gender,
      status,
      role = "STAFF" // Expected inputs: "STAFF" | "ADMIN" | "TOURIST"
    } = body;

    let userId = existingUserId;
    let isNewUser = false;

    // 2. Auth Context Processing
    if (!userId) {
      if (!email) {
        return NextResponse.json({ error: "Email parameter is required for new accounts" }, { status: 400 });
      }

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

      if (existingUser) {
        userId = existingUser.id;
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { 
            ...existingUser.user_metadata, 
            role: role 
          }
        });
        if (updateError) throw updateError;
      } else {
        isNewUser = true;
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { name: name || email.split("@")[0], role: role },
        });

        if (createError) throw createError;
        userId = newUser.user.id;
      }
    } else {
      // Modifying an existing user account's core application role directly
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authUser?.user) {
        const { error: roleSyncError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { 
            ...authUser.user.user_metadata, 
            role: role 
          }
        });
        if (roleSyncError) throw roleSyncError;
      }
    }

    // Split text names safely
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 3. Conditional Management of the `public.staffs` DB Row
    if (role === "TOURIST") {
      // CRITICAL UPDATE: If role is changed to TOURIST, purge their record from the staffs table entirely
      const { error: deleteError } = await supabaseAdmin
        .from("staffs")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;
    } else {
      // If role is STAFF or ADMIN, ensure their staff credentials exist/are updated
      const { data: currentStaff } = await supabaseAdmin
        .from("staffs")
        .select("staff_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (currentStaff) {
        const { error: updateDbError } = await supabaseAdmin
          .from("staffs")
          .update({
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            staff_code: staffCode || undefined,
            phone: phone ?? "",
            nationality: nationality ?? "",
            province: province ?? "",
            district: district ?? "",
            village: village ?? "",
            gender: gender ?? null,
            status: status ?? "active"
          })
          .eq("user_id", userId);

        if (updateDbError) throw updateDbError;
      } else {
        const { error: insertDbError } = await supabaseAdmin
          .from("staffs")
          .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            staff_code: staffCode || `STF-${Math.floor(1000 + Math.random() * 9000)}`,
            phone: phone || "",
            nationality: nationality || "",
            province: province || "",
            district: district || "",
            village: village || "",
            gender: gender || null,
            status: status || "active"
          });

        if (insertDbError) throw insertDbError;
      }
    }

    return NextResponse.json({
      success: true,
      message: role === "TOURIST"
        ? `User role updated to Tourist. Profile row removed from internal staff roster.`
        : `User role synchronized. Staff parameters updated.`
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