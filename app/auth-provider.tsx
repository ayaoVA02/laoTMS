'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAttractionStore } from '@/stores/attraction-store';
import { useTravelPlanStore } from '@/stores/travel-plan-store';
import { supabase } from '@/lib/supabase';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // ✅ correct import for App Router

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const router = useRouter();

  useEffect(() => {
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);

        if (event === 'SIGNED_OUT') {
          useAuthStore.setState({ user: null, isAuthenticated: false, loading: false });
          useAttractionStore.setState({ favorites: [] });
          useTravelPlanStore.setState({ plans: [], selectedPlan: null });

        } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const role = session.user.user_metadata?.role;

          if (!role) {
            // No role = Google login or incomplete signup → go to onboarding
            router.push('/onboarding');
          } else {
            // Has role = normal login → restore session
            await initAuth();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initAuth, router]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#333', color: '#fff' },
          success: { style: { background: '#22c55e', color: '#fff' } },
          error: { style: { background: '#ef4444', color: '#fff' } },
        }}
      />
      {children}
    </>
  );
}