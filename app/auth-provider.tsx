'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    OneSignalDeferred?: ((onesignal: any) => void)[];
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    // 1. Initialize Auth state on mount to restore session from storage/cookies
    initAuth();

    // ── OneSignal ────────────────────────────────────────────────────────────
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
      if (OneSignal.config?.appId) return;

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) {
        console.warn('OneSignal: NEXT_PUBLIC_ONESIGNAL_APP_ID is missing');
        return;
      }

      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        promptOptions: {
          slidedown: {
            prompts: [{
              type: 'push',
              autoPrompt: true,
              text: {
                actionMessage: 'Stay updated on your attractions and travel plans',
                acceptButton: 'Allow',
                cancelButton: 'Later',
              },
              delay: { pageViews: 1, timeDelay: 2 },
            }],
          },
        },
      });

      const { data: { session } } = await supabase.auth.getSession();

      // console.log("Auth provider Access TK:", session?.access_token); // Debug: log access token
      if (session?.user) {
        await OneSignal.login(session.user.id);
      }
    });

    return () => {
      if (addedScript && script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [initAuth]);

  return <>{children}</>;
}