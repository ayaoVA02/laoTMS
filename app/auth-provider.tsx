'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
             console.log('Auth event:', event, session);
        if (event === 'SIGNED_OUT' || !session) {
          useAuthStore.setState({ user: null, isAuthenticated: false });
        } else if (event === 'SIGNED_IN' && session) {
          await initAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}