// import { create } from 'zustand';
// import { supabase } from '@/lib/supabase';

// export type UserRole = 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar: string;
//   role: UserRole;
// }

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
//   logout: () => void;
//   loginAsDemo: (role: UserRole) => void;
//   register: (email: string, password: string, role: UserRole, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
// }

// const demoUsers: Record<UserRole, User> = {
//   ADMIN: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Admin User', email: 'admin@laotms.la', avatar: '', role: 'ADMIN' },
//   STAFF: { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'Phet Souvannavong', email: 'staff@laotms.la', avatar: '', role: 'STAFF' },
//   ENTREPRENEUR: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: 'Somsak Vongvichit', email: 'somsak@laotms.la', avatar: '', role: 'ENTREPRENEUR' },
//   TOURIST: { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', name: 'John Traveler', email: 'john@travel.com', avatar: '', role: 'TOURIST' },
// };

// function getProfileName(role: UserRole, data: Record<string, string>): string {
//   if (role === 'ENTREPRENEUR') return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Entrepreneur';
//   if (role === 'TOURIST') return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Tourist';
//   if (role === 'STAFF') return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Staff';
//   if (role === 'ADMIN') return `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Admin';
//   return 'User';
// }




// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,
//   loading: false,

//   login: async (email: string, password: string) => {
//     set({ loading: true });
//     try {
//       const { data: userData, error } = await supabase
//         .from('users')
//         .select('user_id, email, role, is_active')
//         .eq('email', email)
//         .eq('is_active', true)
//         .maybeSingle();

//       if (error || !userData) {
//         set({ loading: false });
//         return { success: false, error: 'Invalid email or password' };
//       }

//       const role = userData.role as UserRole;
//       let profileData: Record<string, string> = {};
//       let profileImg = '';

//       if (role === 'ENTREPRENEUR') {
//         const { data: profile } = await supabase
//           .from('entrepreneurs')
//           .select('first_name, last_name, profile_img')
//           .eq('user_id', userData.user_id)
//           .maybeSingle();
//         if (profile) { profileData = profile; profileImg = profile.profile_img || ''; }
//       } else if (role === 'TOURIST') {
//         const { data: profile } = await supabase
//           .from('tourists')
//           .select('first_name, last_name, profile_img')
//           .eq('user_id', userData.user_id)
//           .maybeSingle();
//         if (profile) { profileData = profile; profileImg = profile.profile_img || ''; }
//       } else if (role === 'STAFF' || role === 'ADMIN') {
//         const { data: profile } = await supabase
//           .from('staffs')
//           .select('first_name, last_name, profile_img')
//           .eq('user_id', userData.user_id)
//           .maybeSingle();
//         if (profile) { profileData = profile; profileImg = profile.profile_img || ''; }
//       }

//       const user: User = {
//         id: userData.user_id,
//         name: getProfileName(role, profileData),
//         email: userData.email,
//         avatar: profileImg,
//         role,
//       };

//       set({ user, isAuthenticated: true, loading: false });
//       return { success: true };
//     } catch {
//       set({ loading: false });
//       return { success: false, error: 'Login failed' };
//     }
//   },

//   register: async (email, password, role, firstName, lastName) => {
//     set({ loading: true });
//     try {
//       const { data: existing } = await supabase
//         .from('users')
//         .select('user_id')
//         .eq('email', email)
//         .maybeSingle();

//       if (existing) {
//         set({ loading: false });
//         return { success: false, error: 'Email already registered' };
//       }

//       const { data: userData, error } = await supabase
//         .from('users')
//         .insert({ email, password_hash: password, role })
//         .select('user_id, email, role')
//         .single();

//       if (error || !userData) {
//         set({ loading: false });
//         return { success: false, error: 'Registration failed' };
//       }

//       const userId = userData.user_id;
//       const userRole = userData.role as UserRole;

//       if (userRole === 'ENTREPRENEUR') {
//         await supabase.from('entrepreneurs').insert({ user_id: userId, first_name: firstName, last_name: lastName });
//       } else if (userRole === 'TOURIST') {
//         await supabase.from('tourists').insert({ user_id: userId, first_name: firstName, last_name: lastName });
//       } else if (userRole === 'STAFF') {
//         await supabase.from('staffs').insert({ user_id: userId, first_name: firstName, last_name: lastName });
//       }

//       const user: User = {
//         id: userId,
//         name: `${firstName} ${lastName}`,
//         email: userData.email,
//         avatar: '',
//         role: userRole,
//       };

//       set({ user, isAuthenticated: true, loading: false });
//       return { success: true };
//     } catch {
//       set({ loading: false });
//       return { success: false, error: 'Registration failed' };
//     }
//   },

