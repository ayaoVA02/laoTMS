import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type UserRole = 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole | null;
 user_metadata?: {
  onboarding_completed: boolean;
 }
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    role: UserRole | null,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; error?: string }>;
  initAuth: () => Promise<void>;
}

async function fetchUserProfile(userId: string, role: UserRole) {
  const table =
    role === 'ENTREPRENEUR' ? 'entrepreneurs' :
      role === 'TOURIST' ? 'tourists' :
        'staffs';

  const { data } = await supabase
    .from(table)
    .select('first_name, last_name, profile_img')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    profileData: (data as Record<string, string>) ?? {},
    profileImg: (data as any)?.profile_img ?? '',
  };
}

// ─── Build a User object from a Supabase session ──────────────────────────────
// Returns null ONLY if the account is explicitly inactive.
// Google users may not have `role` in metadata on first sign-in —
// we default to TOURIST instead of signing them out.
async function buildUserFromSession(
  session: NonNullable<
    Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']
  >
): Promise<User | null> {
  const meta = session.user.user_metadata ?? {};
  const role = (meta.role as UserRole | undefined) ?? 'TOURIST'; // ✅ default instead of bail

  const isActive = meta.is_active ?? true;
  if (!isActive) {
    console.warn('buildUserFromSession: account is inactive');
    return null;
  }

  try {
    const { profileData, profileImg } = await fetchUserProfile(session.user.id, role);

    const name =
      profileData.first_name
        ? `${profileData.first_name} ${profileData.last_name ?? ''}`.trim()
        : meta.full_name ?? meta.first_name ?? role;

    return {
      id: session.user.id,
      name,
      email: session.user.email!,
      avatar: profileImg || meta.avatar_url || meta.picture || '',
      role,
    };
  } catch (err) {
    console.error('buildUserFromSession: profile fetch failed', err);
    // Still return a minimal user rather than null — profile table may just
    // not exist yet for a brand-new Google sign-up
    return {
      id: session.user.id,
      name: meta.full_name ?? meta.first_name ?? meta.email ?? 'User',
      email: session.user.email!,
      avatar: meta.avatar_url ?? meta.picture ?? '',
      role,
    };
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isAuthReady: false,

  // ── Called once on app mount by AuthProvider ───────────────────────────────
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const user = await buildUserFromSession(session);
        if (user) {
          set({ user, isAuthenticated: true, loading: false, isAuthReady: true });
          return;
        }
      }

      // If getSession fails, try getUser (more reliable on some browsers/production)
      const { data: { user: sbUser } } = await supabase.auth.getUser();

      if (!sbUser) {
        set({ user: null, isAuthenticated: false, loading: false, isAuthReady: true });
        return;
      }

      // Found user but no session yet? Build user object manually from sbUser
      const role = (sbUser.user_metadata?.role as UserRole) ?? 'TOURIST';
      const { profileData, profileImg } = await fetchUserProfile(sbUser.id, role);
      const name = profileData.first_name 
        ? `${profileData.first_name} ${profileData.last_name ?? ''}`.trim()
        : sbUser.user_metadata?.full_name ?? 'User';

      set({ 
        user: { id: sbUser.id, name, email: sbUser.email!, avatar: profileImg || sbUser.user_metadata?.avatar_url || '', role },
        isAuthenticated: true, 
        loading: false, 
        isAuthReady: true 
      });

    } catch (err) {
      console.error('initAuth error:', err);
      set({ loading: false, isAuthReady: true });
    }
  },

  // ── Email / password login ─────────────────────────────────────────────────
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        set({ loading: false });
        return { success: false, error: 'Invalid email or password' };
      }

      const meta = authData.user.user_metadata ?? {};
      const isActive = meta.is_active ?? true;

      if (!isActive) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { success: false, error: 'Account is disabled' };
      }

      // ✅ buildUserFromSession already handles missing role gracefully
      const user = await buildUserFromSession(authData.session!);

      if (!user) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { success: false, error: 'Account is disabled' };
      }

      set({ user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: 'Login failed' };
    }
  },

  // ── Registration ───────────────────────────────────────────────────────────
  register: async (email, password, role, firstName, lastName) => {
    set({ loading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            role: role || 'TOURIST', 
            is_active: true, 
            first_name: firstName, 
            last_name: lastName,
            onboarding_completed: false // Initialize as false
          },
        },
      });

      if (authError || !authData.user) {
        set({ loading: false });
        return { success: false, error: authError?.message ?? 'Registration failed' };
      }

      // ✅ 1. ตรวจสอบก่อนเลย: ถ้าไม่มี Session แปลว่าติดยันยืนยันอีเมล (ให้หยุดทำงานตรงนี้และแจ้งเตือนผู้ใช้)
      if (!authData.session && authData.user) {
        set({ loading: false, isAuthReady: true });
        return { success: true, message: 'Registration successful! Please check your email to confirm your account.' };
      }

      // Note: We no longer insert into profile tables here because 
      // role selection and profile creation now happen in the Onboarding flow.

      set({
        user: {
          id: authData.user.id,
          name: `${firstName} ${lastName}`.trim(),
          email,
          avatar: '',
          role,
        },
        isAuthenticated: true,
        loading: false,
        isAuthReady: true
      });

      return { success: true, authData };
    } catch {
      set({ loading: false });
      return { success: false, error: 'Registration failed' };
    }
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    set({ loading: true })
    try {

      await fetch('api/logout/', { method: 'POST' })

    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // ล้างสถานะในแอป
      set({ user: null, isAuthenticated: false, loading: false, isAuthReady: true });

      // บังคับรีเฟรชหน้าเว็บ เพื่อให้ Middleware ทำงานใหม่ด้วยคุกกี้ที่ว่างเปล่า
      window.location.href = '/auth/login';
    }
  }
}));

// ─── Global auth-state listener ───────────────────────────────────────────────
// Registered once when the module loads. Handles OAuth redirects (Google),
// token refreshes, and tab-sync logout.
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[onAuthStateChange]', event, session?.user?.id);
  const store = useAuthStore.getState();

  if (event === 'SIGNED_OUT' || !session) {
    // Only reset if we aren't in the middle of initAuth
    if (event === 'INITIAL_SESSION') return; 
    
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      isAuthReady: true,
    });
    return;
  }

  // Handle session initialization and updates
  if (
    event === 'INITIAL_SESSION' ||
    event === 'SIGNED_IN' ||
    event === 'TOKEN_REFRESHED' ||
    event === 'USER_UPDATED'
  ) {
    // Update basic state synchronously to prevent deadlocks
    const meta = session.user.user_metadata ?? {};
    const role = (meta.role as UserRole) ?? 'TOURIST';
    
    useAuthStore.setState({
      user: store.user?.id === session.user.id ? store.user : { 
        id: session.user.id, 
        name: meta.full_name ?? session.user.email!, 
        email: session.user.email!, 
        avatar: meta.avatar_url ?? '', 
        role 
      },
      isAuthenticated: true,
      loading: false,
      isAuthReady: true,
    });

    // Fetch detailed profile in background (non-blocking)
    if (event !== 'INITIAL_SESSION' || !store.user) {
      buildUserFromSession(session).then(user => {
        if (user) useAuthStore.setState({ user });
      });
    }
  }
});