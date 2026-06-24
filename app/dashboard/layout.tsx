// app/dashboard/layout.tsx
'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Loader2, ShieldAlert } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// The specific sub-routes that require strict ADMIN clearance
const ADMIN_ONLY_ROUTES = [
  '/dashboard/setting',
  '/dashboard/analytics',
  '/dashboard/attraction',
  '/dashboard/users'
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady, isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Determine if the user is currently trying to view a protected sub-page
  const isTryingToAccessAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname === route);
  const isAdmin = user?.role === 'ADMIN';

  // Optional: Automatically redirect unauthenticated users back to login if they drop into the dashboard
  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace('/dashboard'); // Falls back to your LoginRequired panel
    }
  }, [isAuthReady, isAuthenticated, router]);

  // 1. Show global loading state while checking user credentials
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-sm text-muted-foreground">Loading platform session...</p>
        </div>
      </div>
    );
  }

  // 2. Security Intercept: If they are on an admin route but aren't an ADMIN
  if (isTryingToAccessAdminRoute && !isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-center p-6 bg-background">
        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-950/20 rounded-full mb-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Administrative Access Required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Your account permissions do not grant clearance for this system domain. Direct URL bypass requests are blocked.
        </p>
        <button
          onClick={() => router.replace('/dashboard')}
          className="mt-6 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all shadow-sm"
        >
          Return to Dashboard Hub
        </button>
      </div>
    );
  }

  // 3. Render content safely if everything checks out
  return <>{children}</>;
}