//   logout: () => set({ user: null, isAuthenticated: false }),
//   loginAsDemo: (role) => set({ user: demoUsers[role], isAuthenticated: true }),
// }));








import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type UserRole = 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  register: (email: string, password: string, role: UserRole, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  initAuth: () => Promise<void>;
}

const demoUsers: Record<UserRole, User> = {
  ADMIN: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Admin User', email: 'admin@laotms.la', avatar: '', role: 'ADMIN' },
  STAFF: { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'Phet Souvannavong', email: 'staff@laotms.la', avatar: '', role: 'STAFF' },
  ENTREPRENEUR: { id: 'c3d4e5f6-a7b8-9012-cdef-123456789012', name: 'Somsak Vongvichit', email: 'somsak@laotms.la', avatar: '', role: 'ENTREPRENEUR' },
  TOURIST: { id: 'd4e5f6a7-b8c9-0123-defa-234567890123', name: 'John Traveler', email: 'john@travel.com', avatar: '', role: 'TOURIST' },
};

async function fetchUserProfile(userId: string, role: UserRole) {
  let profileData: Record<string, string> = {};
  let profileImg = '';

  if (role === 'ENTREPRENEUR') {
    const { data } = await supabase
      .from('entrepreneurs')
      .select('first_name, last_name, profile_img')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) { profileData = data; profileImg = data.profile_img || ''; }
  } else if (role === 'TOURIST') {
    const { data } = await supabase
      .from('tourists')
      .select('first_name, last_name, profile_img')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) { profileData = data; profileImg = data.profile_img || ''; }
  } else if (role === 'STAFF' || role === 'ADMIN') {
    const { data } = await supabase
      .from('staffs')
      .select('first_name, last_name, profile_img')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) { profileData = data; profileImg = data.profile_img || ''; }
  }

  return { profileData, profileImg };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  // Call this on app start to restore session
  initAuth: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ loading: false }); return; }

      const meta = session.user.user_metadata;
      const role = meta?.role as UserRole || 'TOURIST';
      const isActive = meta?.is_active ?? true;

      if (!isActive) {
        await supabase.auth.signOut();
        set({ loading: false });
        return;
      }

      const { profileData, profileImg } = await fetchUserProfile(session.user.id, role);

      set({
        user: {
          id: session.user.id,
          name: `${profileData.first_name || meta?.first_name || ''} ${profileData.last_name || meta?.last_name || ''}`.trim() || role,
          email: session.user.email!,
          avatar: profileImg,
          role,
        },
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      console.error('initAuth error:', err);
      set({ loading: false });
    }
  },

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

      // Get fields from user_metadata instead of users table
      const meta = authData.user.user_metadata;
      const role = meta?.role as UserRole || 'TOURIST';
      const isActive = meta?.is_active ?? true;

      if (!isActive) {
        await supabase.auth.signOut();
        set({ loading: false });
        return { success: false, error: 'Account is disabled' };
      }

      const { profileData, profileImg } = await fetchUserProfile(authData.user.id, role);

      set({
        user: {
          id: authData.user.id,
          name: `${profileData.first_name || meta?.first_name || ''} ${profileData.last_name || meta?.last_name || ''}`.trim() || role,
          email: authData.user.email!,
          avatar: profileImg,
          role,
        },
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: 'Login failed' };
    }
  },

  register: async (email, password, role, firstName, lastName) => {
    set({ loading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            is_active: true,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      console.log('Registration result:', { authData, authError });

      if (authError || !authData.user) {
        set({ loading: false });
        return { success: false, error: authError?.message || 'Registration failed' };
      }

      if (!authData.session) {
        set({ loading: false });
        return {
          success: true,
          error: 'Please check your email to confirm your account',
        };
      }

      const userId = authData.user.id;

      // Still insert into role-specific profile tables
      if (role === 'ENTREPRENEUR') {
        await supabase.from('entrepreneurs').insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName
        });
      } else if (role === 'TOURIST') {
        await supabase.from('tourists').insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName
        });
      } else if (role === 'STAFF') {
        await supabase.from('staffs').insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName
        });
      }

      set({
        user: {
          id: userId,
          name: `${firstName} ${lastName}`.trim(),
          email,
          avatar: '',
          role,
        },
        isAuthenticated: true,
        loading: false,
      });

      return { success: true };
    } catch {
      set({ loading: false });
      return { success: false, error: 'Registration failed' };
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  loginAsDemo: (role) => set({ user: demoUsers[role], isAuthenticated: true }),
}));