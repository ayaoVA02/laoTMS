'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    const scriptSrc = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    let addedScript = false;
    let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

    if (!script) {
      script = document.createElement('script');
      script.src = scriptSrc;
      script.defer = true;
      document.head.appendChild(script);
      addedScript = true;
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      if (OneSignal.config?.appId) {
        console.log('⚠️ OneSignal: already initialized, skipping duplicate init');
      } else {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: true,
                  text: {
                    actionMessage: 'Stay updated on your attractions and travel plans',
                    acceptButton: 'Allow',
                    cancelButton: 'Later',
                  },
                  delay: {
                    pageViews: 1,
                    timeDelay: 2,
                  },
                },
              ],
            },
          },
        });
        console.log('🚀 OneSignal initialized successfully!');

        const currentSubscription = OneSignal.User?.pushSubscription;
        if (currentSubscription?.id) {
          console.log('👉 CURRENT PLAYER ID:', currentSubscription.id);
        }

        // Guard against undefined pushSubscription (some SDK states may not expose it immediately)
        if (currentSubscription && typeof currentSubscription.addEventListener === 'function') {
          currentSubscription.addEventListener('change', (event: any) => {
            if (event?.current?.id) {
              console.log('🎉 NEW PLAYER ID REGISTERED:', event.current.id);
            }
          });
        } else if (typeof OneSignal.on === 'function') {
          // Fallback: use SDK event emitter if available
          try {
            OneSignal.on('subscriptionChange', (state: any) => {
              if (state?.id) {
                console.log('🎉 NEW PLAYER ID REGISTERED (fallback):', state.id);
              }
            });
          } catch (e) {
            console.warn('OneSignal fallback subscription listener failed', e);
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