'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAttractionStore } from '@/stores/attraction-store';
import { useTravelPlanStore } from '@/stores/travel-plan-store';
import { supabase } from '@/lib/supabase';
import { Toaster } from 'react-hot-toast';

// ── OneSignal types (avoid import errors) ───────────────────────
declare global {
  interface Window {
    OneSignalDeferred?: ((onesignal: any) => void)[];
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const router = useRouter();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initAuth();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          useAuthStore.setState({ user: null, isAuthenticated: false, loading: false });
          useAttractionStore.setState({ favorites: [] });
          useTravelPlanStore.setState({ plans: [], selectedPlan: null });

        } else if (event === 'SIGNED_IN' && session) {
          const role = session.user.user_metadata?.role;

          if (!role) {
            // No role = Google login or incomplete signup → go to onboarding
            router.push('/onboarding');
          } else {
            // Has role = normal login → restore session
            await initAuth();
          }
        } else {
          console.warn('OneSignal pushSubscription and fallback listener not available yet');
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await OneSignal.login(session.user.id);
        console.log('✅ OneSignal linked:', session.user.id);
      }
    });

    return () => {
      if (addedScript && script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

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
